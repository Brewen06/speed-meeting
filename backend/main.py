import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.logic import generate_rounds
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def root():
    return {"message": "FastAPI fonctionne"}


@app.get("/core")
def core_route(participantCountLabel: int, tableCountLabel: int, sessionDurationLabel: datetime.timedelta):
    return generate_rounds(participantCountLabel, tableCountLabel, sessionDurationLabel)

@app.post("/core")
def core_post_route(data: dict):
    participantCountLabel = data.get("participantCountLabel", 0)
    tableCountLabel = data.get("tableCountLabel", 0)
    sessionDurationLabel = data.get("sessionDurationLabel", datetime.timedelta(0))
    return generate_rounds(participantCountLabel, tableCountLabel, sessionDurationLabel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/db/init")
def db_init():
    return {"message": "Database initialized"}

@app.get("/utils")
def utils_route():
    return {"message": "Utils route"}

@app.get("/api")
def api_route():
    return {"message": "API route"}