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

    # Ne plus utiliser de participants fantômes, travailler directement avec les vrais participants
    participants = participants_reels
    
    # Calculer la capacité de base et le nombre de tables avec un participant supplémentaire
    base_capacity = participant_count // tableCountLabel
    tables_with_extra = participant_count % tableCountLabel
    
    # La capacité max est base_capacity + 1 si nécessaire
    max_capacity = base_capacity + (1 if tables_with_extra > 0 else 0)

    #Calcul des limites basé sur les vrais participants
    new_meetings_per_round = max_capacity - 1
    max_theoretical_rounds = (participant_count - 1) // new_meetings_per_round if new_meetings_per_round > 0 else 1
    
    
    if time_per_round > 0:
        effective_time_per_round = time_per_round
        max_rounds_by_time = sessionDurationLabel // effective_time_per_round
    else:
        max_rounds_by_time = min(max_theoretical_rounds, max(1, sessionDurationLabel // 10))
        effective_time_per_round = sessionDurationLabel // max_rounds_by_time if max_rounds_by_time > 0 else sessionDurationLabel
    
    num_rounds = max(1, min(max_rounds_by_time, max_theoretical_rounds))

    history = {p: set() for p in participants}
    last_table = {p: None for p in participants}  # Tracker la dernière table de chaque participant

    all_rounds = []
    
    for r in range(num_rounds):
        tables = [[] for _ in range(tableCountLabel)]
        waiting_list = list(participants)
        random.shuffle(waiting_list)

        # Randomiser quelles tables auront un participant supplémentaire à chaque round
        tables_with_extra_capacity = set(random.sample(range(tableCountLabel), tables_with_extra))
        
        # Placement des participants dans les tables avec distribution équilibrée
        for p in waiting_list:
            placed = False
            
            # Privilégier les tables proches de la dernière table du participant
            if last_table[p] is not None:
                # Créer une liste de tables proches (fenêtre de +/- 6 tables)
                proximity_range = 6
                prev_table = last_table[p]
                
                # Tables proches en priorité
                nearby_tables = []
                for offset in range(-proximity_range, proximity_range + 1):
                    t_idx = (prev_table + offset) % tableCountLabel
                    nearby_tables.append(t_idx)
                
                # Mélanger les tables proches pour éviter un pattern fixe
                random.shuffle(nearby_tables)
                
                # Ajouter les tables restantes
                remaining_tables = [t for t in range(tableCountLabel) if t not in nearby_tables]
                random.shuffle(remaining_tables)
                
                table_indices = nearby_tables + remaining_tables
            else:
                # Premier round: placement aléatoire
                table_indices = list(range(tableCountLabel))
                random.shuffle(table_indices)
            
            # Calculer la taille cible pour cette table
            def get_target_capacity(t_idx):
                if t_idx in tables_with_extra_capacity:
                    return base_capacity + 1
                return base_capacity
            
            # Tentative de placement sans doublon
            for t_idx in table_indices:
                target_cap = get_target_capacity(t_idx)
                if len(tables[t_idx]) < target_cap:
                    if not any(other in history[p] for other in tables[t_idx]):
                        tables[t_idx].append(p)
                        last_table[p] = t_idx  # Enregistrer la table du participant
                        placed = True
                        break
            
            # Placement forcé si nécessaire, en respectant la capacité
            if not placed:
                for t_idx in table_indices:
                    target_cap = get_target_capacity(t_idx)
                    if len(tables[t_idx]) < target_cap:
                        tables[t_idx].append(p)
                        last_table[p] = t_idx  # Enregistrer la table du participant
                        placed = True
                        break
        
        # Mise à jour de l'historique
        for table in tables:
            for p1 in table:
                for p2 in table:
                    if p1 != p2:
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

    logger.info(f"✅ {len(all_rounds)} rounds générés avec succès | Participants: {participant_count}")
    
    return {
        "metadata": {
            "total_participants": participant_count,
            "total_rounds": len(all_rounds),
            "participants_per_table": base_capacity,
            "tables": tableCountLabel,
            "time_per_round_minutes": effective_time_per_round,
            "rounds_generated": len(all_rounds)
        },
        "rounds": all_rounds
    }