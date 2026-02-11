from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import engine, Base, get_db
from db.models import Participant, MeetingSession
from api.generate import router as generate_router
from api.participant import router as participant_router
from api.auth import get_current_admin
from api.auth import router as auth_router
from core.logic import generate_rounds
from pydantic import BaseModel
from middleware import setup_middlewares

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Speed Meeting AI API",
    version="1.0.0",
    description="API pour générer et gérer des sessions de speed meeting",
    docs_url="/docs",
    redoc_url="/redoc"
)

setup_middlewares(app)

app.include_router(generate_router, prefix="/api", tags=["api"])
app.include_router(participant_router, prefix="/api", tags=["participants"])
app.include_router(auth_router, prefix="/api", tags=["auth"])

@app.get("/", tags=["health"])
def root(db: Session = Depends(get_db)):
    """Healthcheck endpoint avec vérification de la base de données"""
    try:
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    return {
        "message": "Serveur Speed Meeting opérationnel",
        "status": "online",
        "database": db_status,
        "version": "1.0.0"
    }

class CoreConfig(BaseModel):
    tableCountLabel: int
    sessionDurationLabel: int
    time_per_round: int = 0

@app.post("/core")
def core_route(config: CoreConfig, db: Session = Depends(get_db), current_admin: Participant = Depends(get_current_admin)): # N'OUBLIES PAS L'AUTHENTIFICATION ADMIN
    """
    Génère une session avec les participants importés du fichier Excel.
    Route protégée - nécessite l'authentification admin.
    """
    # Récupérer les participants de la base de données
    db_participants = db.query(Participant).all()
    participant_names = [p.nom_complet for p in db_participants if p.nom_complet]

    if not participant_names:
        raise HTTPException(status_code=400, detail="La liste des participants est vide. Importez un fichier d'abord !")

    # Générer les rounds avec les vrais noms
    result = generate_rounds(
        participant_names,
        tableCountLabel=config.tableCountLabel,
        sessionDurationLabel=config.sessionDurationLabel,
        time_per_round=config.time_per_round
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Sauvegarder la session en base de données
    new_session = MeetingSession(
        total_duration_minutes=config.sessionDurationLabel,
        number_of_tables=config.tableCountLabel,
        rounds_data=result.get("rounds", []),
        created_at=datetime.now(timezone.utc)
    )
    
    try:
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la sauvegarde : {str(e)}")
    
    return {
        "session_id": new_session.id,
        "metadata": result.get("metadata", {}),
        "rounds": result.get("rounds", []),
        "message": "Session générée avec succès. Les participants peuvent consulter leurs tables."
    }

@app.get("/core-test")
def core_test_route(participants: int, tables: int, duration: int, time_per_round: int = 10):
    """Route de test - génère des participants fictifs sans authentification"""
    return generate_rounds(participants, tables, duration, time_per_round)

# Routes utilitaires
@app.get("/db/status")
def db_status(db: Session = Depends(get_db)):
    count = db.query(Participant).count()
    return {"database": "connected", "participants_in_db": count}

