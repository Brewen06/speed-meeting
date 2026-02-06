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
    
    # Paramètres par défaut de l'algorithme
    DEFAULT_TIME_PER_ROUND: int = 10
    DEFAULT_SESSION_DURATION: int = 60

settings = Settings()