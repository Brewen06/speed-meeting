import io
import pandas as pd

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant, MeetingSession, ParticipantTableAssignment
from pydantic import BaseModel
from auth import get_current_admin

router = APIRouter()

@router.post("/participants/upload")
async def upload_participants(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Format de fichier non supporté (CSV ou XLSX uniquement)")

    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))

        column_name = "nom" if "nom" in df.columns.str.lower() else df.columns[0]
        names = df[column_name].dropna().astype(str).tolist()

        if not names:
            return {"message": "Aucun nom trouvé dans le fichier."}

        new_participants = [Participant(name=n.strip()) for n in names]
        db.bulk_save_objects(new_participants)
        db.commit()

        return {
            "filename": file.filename,
            "participants_added": len(names),
            "sample": names[:5] 
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'import : {str(e)}")

# Schema pour l'ajout d'un participant
class ParticipantCreate(BaseModel):
    name: str

@router.get("/participants")
def get_all_participants(db: Session = Depends(get_db)):
    
    return db.query(Participant).all()

@router.post("/participants")
def add_participant(participant: ParticipantCreate, db: Session = Depends(get_db)):
   
    new_p = Participant(name=participant.name)
    db.add(new_p)
    db.commit()
    db.refresh(new_p)
    return new_p

@router.delete("/participants/clear")
def clear_participants(
    db: Session = Depends(get_db), 
    admin: str = Depends(get_current_admin) # <--- La route est maintenant protégée !
):
    db.query(Participant).delete()
    db.commit()
    return {"message": "Nettoyage effectué par l'admin"}

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

@router.get("/participants/{participant_id}/tables/{session_id}")
def get_participant_tables(
    participant_id: int,
    session_id: int,
    db: Session = Depends(get_db)
):
    """
    Récupère toutes les tables assignées à un participant pour une session donnée
    """
    # Vérifier que le participant existe
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant non trouvé")
    
    # Vérifier que la session existe
    session = db.query(MeetingSession).filter(MeetingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    
    # Récupérer les affectations du participant pour cette session
    assignments = db.query(ParticipantTableAssignment).filter(
        ParticipantTableAssignment.participant_id == participant_id,
        ParticipantTableAssignment.session_id == session_id
    ).order_by(ParticipantTableAssignment.round_number).all()
    
    if not assignments:
        return {
            "participant_id": participant_id,
            "participant_name": participant.name,
            "session_id": session_id,
            "tables": []
        }
    
    tables_info = []
    for assignment in assignments:
        tables_info.append({
            "round_number": assignment.round_number,
            "table_id": assignment.table_id,
            "table_name": assignment.table.name if assignment.table else f"Table {assignment.table_id}"
        })
    
    return {
        "participant_id": participant_id,
        "participant_name": participant.name,
        "session_id": session_id,
        "tables": tables_info
    }
