from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# SCHEMAS DE BASE

class ParticipantBase(BaseModel):
    id: int
    nom: str
    prenom: str
    mail: Optional[str] = None
    profession: Optional[str] = None
    entreprise: Optional[str] = None
    thematique_interet: Optional[str] = None

class ParticipantCreate(ParticipantBase):
    pass

class MeetingSessionBase(BaseModel):
    nom: str
    date: datetime
    temps_total: int
    statut: str = "planifié"  # planifié, en cours, terminé

class TableBase(BaseModel):
    numero: int
    x: float
    y: float
    capacite: int

class RoundBase(BaseModel): 
    numero: int
    heure_debut: datetime
    duree_minutes: int  # en minutes

class AffectationBase(BaseModel):
    id_participant: int
    id_table: int
    id_round: int
    
# SCHEMAS POUR LA FRONTEND

class Participant(ParticipantBase):
    id: int
    model_config = ConfigDict(from_attributes=True) 

class MeetingSession(MeetingSessionBase):
    id: int
    participants: List[Participant] = []
    model_config = ConfigDict(from_attributes=True)

class Table(TableBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class Round(RoundBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class Affectation(AffectationBase):
    id: int
    participant: Optional[Participant] = None
    table: Optional[Table] = None
    round_info: Optional[Round] = None 
    
    model_config = ConfigDict(from_attributes=True)

# --- SCHEMA DE RÉPONSE POUR L'IA ---
# Ce que l'IA renvoie après avoir calculé les rotations
class SpeedMeetingResult(BaseModel):
    meetingsession_id: int
    total_rounds: int
    affectations: List[Affectation]
    message: str