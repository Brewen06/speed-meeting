from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from core.config import settings
from db.database import get_db
from db.models import OrganizerRequest as OrganizerRequestModel
from db.schemas import OrganizerRequestCreate, OrganizerRequestResponse
from utils.email import send_email

router = APIRouter()


@router.post("/organizer/request")
def submit_organizer_request(payload: OrganizerRequestCreate, db: Session = Depends(get_db)):
    """Créer une demande d'organisateur"""
    try:
        subject = f"Demande organisateur - {payload.entreprise}"
        body = (
            "Nouvelle demande organisateur\n\n"
            f"Nom: {payload.nom}\n"
            f"Prenom: {payload.prenom}\n"
            f"Email: {payload.email}\n"
            f"Telephone: {payload.telephone}\n"
            f"Activite: {payload.activite}\n"
            f"Entreprise: {payload.entreprise}\n"
            f"Raison: {payload.raison}\n"
        )
        send_email(subject, body, settings.ORGANIZER_REQUEST_RECIPIENT)

        org_request = OrganizerRequestModel(
            nom=payload.nom,
            prenom=payload.prenom,
            email=payload.email,
            telephone=payload.telephone,
            activite=payload.activite,
            entreprise=payload.entreprise,
            raison=payload.raison,
            status="pending"
        )
        db.add(org_request)
        db.commit()
        db.refresh(org_request)
        return {"message": "Demande envoyee avec succes", "id": org_request.id}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/organizer/requests")
def list_organizer_requests(db: Session = Depends(get_db)):
    """Lister toutes les demandes d'organisateur"""
    requests = db.query(OrganizerRequestModel).order_by(OrganizerRequestModel.created_at.desc()).all()
    return requests


@router.get("/organizer/requests/{request_id}")
def get_organizer_request(request_id: int, db: Session = Depends(get_db)):
    """Récupérer une demande d'organisateur"""
    request = db.query(OrganizerRequestModel).filter(OrganizerRequestModel.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Demande non trouvee")
    return request
