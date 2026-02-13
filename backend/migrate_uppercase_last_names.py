"""
Migration pour convertir tous les noms de famille en majuscules
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.models import Participant, Base
from db.database import DATABASE_URL

# Créer la session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Récupérer tous les participants
    participants = db.query(Participant).all()
    
    updated_count = 0
    
    for participant in participants:
        # Convertir le nom en majuscules
        if participant.nom and participant.nom.strip():
            participant.nom = participant.nom.strip().upper()
            updated_count += 1
        
        # Mettre à jour le nom_complet : mettre le dernier mot en majuscules
        if participant.nom_complet and participant.nom_complet.strip():
            parts = participant.nom_complet.split()
            if len(parts) > 1:
                # Mettre le dernier mot en majuscules
                parts[-1] = parts[-1].upper()
                participant.nom_complet = " ".join(parts)
            else:
                # Si c'est un seul mot, le mettre en majuscules
                participant.nom_complet = participant.nom_complet.strip().upper()
    
    # Valider les changements
    db.commit()
    print(f"✓ Migration réussie : {updated_count} participant(s) mis à jour")
    print("Tous les noms de famille sont maintenant en majuscules")
    
except Exception as e:
    db.rollback()
    print(f"✗ Erreur lors de la migration : {str(e)}")
    
finally:
    db.close()
