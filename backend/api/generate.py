from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant, MeetingSession # Import de MeetingSession
from core.logic import generate_rounds

router = APIRouter()

class SessionConfig(BaseModel):
    tableCountLabel: int
    sessionDurationLabel: int
    time_per_round: int = 0

@router.post("/generate")
def create_session(config: SessionConfig, db: Session = Depends(get_db)):
    # 1. Récupération des noms réels depuis la DB
    db_participants = db.query(Participant).all()
    participant_names = [p.name for p in db_participants]
    
    participant_count = len(participant_names)

    # 2. Sécurité : Vérifier qu'on a au moins des participants
    if participant_count == 0:
        raise HTTPException(status_code=400, detail="Aucun participant inscrit en base de données.")

    # 3. Génération via l'algorithme IA
    # Note : Ton algo actuel prend un INT (le compte), on lui passe donc participant_count
    generation_result = generate_rounds(
        participant_count,
        config.tableCountLabel,
        config.sessionDurationLabel,
        config.time_per_round,
    )

    # 4. SAUVEGARDE dans la table MeetingSession
    new_session = MeetingSession(
        total_duration_minutes=config.sessionDurationLabel,
        number_of_tables=config.tableCountLabel,
        rounds_data=generation_result # On stocke tout le dictionnaire JSON
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "session_id": new_session.id,
        "metadata": generation_result.get("metadata"),
        "rounds": generation_result.get("rounds")
    }