from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Participant, MeetingSession, Table, ParticipantTableAssignment
from core.logic import generate_rounds
import datetime

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
        participantCountLabel=participantCountLabel,
        tableCountLabel=config.tableCountLabel,
        sessionDurationLabel=config.sessionDurationLabel,
        time_per_round=config.time_per_round
    )
    
    # Créer une nouvelle session dans la base de données
    new_session = MeetingSession(
        total_duration_minutes=config.sessionDurationLabel,
        number_of_tables=config.tableCountLabel,
        rounds_data=result.get("rounds", []),
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_session)
    db.flush()  # Obtenir l'ID de la session
    
    # Créer les tables si elles n'existent pas
    tables = {}
    for t_id in range(1, config.tableCountLabel + 1):
        table = Table(name=f"Table {t_id}")
        db.add(table)
        db.flush()
        tables[t_id] = table.id
    
    # Enregistrer les affectations participant-table-round
    participant_name_to_id = {p.name: p.id for p in db_participants}
    
    for round_data in result.get("rounds", []):
        round_number = round_data.get("round", 1)
        for table_data in round_data.get("tables", []):
            table_id = table_data.get("table_id", 1)
            members = table_data.get("members", [])
            
            for member_name in members:
                # Ne pas enregistrer les participants "rien"
                if "rien" not in member_name and member_name in participant_name_to_id:
                    assignment = ParticipantTableAssignment(
                        participant_id=participant_name_to_id[member_name],
                        table_id=tables[table_id],
                        session_id=new_session.id,
                        round_number=round_number
                    )
                    db.add(assignment)
    
    db.commit()
    
    return {
        "session_id": new_session.id,
        "metadata": result.get("metadata", {}),
        "rounds": result.get("rounds", []),
        "message": "Session générée avec succès. Les participants peuveent consulter leurs tables."
    }