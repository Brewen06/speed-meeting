import random
import logging

logger = logging.getLogger(__name__)

def generate_rounds(participants_input, tableCountLabel, sessionDurationLabel, time_per_round, seed=None):
    """Génère les rounds de speed meeting avec placement optimisé des participants"""
    
    # Configuration du seed pour reproductibilité (utile pour les tests)
    if seed is not None:
        random.seed(seed)
        logger.debug(f"🎲 Seed défini : {seed}")
    
    # Gestionnaire des participants et des places vides
    if isinstance(participants_input, list):
        participants_reels = [p.strip() for p in participants_input if str(p).strip()]
        participant_count = len(participants_reels)
    else:
        participant_count = int(participants_input)
        participants_reels = [f"Participant {i+1}" for i in range(participant_count)]
    
    logger.info(f"🎯 Génération de rounds : {participant_count} participants, {tableCountLabel} tables, {sessionDurationLabel}min")
    
    # Validations des paramètres
    if tableCountLabel <= 0:
        return {"error": "Nombre de tables doit être > 0"}

    if participant_count <= 0:
        return {"error": "Aucun participant fourni"}
    
    if tableCountLabel > participant_count:
        return {"error": f"Nombre de tables ({tableCountLabel}) supérieur au nombre de participants ({participant_count})"}
    
    if time_per_round > 0 and sessionDurationLabel < time_per_round:
        return {"error": f"Durée de session ({sessionDurationLabel}min) inférieure au temps par round ({time_per_round}min)"}

    total_slots = -(-participant_count // tableCountLabel) * tableCountLabel
    num_spectres = total_slots - participant_count
    
    # Ajout des participants "rien" pour équilibrer les tables
    spectres = [f"rien {i+1}" for i in range(num_spectres)]
    participants = participants_reels + spectres

    capacity = len(participants) // tableCountLabel

    #Calcul des limites (inchangé mais basé sur participants totaux)
    new_meetings_per_round = capacity - 1
    max_theoretical_rounds = (len(participants) - 1) // new_meetings_per_round if new_meetings_per_round > 0 else 1
    
    
    if time_per_round > 0:
        effective_time_per_round = time_per_round
        max_rounds_by_time = sessionDurationLabel // effective_time_per_round
    else:
        max_rounds_by_time = min(max_theoretical_rounds, max(1, sessionDurationLabel // 5))
        effective_time_per_round = sessionDurationLabel // max_rounds_by_time if max_rounds_by_time > 0 else sessionDurationLabel
    
    num_rounds = max(1, min(max_rounds_by_time, max_theoretical_rounds))

    history = {p: set() for p in participants}

    all_rounds = []
    
    for r in range(num_rounds):
        tables = [[] for _ in range(tableCountLabel)]
        waiting_list = list(participants)
        random.shuffle(waiting_list)

        # Placement des participants dans les tables
        for p in waiting_list:
            placed = False
            table_indices = list(range(tableCountLabel))
            random.shuffle(table_indices)
            
            # Tentative de placement sans doublon
            for t_idx in table_indices:
                if len(tables[t_idx]) < capacity:
                    if not any(other in history[p] for other in tables[t_idx]):
                        tables[t_idx].append(p)
                        placed = True
                        break
            
            # Placement forcé si nécessaire
            if not placed:
                for t_idx in table_indices:
                    if len(tables[t_idx]) < capacity:
                        tables[t_idx].append(p)
                        placed = True
                        break
        
        # Mise à jour de l'historique
        for table in tables:
            for p1 in table:
                if "rien" in p1: continue # Les fantômes ne comptent pas dans l'historique
                for p2 in table:
                    if p1 != p2 and "rien" not in p2:
                        history[p1].add(p2)
        
        # Construction du round_data avec la structure correcte
        tables_data = []
        for t_idx, participants_at_table in enumerate(tables):
            tables_data.append({
                "table_id": t_idx + 1,
                "table_name": f"Table {t_idx + 1}",
                "members": participants_at_table
            })
        
        round_data = {
            "round": r + 1,
            "tables": tables_data
        }

        all_rounds.append(round_data)

    logger.info(f"✅ {len(all_rounds)} rounds générés avec succès | Participants réels: {participant_count} | Fantômes: {num_spectres}")
    
    return {
        "metadata": {
            "participants_reels": participant_count,
            "spectres_added": total_slots - participant_count,
            "tables": tableCountLabel,
            "time_per_round": effective_time_per_round,
            "rounds_generated": len(all_rounds)
        },
        "rounds": all_rounds
    }