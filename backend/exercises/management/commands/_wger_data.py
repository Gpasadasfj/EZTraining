"""
Datos estáticos usados por el comando `import_exercises`.

La API de wger no traduce category/muscle/equipment (solo traduce el propio
ejercicio: nombre y descripción). Son catálogos cerrados y pequeños, así que
se traducen a mano aquí, indexados por el id numérico de wger para no
depender de coincidencias de texto.
"""

WGER_API_URL = "https://wger.de/api/v2/exerciseinfo/"

LANG_EN = 2
LANG_ES = 4

# category.id -> nombre en español
BODY_PART_ES_BY_ID = {
    10: "Abdominales",   # Abs
    8: "Brazos",         # Arms
    12: "Espalda",       # Back
    14: "Gemelos",       # Calves
    15: "Cardio",        # Cardio
    11: "Pecho",         # Chest
    9: "Piernas",        # Legs
    13: "Hombros",       # Shoulders
}

# muscle.id -> nombre en español
MUSCLE_ES_BY_ID = {
    2: "Deltoides anterior",   # Anterior deltoid / Shoulders
    1: "Bíceps",               # Biceps brachii / Biceps
    11: "Isquiotibiales",      # Biceps femoris / Hamstrings
    13: "Braquial",            # Brachialis
    7: "Gemelos",              # Gastrocnemius / Calves
    8: "Glúteos",              # Gluteus maximus / Glutes
    12: "Dorsales",            # Latissimus dorsi / Lats
    14: "Oblicuos",            # Obliquus externus abdominis
    4: "Pecho",                # Pectoralis major / Chest
    10: "Cuádriceps",          # Quadriceps femoris / Quads
    6: "Abdominales",          # Rectus abdominis / Abs
    3: "Serrato anterior",     # Serratus anterior
    15: "Sóleo",               # Soleus
    9: "Trapecio",             # Trapezius
    5: "Tríceps",              # Triceps brachii / Triceps
}

# equipment.id -> nombre en español
EQUIPMENT_ES_BY_ID = {
    1: "Barra",               # Barbell
    8: "Banco",                # Bench
    12: "Máquina de cable",    # Cable machine
    3: "Mancuerna",            # Dumbbell
    4: "Esterilla",            # Gym mat
    9: "Banco inclinado",      # Incline bench
    10: "Kettlebell",          # Kettlebell
    6: "Barra de dominadas",   # Pull-up bar
    11: "Banda elástica",      # Resistance band
    2: "Barra Z",              # SZ-Bar
    5: "Fitball",              # Swiss Ball
    7: "Sin equipamiento",     # none (bodyweight exercise)
}
