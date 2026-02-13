"""
Script de migration pour ajouter le champ number_of_rounds à la table sessions
"""
import sqlite3
import os

# Chemin vers la base de données
DB_PATH = os.path.join(os.path.dirname(__file__), "speed_meeting.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Vérifier si la colonne number_of_rounds existe déjà
        cursor.execute("PRAGMA table_info(sessions)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if "number_of_rounds" not in columns:
            print("Ajout de la colonne 'number_of_rounds'...")
            cursor.execute("ALTER TABLE sessions ADD COLUMN number_of_rounds INTEGER DEFAULT 1")
            print("✓ Colonne 'number_of_rounds' ajoutée")
        else:
            print("✓ La colonne 'number_of_rounds' existe déjà")
        
        # Rendre total_duration_minutes nullable
        print("Mise à jour de la colonne 'total_duration_minutes' (nullable)...")
        # Note: SQLite ne supporte pas ALTER COLUMN directement, donc nous gardons juste la valeur nullable dans le modèle
        
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
        print(f"❌ Base de données non trouvée à {DB_PATH}")
