from random import shuffle
from fastapi import FastAPI

import random

def ordre_table_aleatoire(participantCountLabel: int, tableCountLabel: int):
   
    participants = list(range(participantCountLabel))
    random.shuffle(participants)
    distribution = {}
    table_size = participantCountLabel // tableCountLabel
    for table_number in range(tableCountLabel):
        distribution[table_number] = participants[table_number * table_size:(table_number + 1) * table_size]
    return distribution