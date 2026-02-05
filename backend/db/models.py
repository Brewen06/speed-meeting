from sqlalchemy import Column, Integer, String, JSON, DateTime
from .database import Base
import datetime

class Participant(Base):
    __tablename__ = "participants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class MeetingSession(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    total_duration_minutes = Column(Integer)
    number_of_tables = Column(Integer)
    rounds_data = Column(JSON) # Stocke tous les rounds générés