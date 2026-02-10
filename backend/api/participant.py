import io
import pandas as pd

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant, MeetingSession, ParticipantTableAssignment
from pydantic import BaseModel
from api.auth import get_current_admin

router = APIRouter()

@router.post("/participants/upload")
async def upload_participants(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Format de fichier non supporté (CSV ou XLSX uniquement)")

    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))

        normalized_columns = [str(col).strip().lower() for col in df.columns]
        def get_column(*candidates):
            for candidate in candidates:
                if candidate in normalized_columns:
                    return df.columns[normalized_columns.index(candidate)]
            return None

        col_nom = get_column("nom", "Nom", "NOM", "last name", "Last name", "Last Name", "lastname", "Lastname", "LASTNAME", "LAST NAME")
        col_prenom = get_column("prénom", "prenom", "Prénom", "Prenom", "PRENOM", "PRÉNOM", "first name", "First name", "First Name", "firstname", "Firstname", "FIRSTNAME", "FIRST NAME")
        col_nom_complet = get_column("nom complet", "Nom Complet", "Nom complet", "full name", "Full name", "Full Name", "fullname", "Fullname", "FULLNAME", "FULL NAME")
        col_email = get_column("email", "Email", "e-mail", "E-mail", "EMAIL", "E-MAIL", "mail", "Mail", "MAIL")

        participants_rows = []
        for _, row in df.iterrows():
            nom = str(row[col_nom]).strip() if col_nom and pd.notna(row[col_nom]) else ""
            prenom = str(row[col_prenom]).strip() if col_prenom and pd.notna(row[col_prenom]) else ""
            nom_complet = str(row[col_nom_complet]).strip() if col_nom_complet and pd.notna(row[col_nom_complet]) else ""
            email = str(row[col_email]).strip() if col_email and pd.notna(row[col_email]) else None

            if not nom_complet:
                nom_complet = " ".join(part for part in [prenom, nom] if part).strip()

            if not nom_complet:
                continue

            participants_rows.append({
                "nom": nom,
                "prenom": prenom,
                "nom_complet": nom_complet,
                "email": email or None,
            })

        if not participants_rows:
            return {"message": "Aucun nom trouvé dans le fichier."}

        new_participants = [
            Participant(
                nom=row["nom"],
                prenom=row["prenom"],
                nom_complet=row["nom_complet"],
                email=row["email"],
            )
            for row in participants_rows
        ]
        db.bulk_save_objects(new_participants)
        db.commit()

        return {
            "filename": file.filename,
            "participants_added": len(participants_rows),
            "sample": [row["nom_complet"] for row in participants_rows[:5]]
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'import : {str(e)}")

# Schema pour l'ajout d'un participant
class ParticipantCreate(BaseModel):
    nom: str | None = None
    prenom: str | None = None
    nom_complet: str | None = None
    email: str | None = None

@router.get("/participants")
def get_all_participants(db: Session = Depends(get_db)):
    
    return db.query(Participant).all()

@router.get("/participants/search")
def search_participants(q: str = "", db: Session = Depends(get_db)):
    """
    Recherche des participants par nom complet, nom ou prénom
    Paramètre de requête 'q' : chaîne de recherche (doit contenir au moins 1 caractère)
    """
    if not q or len(q.strip()) < 1:
        return {
            "query": q,
            "results": [],
            "count": 0,
            "message": "Veuillez entrer au moins 1 caractère"
        }
    
    participants = db.query(Participant).filter(
        (Participant.nom_complet.ilike(f"%{q}%")) |
        (Participant.nom.ilike(f"%{q}%")) |
        (Participant.prenom.ilike(f"%{q}%"))
    ).all()
    
    return {
        "query": q,
        "results": participants,
        "count": len(participants)
    }

@router.post("/participants/add")
def add_participant(participant: ParticipantCreate, db: Session = Depends(get_db)):
    nom = (participant.nom or "").strip()
    prenom = (participant.prenom or "").strip()
    nom_complet = (participant.nom_complet or "").strip()
    email = (participant.email or "").strip() or None

    if not nom_complet:
        nom_complet = " ".join(part for part in [prenom, nom] if part).strip()

    if not nom_complet:
        raise HTTPException(status_code=400, detail="Nom Complet requis")

    new_p = Participant(nom=nom, prenom=prenom, nom_complet=nom_complet, email=email)
    db.add(new_p)
    db.commit()
    db.refresh(new_p)
    return new_p

@router.delete("/participants/delete") # suppression d'un participant spécifique
def delete_participant(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant non trouvé")
    
    db.delete(participant)
    db.commit()
    return {"message": f"Le participant '{participant.nom_complet}' a été supprimé avec succès"}


@router.delete("/participants/clear")
def clear_participants(
    db: Session = Depends(get_db), 
    #admin: str = Depends(get_current_admin) # <--- La route est maintenant protégée !
):
    db.query(Participant).delete()
    db.commit()
    return {"message": "Nettoyage effectué"}

# ========== NOUVEAU : RÉCUPÉRER LES TABLES D'UN PARTICIPANT ==========

class ParticipantTableInfo(BaseModel):
    round_number: int
    table_id: int
    table_name: str
    
    class Config:
        from_attributes = True

class ParticipantSessionTables(BaseModel):
    participant_id: int
    participant_name: str
    session_id: int
    tables: list[ParticipantTableInfo]

@router.get("/participants/name/{participant_name}/tables") # pour l'orga
def get_participant_tables_by_name(
    participant_name: str,
    db: Session = Depends(get_db)
):
    """
    Récupère toutes les tables assignées à un participant par son nom pour la dernière session.
    Les données proviennent directement du JSON rounds_data de la session.
    """
    # Vérifier que le participant existe
    participant = db.query(Participant).filter(Participant.nom_complet == participant_name).first()
    if not participant:
        raise HTTPException(status_code=404, detail=f"Participant '{participant_name}' non trouvé")
    
    # Récupérer la dernière session générée
    session = db.query(MeetingSession).order_by(MeetingSession.created_at.desc()).first()
    if not session:
        raise HTTPException(status_code=404, detail="Aucune session n'a été générée")
    
    # Parcourir les rounds_data JSON pour trouver les tables du participant
    tables_assignments = []
    
    if session.rounds_data:
        for round_data in session.rounds_data:
            round_num = round_data.get("round", 0)
            tables_in_round = round_data.get("tables", [])
            
            for table_info in tables_in_round:
                members = table_info.get("members", [])
                # Vérifier si le participant est dans cette table
                if participant_name in members:
                    autres_participants = [m for m in members if m != participant_name and "rien" not in m.lower()]
                    tables_assignments.append({
                        "round_number": round_num,
                        "table_id": table_info.get("table_id"),
                        "table_name": table_info.get("table_name", f"Table {table_info.get('table_id')}"),
                        "autres_participants": autres_participants
                    })
                    break  # Un participant ne peut être qu'à une seule table par round
    
    return {
        "participant_name": participant.nom_complet,
        "session_id": session.id,
        "session_date": session.created_at,
        "total_rounds": len(tables_assignments),
        "tables": tables_assignments,
        "message": f"{participant.nom_complet} doit se rendre aux tables suivantes"
    }

@router.get("/participants/name/{participant_name}/itinerary") # pour le participant (itinéraire simplifié) - peut être utilisé pour l'affichage sur écran ou mobile
def get_participant_itinerary(
    participant_name: str,
    db: Session = Depends(get_db)
):
    """
    Itinéraire simplifié du participant : juste les numéros de tables par rotation
    Format: Rotation 1 = Table 3, Rotation 2 = Table 5, etc.
    """
    # Vérifier que le participant existe
    participant = db.query(Participant).filter(Participant.nom_complet == participant_name).first()
    if not participant:
        raise HTTPException(status_code=404, detail=f"Participant '{participant_name}' non trouvé")
    
    # Récupérer la dernière session générée
    session = db.query(MeetingSession).order_by(MeetingSession.created_at.desc()).first()
    if not session:
        raise HTTPException(status_code=404, detail="Aucune session n'a été générée")
    
    # Construire l'itinéraire simplifié
    itinerary = []
    
    if session.rounds_data:
        for round_data in session.rounds_data:
            round_num = round_data.get("round", 0)
            tables_in_round = round_data.get("tables", [])
            
            for table_info in tables_in_round:
                members = table_info.get("members", [])
                # Vérifier si le participant est dans cette table
                if participant_name in members:
                    itinerary.append({
                        "rotation": round_num,
                        "table": table_info.get("table_id"),
                        "table_name": table_info.get("table_name", f"Table {table_info.get('table_id')}")
                    })
                    break
    
    # Formatage lisible pour l'affichage
    itinerary_text = ", ".join([f"Rotation {item['rotation']} = {item['table_name']}" for item in itinerary])
    
    return {
        "participant": participant.nom_complet,
        "total_rotations": len(itinerary),
        "itinerary": itinerary,
        "itinerary_text": itinerary_text or "Aucune table assignée"
    }

