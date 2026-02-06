import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db.database import engine, Base, get_db
from db.models import Participant 
from api.generate import router as generate_router
from core.logic import generate_rounds

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Speed Meeting AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router, prefix="/api", tags=["api"])

@app.get("/")
def root():
    return {"message": "Serveur Speed Meeting opérationnel", "status": "online"}

@app.get("/core")
def core_route(participantCountLabel: int, tableCountLabel: int, sessionDurationLabel: int, time_per_round: int = 10):
    return generate_rounds(participantCountLabel, tableCountLabel, sessionDurationLabel, time_per_round)

# Test rapide
@app.get("/core-test")
def core_route(participants: int, tables: int, duration: int, time_per_round: int = 10):
    
    return generate_rounds(participants, tables, duration, time_per_round)

# Routes utilitaires
@app.get("/db/status")
def db_status(db: Session = Depends(get_db)):
    count = db.query(Participant).count()
    return {"database": "connected", "participants_in_db": count}