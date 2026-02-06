from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant, MeetingSession 
from core.logic import generate_rounds

router = APIRouter()

class SessionConfig(BaseModel):
    tableCountLabel: int
    sessionDurationLabel: int
    time_per_round: int = 0

@router.post("/generate")
def create_session(config: SessionConfig, db: Session = Depends(get_db)):
    
    db_participants = db.query(Participant).all()
    participant_noms = [p.name for p in db_participants]
    
    participantCountLabel = len(participant_noms)

    if not participant_noms:
        raise HTTPException(status_code=400, detail="La liste des participants est vide. Importez un fichier d'abord !")

    result = generate_rounds(
        participant_data=participant_noms, # On passe la liste ici !
        table_count=config.tableCountLabel,
        session_duration=config.sessionDurationLabel,
        time_per_round=config.time_per_round
    )
    
    return result