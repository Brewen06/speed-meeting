from main import app

def authentificate_orga(username: str, password: str) -> bool:
    # Pour que l'organisateur puisse se connecter
    if username == "admin" and password == "secret":
        return True
    return False