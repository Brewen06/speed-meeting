import os

class Settings:
    PROJECT_NAME: str = "Speed Meeting AI"
    PROJECT_VERSION: str = "1.0.0"
    
    # Base de données
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./speed_meeting.db")
    
    # Sécurité (Auth)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_a_changer_en_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "5Pid6M3f!nG")
    
    # CORS - Origines autorisées (séparées par des virgules dans .env)
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",") if os.getenv("CORS_ORIGINS") else ["*"]
    
    # Paramètres par défaut de l'algorithme
    DEFAULT_TIME_PER_ROUND: int = 10
    DEFAULT_SESSION_DURATION: int = 60

    # Import participants (ordre par defaut si pas d'en-tetes)
    DEFAULT_IMPORT_COLUMN_ORDER: list = os.getenv(
        "IMPORT_COLUMN_ORDER",
        "prenom,nom,entreprise,email"
    ).split(",")

    # Email SMTP pour les demandes organisateur
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    SMTP_FROM: str = os.getenv("SMTP_FROM", "")
    ORGANIZER_REQUEST_RECIPIENT: str = os.getenv(
        "ORGANIZER_REQUEST_RECIPIENT",
        "brewen@wsf.fr"
    )

settings = Settings()