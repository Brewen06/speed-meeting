from email.message import EmailMessage
import smtplib
import logging

from core.config import settings

logger = logging.getLogger(__name__)


def send_email(subject: str, body: str, to_address: str) -> None:
    if not to_address:
        raise ValueError("Recipient address requis")

    if not settings.SMTP_HOST or not settings.SMTP_FROM:
        logger.warning(f"SMTP non configure. Email en mode DEV:\nTo: {to_address}\nSubject: {subject}\n{body}")
        return

    try:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = settings.SMTP_FROM
        message["To"] = to_address
        message.set_content(body)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(message)
        logger.info(f"Email envoye a {to_address}")
    except Exception as exc:
        logger.error(f"Erreur lors de l'envoi email: {exc}")
        raise
