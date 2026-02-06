from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant
from pydantic import BaseModel
from auth import get_current_admin

router = APIRouter()

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