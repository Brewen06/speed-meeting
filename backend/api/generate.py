from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant, MeetingSession
from core.logic import generate_rounds
import datetime

router = APIRouter()

class SessionConfig(BaseModel):
    tableCountLabel: int
    sessionDurationLabel: int
    time_per_round: int = 0

@router.post("/generate")
def create_session(config: SessionConfig, db: Session = Depends(get_db)):
    
    db_participants = db.query(Participant).filter(Participant.is_active.is_(True)).all()
    participant_names = list(set([p.nom_complet for p in db_participants if p.nom_complet]))
    

    if not participant_names:
        raise HTTPException(status_code=400, detail="Aucun participant actif. Activez ou importez des participants d'abord !")

    # Appeler la core route pour générer les rounds
    result = generate_rounds(
        participant_names,
        tableCountLabel=config.tableCountLabel,
        sessionDurationLabel=config.sessionDurationLabel,
        time_per_round=config.time_per_round
    )
    
    # Créer une nouvelle session dans la base de données avec les rounds_data
    new_session = MeetingSession(
        total_duration_minutes=config.sessionDurationLabel,
        number_of_tables=config.tableCountLabel,
        rounds_data=result.get("rounds", []),
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return {
        "session_id": new_session.id,
        "metadata": result.get("metadata", {}),
        "rounds": result.get("rounds", []),
        "message": "Session générée avec succès. Les participants peuvent consulter leurs tables."
    }