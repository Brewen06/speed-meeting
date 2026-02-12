"""
Script de migration pour ajouter les champs ended_at et is_active à la table sessions
"""
import sqlite3
import os

# Chemin vers la base de données
DB_PATH = os.path.join(os.path.dirname(__file__), "speed_meeting.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Vérifier si la colonne ended_at existe déjà
        cursor.execute("PRAGMA table_info(sessions)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if "ended_at" not in columns:
            print("Ajout de la colonne 'ended_at'...")
            cursor.execute("ALTER TABLE sessions ADD COLUMN ended_at DATETIME")
            print("✓ Colonne 'ended_at' ajoutée")
        else:
            print("✓ La colonne 'ended_at' existe déjà")
        
        if "is_active" not in columns:
            print("Ajout de la colonne 'is_active'...")
            cursor.execute("ALTER TABLE sessions ADD COLUMN is_active BOOLEAN DEFAULT 1")
            print("✓ Colonne 'is_active' ajoutée")
            
            # Mettre à jour toutes les sessions existantes comme actives
            cursor.execute("UPDATE sessions SET is_active = 1 WHERE is_active IS NULL")
            print("✓ Sessions existantes mises à jour")
        else:
            print("✓ La colonne 'is_active' existe déjà")
        
        conn.commit()
        print("\n✅ Migration réussie !")
        
    except sqlite3.Error as e:
        print(f"❌ Erreur lors de la migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    if os.path.exists(DB_PATH):
        print(f"Base de données trouvée: {DB_PATH}\n")
        migrate()
    else:
        print(f"❌ Base de données non trouvée: {DB_PATH}")
        print("La base de données sera créée automatiquement au premier lancement du serveur.")
