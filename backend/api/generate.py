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
    numberOfRounds: int
    eventCompany: str | None = None
    eventLocation: str | None = None
    eventDate: str | None = None


class FreeSessionConfig(BaseModel):
    participantCount: int
    tableCountLabel: int
    numberOfRounds: int
    eventCompany: str | None = None
    eventLocation: str | None = None
    eventDate: str | None = None

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
        numberOfRounds=config.numberOfRounds
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Créer une nouvelle session dans la base de données avec les rounds_data
    new_session = MeetingSession(
        number_of_rounds=config.numberOfRounds,
        number_of_tables=config.tableCountLabel,
        rounds_data=result.get("rounds", []),
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    metadata = result.get("metadata", {})
    metadata.update({
        "plan_version": "paid",
        "event_company": config.eventCompany,
        "event_location": config.eventLocation,
        "event_date": config.eventDate,
    })

    return {
        "session_id": new_session.id,
        "metadata": metadata,
        "rounds": result.get("rounds", []),
        "message": "Session générée avec succès. Les participants peuvent consulter leurs tables."
    }


@router.post("/generate-free")
def create_free_session(config: FreeSessionConfig, db: Session = Depends(get_db)):
    if config.participantCount <= 0:
        raise HTTPException(status_code=400, detail="Nombre de participants invalide")

    participants = [str(i + 1) for i in range(config.participantCount)]

    result = generate_rounds(
        participants,
        tableCountLabel=config.tableCountLabel,
        numberOfRounds=config.numberOfRounds
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    new_session = MeetingSession(
        number_of_rounds=config.numberOfRounds,
        number_of_tables=config.tableCountLabel,
        rounds_data=result.get("rounds", []),
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    metadata = result.get("metadata", {})
    metadata.update({
        "plan_version": "free",
        "event_company": config.eventCompany,
        "event_location": config.eventLocation,
        "event_date": config.eventDate,
    })

    return {
        "session_id": new_session.id,
        "metadata": metadata,
        "rounds": result.get("rounds", []),
        "message": "Session générée avec succès. Plan gratuit avec participants numérotés."
    }

@router.post("/end-session/{session_id}")
def end_session(session_id: int, db: Session = Depends(get_db)):
    """
    Termine une session de speed meeting
    """
    session = db.query(MeetingSession).filter(MeetingSession.id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    
    if not session.is_active:
        raise HTTPException(status_code=400, detail="Cette session est déjà terminée")
    
    # Marquer la session comme terminée
    session.is_active = False
    session.ended_at = datetime.datetime.utcnow()
    db.commit()
    
    return {
        "message": "Session terminée avec succès",
        "session_id": session_id,
        "ended_at": session.ended_at
    }