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
    participant_names = [p.name for p in db_participants]
    
    participant_count = len(participant_names)

    if participant_count == 0:
        raise HTTPException(status_code=400, detail="Aucun participant inscrit en base de données.")

    generation_result = generate_rounds(
        participant_count,
        config.tableCountLabel,
        config.sessionDurationLabel,
        config.time_per_round,
    )

    new_session = MeetingSession(
        total_duration_minutes=config.sessionDurationLabel,
        number_of_tables=config.tableCountLabel,
        rounds_data=generation_result
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "session_id": new_session.id,
        "metadata": generation_result.get("metadata"),
        "rounds": generation_result.get("rounds")
    }
