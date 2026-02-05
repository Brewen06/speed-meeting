from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant
from core.logic import generate_rounds

router = APIRouter()

class SessionConfig(BaseModel):
    table_count: int
    session_duration_minutes: int
    time_per_round_minutes: int

@router.post("/generate-session")
def create_session(config: SessionConfig, db: Session = Depends(get_db)):
    # Récupérer les noms depuis le CSV ou la DB
    # (Ici on simule avec une liste)
    participants = [p.name for p in db.query(Participant).all()]
    
    rounds = generate_rounds(
        len(participants),
        config.table_count,
        config.session_duration_minutes,
        config.time_per_round_minutes,
    )
    
    # Logique de sauvegarde en DB...
    return {"rounds": rounds, "count": len(rounds.get("rounds", []))}