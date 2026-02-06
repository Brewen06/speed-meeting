from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from db.database import get_db

router = APIRouter()
security = HTTPBasic()


def get_current_admin(credentials: HTTPBasicCredentials = Depends(security)):
    # Pour que l'organisateur puisse se connecter
    is_admin = (credentials.username == "admin")
    is_password_correct = (credentials.password == "5Pid6M3f!nG") #à voir plus tard
    
    if not (is_admin and is_password_correct):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username