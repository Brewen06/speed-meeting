import io
import pandas as pd

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant, MeetingSession, ParticipantTableAssignment
from pydantic import BaseModel
from api.auth import get_current_admin
from core.config import settings

router = APIRouter()

@router.post("/participants/upload")
async def upload_participants(
    file: UploadFile = File(...),
    column_order: str | None = Form(None),
    db: Session = Depends(get_db), current_admin: Participant = Depends(get_current_admin)
):
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Format de fichier non supporté (CSV, XLSX ou XLS uniquement)")

    try:
        contents = await file.read()

        def read_dataframe(has_header: bool = True) -> pd.DataFrame:
            if file.filename.endswith('.csv'):
                return pd.read_csv(io.BytesIO(contents), header=0 if has_header else None)
            return pd.read_excel(io.BytesIO(contents), header=0 if has_header else None)

        df = read_dataframe(has_header=True)
        normalized_columns = [str(col).strip().lower() for col in df.columns]

        known_header_candidates = {
            "nom", "name", "lastname", "prenom", "prénom", "firstname", "nom complet", 
            "full name", "telephone", "email", "e-mail", "mail", "courriel", "poste", 
            "profession", "job title", "fonction", "métier", "metier", "société", 
            "entreprise", "company", "organization", "organisation", "agence", "business"
        }

        has_known_headers = any(col in known_header_candidates for col in normalized_columns)

        if not has_known_headers:
            df = read_dataframe(has_header=False)
            normalized_columns = [str(col).strip().lower() for col in df.columns]

        def get_column(*candidates):
            for candidate in candidates:
                if candidate in normalized_columns:
                    return df.columns[normalized_columns.index(candidate)]
            return None

        default_order = [item.strip().lower() for item in settings.DEFAULT_IMPORT_COLUMN_ORDER if item.strip()]
        if column_order:
            default_order = [item.strip().lower() for item in column_order.split(",") if item.strip()]

        allowed_fields = {"nom", "prenom", "nom_complet", "telephone", "email", "profession", "entreprise"}
        if any(field not in allowed_fields for field in default_order):
            raise HTTPException(status_code=400, detail="column_order invalide. Champs autorises: nom, prenom, nom_complet, telephone, email, profession, entreprise")

        if not has_known_headers:
            field_to_index = {field: idx for idx, field in enumerate(default_order)}
            col_nom = field_to_index.get("nom")
            col_prenom = field_to_index.get("prenom")
            col_nom_complet = field_to_index.get("nom_complet")
            col_telephone = field_to_index.get("telephone")
            col_email = field_to_index.get("email")
            col_profession = field_to_index.get("profession")
            col_entreprise = field_to_index.get("entreprise")
        else:
            col_nom = get_column("nom", "Nom", "NOM", "last name", "Last name", "Last Name", "lastname", "Lastname", "LASTNAME", "LAST NAME", "nom de famille", "Nom de famille", "Nom de Famille", "Nom De Famille", "NOM DE FAMILLE")
            col_prenom = get_column("prénom", "prenom", "Prénom", "Prenom", "PRENOM", "PRÉNOM", "first name", "First name", "First Name", "firstname", "Firstname", "FIRSTNAME", "FIRST NAME")
            col_nom_complet = get_column("nom complet", "Nom Complet", "Nom complet", "full name", "Full name", "Full Name", "fullname", "Fullname", "FULLNAME", "FULL NAME")
            col_telephone = get_column("telephone", "Telephone", "TELEPHONE", "téléphone", "Téléphone", "TÉLÉPHONE", "phone", "Phone", "PHONE", "mobile", "Mobile", "MOBILE")
            col_email = get_column("email", "Email", "e-mail", "E-mail", "EMAIL", "E-MAIL", "mail", "Mail", "MAIL", "courriel", "Courriel", "COURRIEL", "adresse email", "Adresse email", "Adresse Email", "ADRESSE EMAIL", "adresse e-mail", "Adresse e-mail", "Adresse E-mail", "ADRESSE E-MAIL")
            col_profession = get_column("poste", "Poste", "POSTE", "profession", "Profession", "PROFESSION", "job title", "Job title", "JOB TITLE", "job", "Job", "JOB", "fonction", "Fonction", "FONCTION", "métier", "Métier", "MÉTIER", "metier", "Metier", "METIER", "trvail", "Travail", "TRAVAIL", "occupation", "Occupation", "OCCUPATION")
            col_entreprise = get_column("société", "Société", "SOCIÉTÉ", "entreprise", "Entreprise", "ENTREPRISE", "company", "Company", "COMPANY", "organization", "Organization", "ORGANIZATION", "organisation", "Organisation", "ORGANISATION", "agence", "Agence", "AGENCE", "firm", "Firm", "FIRM", "business", "Business", "BUSINESS")

        participants_rows = []
        def get_value(row, column_ref, is_index: bool = False):
            if column_ref is None:
                return None
            if is_index and (not isinstance(column_ref, int) or column_ref >= len(row)):
                return None
            value = row.iloc[column_ref] if is_index else row[column_ref]
            if pd.isna(value):
                return None
            return str(value).strip()

        is_indexed = not has_known_headers
        for _, row in df.iterrows():
            nom = get_value(row, col_nom, is_index=is_indexed) or ""
            prenom = get_value(row, col_prenom, is_index=is_indexed) or ""
            nom_complet = get_value(row, col_nom_complet, is_index=is_indexed) or ""
            telephone = get_value(row, col_telephone, is_index=is_indexed)
            email = get_value(row, col_email, is_index=is_indexed)
            profession = get_value(row, col_profession, is_index=is_indexed)
            entreprise = get_value(row, col_entreprise, is_index=is_indexed)
            
            if not nom_complet:
                nom_complet = " ".join(part for part in [prenom, nom] if part).strip()

            if not nom_complet:
                continue

            participants_rows.append({
                "nom": nom,
                "prenom": prenom,
                "nom_complet": nom_complet,
                "telephone": telephone or None,
                "email": email or None,
                "profession": profession or None,
                "entreprise": entreprise or None
            })

        if not participants_rows:
            return {"message": "Aucun nom trouvé dans le fichier."}

        added_count = 0
        updated_count = 0
        skipped_count = 0

        for row in participants_rows:
            # Vérifier si le participant existe déjà par email ou nom_complet
            existing = None
            if row["email"]:
                existing = db.query(Participant).filter(Participant.email == row["email"]).first()
            
            if not existing and row["nom_complet"]:
                existing = db.query(Participant).filter(Participant.nom_complet == row["nom_complet"]).first()
            
            if existing:
                # Mettre à jour les informations du participant existant
                if row["nom"]:
                    existing.nom = row["nom"]
                if row["prenom"]:
                    existing.prenom = row["prenom"]
                if row["nom_complet"]:
                    existing.nom_complet = row["nom_complet"]
                if row["telephone"]:
                    existing.telephone = row["telephone"]
                if row["email"]:
                    existing.email = row["email"]
                if row["profession"]:
                    existing.profession = row["profession"]
                if row["entreprise"]:
                    existing.entreprise = row["entreprise"]
                # Réactiver le participant s'il était désactivé
                existing.is_active = True
                updated_count += 1
            else:
                # Ajouter un nouveau participant
                new_participant = Participant(
                    nom=row["nom"],
                    prenom=row["prenom"],
                    nom_complet=row["nom_complet"],
                    telephone=row["telephone"],
                    email=row["email"],
                    profession=row["profession"],
                    entreprise=row["entreprise"],
                    is_active=True
                )
                db.add(new_participant)
                added_count += 1
        
        db.commit()

        return {
            "filename": file.filename,
            "participants_added": added_count,
            "participants_updated": updated_count,
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
    telephone: str | None = None

class ParticipantUpdate(BaseModel):
    nom_complet: str | None = None
    telephone: str | None = None
    email: str | None = None
    profession: str | None = None
    entreprise: str | None = None

class ParticipantActiveUpdate(BaseModel):
    is_active: bool

class ParticipantLogin(BaseModel):
    nom: str | None = None
    prenom: str | None = None
    nom_complet: str | None = None
    email: str | None = None

@router.get("/participants")
def get_all_participants(db: Session = Depends(get_db)):
    
    return db.query(Participant).all()

@router.post("/participants/login")
def login_participant(payload: ParticipantLogin, db: Session = Depends(get_db)):
    # Construire nom_complet si nom/prenom sont fournis
    if payload.nom_complet:
        nom_complet = payload.nom_complet.strip()
    elif payload.nom or payload.prenom:
        parts = []
        if payload.prenom:
            parts.append(payload.prenom.strip())
        if payload.nom:
            parts.append(payload.nom.strip())
        nom_complet = " ".join(parts)
    else:
        nom_complet = ""
    
    email = (payload.email or "").strip() or None

    if not nom_complet and not email:
        raise HTTPException(status_code=400, detail="Nom ou email requis")

    # Rechercher par nom_complet et/ou email
    query = db.query(Participant)
    
    if nom_complet and email:
        # Si les deux sont fournis, chercher avec les deux
        query = query.filter(
            Participant.nom_complet.ilike(nom_complet),
            Participant.email.ilike(email)
        )
    elif nom_complet:
        # Chercher uniquement par nom_complet
        query = query.filter(Participant.nom_complet.ilike(nom_complet))
    elif email:
        # Chercher uniquement par email
        query = query.filter(Participant.email.ilike(email))

    participant = query.first()
    if not participant:
        raise HTTPException(status_code=401, detail="Participant non reconnu")

    return {
        "token": f"participant:{participant.id}",
        "participant": participant
    }

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

    # ajouter un bouton de suppression à côté de chaque participant ainsi qu'un bouton de modification dans l'interface d'administration pour pouvoir corriger les erreurs d'import ou les fautes de frappe, etc.
    


@router.post("/participants/add")
def add_participant(participant: ParticipantCreate, db: Session = Depends(get_db)):
    nom = (participant.nom or "").strip()
    prenom = (participant.prenom or "").strip()
    nom_complet = (participant.nom_complet or "").strip()
    telephone = (participant.telephone or "").strip() or None
    email = (participant.email or "").strip() or None

    if not nom_complet:
        nom_complet = " ".join(part for part in [prenom, nom] if part).strip()

    if not nom_complet:
        raise HTTPException(status_code=400, detail="Nom Complet requis")

    new_p = Participant(
        nom=nom,
        prenom=prenom,
        nom_complet=nom_complet,
        telephone=telephone,
        email=email,
        is_active=True
    )
    db.add(new_p)
    db.commit()
    db.refresh(new_p)
    return new_p

@router.patch("/participants/{participant_id}/active")
def update_participant_active(
    participant_id: int,
    payload: ParticipantActiveUpdate,
    db: Session = Depends(get_db),
    current_admin: Participant = Depends(get_current_admin)
):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant non trouvé")

    participant.is_active = payload.is_active
    db.commit()
    db.refresh(participant)

    return {
        "id": participant.id,
        "nom_complet": participant.nom_complet,
        "is_active": participant.is_active
    }

@router.patch("/participants/{participant_id}")
def update_participant(
    participant_id: int,
    payload: ParticipantUpdate,
    db: Session = Depends(get_db),
    current_admin: Participant = Depends(get_current_admin)
):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant non trouvé")

    if payload.nom_complet is not None:
        nom_complet = payload.nom_complet.strip()
        if not nom_complet:
            raise HTTPException(status_code=400, detail="Nom Complet requis")
        participant.nom_complet = nom_complet

    if payload.email is not None:
        email = payload.email.strip()
        participant.email = email or None

    if payload.telephone is not None:
        telephone = payload.telephone.strip()
        participant.telephone = telephone or None

    if payload.profession is not None:
        profession = payload.profession.strip()
        participant.profession = profession or None

    if payload.entreprise is not None:
        entreprise = payload.entreprise.strip()
        participant.entreprise = entreprise or None

    db.commit()
    db.refresh(participant)
    return participant

@router.delete("/participants/delete") # suppression d'un participant spécifique
def delete_participant(participant_id: int, db: Session = Depends(get_db), current_admin: Participant = Depends(get_current_admin)  ):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant non trouvé")
    
    db.delete(participant)
    db.commit()
    return {"message": f"Le participant '{participant.nom_complet}' a été supprimé avec succès"}


@router.delete("/participants/clear")
def clear_participants(db: Session = Depends(get_db), current_admin: Participant = Depends(get_current_admin)): #N'OUBLIES PAS L'AUTHENTIFICATION ADMIN !!!!!!!!!!!!!!!
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
                        "table_name": table_info.get("table_name", f"Table {table_info.get('table_id')}"),
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

