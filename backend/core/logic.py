import random

def generate_rounds(participantCountLabel, tableCountLabel, sessionDurationLabel):
    # 1. Préparation des participants (on crée des IDs ou on simule des noms)
    participants = [f"Participant {i+1}" for i in range(participantCountLabel)]
    
    # 2. Estimation du nombre de rounds (ex: 10 minutes par round)
    time_per_round = 10
    num_rounds = max(1, sessionDurationLabel // time_per_round)
    
    # 3. Calcul de la capacité par table
    capacity = (participantCountLabel // tableCountLabel)
    if participantCountLabel % tableCountLabel != 0:
        capacity += 1

    # 4. Historique pour éviter les doublons
    # Clé: participant, Valeur: set des personnes déjà rencontrées
    history = {p: set() for p in participants}
    all_rounds = []

    for r in range(num_rounds):
        tables = [[] for _ in range(tableCountLabel)]
        waiting_list = list(participants)
        random.shuffle(waiting_list) # Aléatoire !

        for p in waiting_list:
            placed = False
            # On cherche une table avec le moins de conflits
            # On mélange l'ordre des tables pour plus d'aléatoire
            table_indices = list(range(tableCountLabel))
            random.shuffle(table_indices)

            for t_idx in table_indices:
                if len(tables[t_idx]) < capacity:
                    # Vérification : est-ce que p a déjà vu quelqu'un à cette table ?
                    if not any(other in history[p] for other in tables[t_idx]):
                        tables[t_idx].append(p)
                        placed = True
                        break
            
            # Si vraiment bloqué, on le met à la table la moins remplie
            if not placed:
                min_table = min(tables, key=len)
                if len(min_table) < capacity:
                    min_table.append(p)

        # Mise à jour de l'historique après le round
        for table in tables:
            for p1 in table:
                for p2 in table:
                    if p1 != p2:
                        history[p1].add(p2)

        all_rounds.append({
            "round": r + 1,
            "tables": tables
        })

    return {
        "metadata": {
            "participants": participantCountLabel,
            "tables": tableCountLabel,
            "rounds_generated": len(all_rounds)
        },
        "rounds": all_rounds
    }