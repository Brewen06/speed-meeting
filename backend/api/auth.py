from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from db.database import get_db
from core.config import settings
import secrets

router = APIRouter()
security = HTTPBasic()


def get_current_admin(credentials: HTTPBasicCredentials = Depends(security)):
    # Pour que l'organisateur puisse se connecter
    if not settings.ADMIN_USERNAME or not settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Identifiants admin non configurés",
        )

    is_admin = secrets.compare_digest(credentials.username, settings.ADMIN_USERNAME)
    is_password_correct = secrets.compare_digest(credentials.password, settings.ADMIN_PASSWORD)

    if not (is_admin and is_password_correct):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


@router.post("/auth/admin/login")
def admin_login(credentials: HTTPBasicCredentials = Depends(security)):
    admin_username = get_current_admin(credentials)
    return {
        "token": "admin",
        "role": "admin",
        "username": admin_username
    }