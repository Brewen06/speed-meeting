from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import MeetingSession
from utils.pdf import build_rotation_pdf

router = APIRouter()


def _get_session_or_404(session_id: int, db: Session) -> MeetingSession:
    session = db.query(MeetingSession).filter(MeetingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session non trouvee")
    return session


@router.get("/sessions/{session_id}/pdf/free")
def download_free_pdf(
    session_id: int,
    company: str | None = None,
    location: str | None = None,
    date: str | None = None,
    db: Session = Depends(get_db)
):
    session = _get_session_or_404(session_id, db)
    pdf_bytes = build_rotation_pdf(
        session.rounds_data or [],
        event_company=company,
        event_location=location,
        event_date=date,
        include_logos=False,
    )

    filename = f"plan-rotation-free-{session_id}.pdf"
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/sessions/{session_id}/pdf/paid")
def download_paid_pdf(
    session_id: int,
    company: str | None = None,
    location: str | None = None,
    date: str | None = None,
    db: Session = Depends(get_db)
):
    session = _get_session_or_404(session_id, db)
    pdf_bytes = build_rotation_pdf(
        session.rounds_data or [],
        event_company=company,
        event_location=location,
        event_date=date,
        include_logos=True,
    )

    filename = f"plan-rotation-paid-{session_id}.pdf"
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
