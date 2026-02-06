import io
import pandas as pd

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant
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
