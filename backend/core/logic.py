import datetime
from math import ceil
import random

def generate_rounds(participantCountLabel: int, tableCountLabel: int, sessionDurationLabel: datetime.timedelta, time_per_round: int) -> dict:
   
    participants = list(range(participantCountLabel))
    # Calcul de combien de personnes max par table pour ne laisser personne dehors
    max_per_table = ceil(participantCountLabel / tableCountLabel)
    
    # Calcul du nombre de rounds possible selon le temps imparti
    # (On utilise la valeur fournie par l'admin plutôt qu'un random)
    max_rounds = sessionDurationLabel.total_seconds() // (time_per_round * 60)
    nb_rounds = int(max_rounds)

    # Historique des rencontres (Matrice de collision) pour garantir l'unicité
    
    history = {i: set() for i in participants}
    
    rounds = []

    for r in range(nb_rounds):
        current_round_tables = []
        random.shuffle(participants) # On mélange pour l'aspect aléatoire
        
        assigned = [] # Pour suivre qui est déjà placé dans ce round
        
        for t in range(tableCountLabel):
            table_participants = []
            
            # Recherche de participants pour cette table
            for p in participants:
                if p not in assigned and len(table_participants) < max_per_table:
                    # Vérification des collisions (est-ce que p a déjà vu quelqu'un à cette table ?)
                    if not any(p in history[other] for other in table_participants):
                        table_participants.append(p)
                        assigned.append(p)
            
            # Enregistrement des rencontres dans l'historique
            for p1 in table_participants:
                for p2 in table_participants:
                    if p1 != p2:
                        history[p1].add(p2)


            current_round_tables.append({
                "table_number": t + 1,
                "participants": table_participants
            })

        rounds.append({
            "round_number": r + 1,
            "tables": current_round_tables
        })

    return {
        "rounds": rounds,
        "config": {
            "nb_participants": participantCountLabel,
            "nb_tables": tableCountLabel,
            "nb_rounds": len(rounds),
            "time_per_round": time_per_round
        }
    }