from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Participant(Base):
    __tablename__ = "participants"  
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    theme = Column(String, nullable=True)
    affectations = relationship("ParticipantTableAssignment", back_populates="participant")
    

class Table(Base):
    __tablename__ = "tables"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    affectations = relationship("ParticipantTableAssignment", back_populates="table")

class MeetingSession(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    total_duration_minutes = Column(Integer)
    number_of_tables = Column(Integer)
    rounds_data = Column(JSON)
    assignment_rows = relationship("ParticipantTableAssignment", back_populates="session")

class ParticipantTableAssignment(Base):
    __tablename__ = "participant_table_assignments"
    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    
    participant = relationship("Participant", back_populates="affectations")
    table = relationship("Table", back_populates="affectations")
    session = relationship("MeetingSession", back_populates="assignment_rows")