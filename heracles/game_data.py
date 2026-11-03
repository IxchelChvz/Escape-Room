"""Datos del juego: los doce trabajos y las soluciones que valida el servidor."""

# "solution": respuesta que el cliente debe enviar. None = prueba de accion (minijuego)
# que se resuelve en el navegador; en ese caso el cliente envia la palabra SOLVED.
DEFAULT_TRIALS = [
    {"num": 1, "code": "ERR_LEON_DE_NEMEA", "greek": "Α", "name": "El León de Nemea", "module": "DIW", "concept": "CSS · Flexbox y Box Model", "char": "H", "pos": [1310, 510], "solution": "align-items"},
    {"num": 2, "code": "ERR_HIDRA_DE_LERNA", "greek": "Β", "name": "La Hidra de Lerna", "module": "DWEC", "concept": "JavaScript · Bucles y Eventos", "char": "E", "pos": [1500, 665], "solution": None},
    {"num": 3, "code": "ERR_CIERVA_DE_CERINEA", "greek": "Γ", "name": "La Cierva de Cerinea", "module": "DWEC", "concept": "JavaScript · Eventos y Evasion", "char": "R", "pos": [720, 345], "solution": None},
    {"num": 4, "code": "ERR_JABALI_DE_ERIMANTO", "greek": "Δ", "name": "El Jabalí de Erimanto", "module": "DIW / DWEC", "concept": "HTML · Accesibilidad y RegEx", "char": "A", "pos": [430, 345], "solution": "alt"},
    {"num": 5, "code": "ERR_ESTABLOS_DE_AUGIAS", "greek": "Ε", "name": "Los Establos de Augías", "module": "DWES", "concept": "Codigo Limpio y SQL", "char": "C", "pos": [190, 485], "solution": None},
    {"num": 6, "code": "ERR_AVES_DEL_ESTINFALO", "greek": "Ζ", "name": "Las Aves del Estínfalo", "module": "DAW", "concept": "Depuracion y Sintaxis", "char": "L", "pos": [545, 495], "solution": None},
    {"num": 7, "code": "ERR_TORO_DE_CRETA", "greek": "Η", "name": "El Toro de Creta", "module": "DWES", "concept": "Flask · HTTP y CORS", "char": "E", "pos": [1080, 920], "solution": "404 Not Found"},
    {"num": 8, "code": "ERR_YEGUAS_DE_DIOMEDES", "greek": "Θ", "name": "Las Yeguas de Diomedes", "module": "DWEC / DWES", "concept": "Memoria y Permisos Unix", "char": "S", "pos": [1618, 365], "solution": None},
    {"num": 9, "code": "ERR_CINTURON_DE_HIPOLITA", "greek": "Ι", "name": "El Cinturón de Hipólita", "module": "DIW / DAW", "concept": "HTML Semantico y DevTools", "char": ".", "pos": [1760, 520], "solution": None},
    {"num": 10, "code": "ERR_BUEYES_DE_GERION", "greek": "Κ", "name": "Los Bueyes de Gerión", "module": "DWEC / DWES", "concept": "JavaScript · Tipos y Jinja2", "char": "E", "pos": [580, 735], "solution": "false"},
    {"num": 11, "code": "ERR_MANZANAS_HESPERIDES", "greek": "Λ", "name": "Las Manzanas de las Hespérides", "module": "DWEC", "concept": "Criptografia Cesar", "char": "X", "pos": [310, 690], "solution": "HERCULES"},
    {"num": 12, "code": "ERR_CERBERO", "greek": "Μ", "name": "Cerbero", "module": "DWES", "concept": "Python, SQL y Tokens JWT", "char": "E", "pos": [1815, 760], "solution": "3|DISTINCT|ls -a"},
]

DEMO_TEAMS = [
    {"name": "Teseo & Jasón (Argonautas)", "elapsed": 1420, "score": 1200, "restored": True},
    {"name": "Espartanos de Leónidas", "elapsed": 1650, "score": 1100, "restored": True},
    {"name": "Héroes del Código", "elapsed": 0, "score": 1000, "restored": False},
]


def normalize(text):
    """Compara respuestas sin importar mayusculas ni espacios repetidos."""
    return ' '.join(str(text).strip().casefold().split())


def format_seconds(total):
    total = max(0, int(total or 0))
    return '%02d:%02d:%02d' % (total // 3600, (total % 3600) // 60, total % 60)
