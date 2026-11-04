"""Datos del juego: los doce trabajos y las soluciones que valida el servidor."""

# "solution": respuesta que el cliente debe enviar. None = minijuego de accion que se
# resuelve en el navegador; en ese caso el cliente envia la palabra SOLVED.
# Las Hesperides (prueba fisica con QR) y Cerbero piden una palabra que se comprueba aqui.
DEFAULT_TRIALS = [
    {"num": 1, "code": "ERR_LEON_DE_NEMEA", "greek": "Α", "name": "El León de Nemea", "module": "DIW", "concept": "Colores RGB", "char": "H", "pos": [1310, 510], "solution": None},
    {"num": 2, "code": "ERR_HIDRA_DE_LERNA", "greek": "Β", "name": "La Hidra de Lerna", "module": "DAW", "concept": "Escritura rápida", "char": "E", "pos": [1500, 665], "solution": None},
    {"num": 3, "code": "ERR_CIERVA_DE_CERINEA", "greek": "Γ", "name": "La Cierva de Cerinea", "module": "DWEC", "concept": "Reflejos y eventos", "char": "R", "pos": [720, 345], "solution": None},
    {"num": 4, "code": "ERR_JABALI_DE_ERIMANTO", "greek": "Δ", "name": "El Jabalí de Erimanto", "module": "DIW", "concept": "Iconos y atención", "char": "A", "pos": [430, 345], "solution": None},
    {"num": 5, "code": "ERR_ESTABLOS_DE_AUGIAS", "greek": "Ε", "name": "Los Establos de Augías", "module": "DAW", "concept": "Seguridad: archivos peligrosos", "char": "C", "pos": [190, 485], "solution": None},
    {"num": 6, "code": "ERR_AVES_DEL_ESTINFALO", "greek": "Ζ", "name": "Las Aves del Estínfalo", "module": "DAW", "concept": "Lag y atención", "char": "L", "pos": [545, 495], "solution": None},
    {"num": 7, "code": "ERR_TORO_DE_CRETA", "greek": "Η", "name": "El Toro de Creta", "module": "DWEC", "concept": "Laberinto con teclado", "char": "E", "pos": [1080, 920], "solution": None},
    {"num": 8, "code": "ERR_YEGUAS_DE_DIOMEDES", "greek": "Θ", "name": "Las Yeguas de Diomedes", "module": "DWEC", "concept": "Memoria (Simon dice)", "char": "S", "pos": [1618, 365], "solution": None},
    {"num": 9, "code": "ERR_CINTURON_DE_HIPOLITA", "greek": "Ι", "name": "El Cinturón de Hipólita", "module": "DIW", "concept": "Píxeles", "char": ".", "pos": [1760, 520], "solution": None},
    {"num": 10, "code": "ERR_BUEYES_DE_GERION", "greek": "Κ", "name": "Los Bueyes de Gerión", "module": "DAW", "concept": "Atajos de teclado", "char": "E", "pos": [580, 735], "solution": None},
    {"num": 11, "code": "ERR_MANZANAS_HESPERIDES", "greek": "Λ", "name": "Las Manzanas de las Hespérides", "module": "DWES", "concept": "QR y cifrado César", "char": "X", "pos": [310, 690], "solution": "LADON"},
    {"num": 12, "code": "ERR_CERBERO", "greek": "Μ", "name": "Cerbero", "module": "DWEC", "concept": "Tres sentidos", "char": "E", "pos": [1815, 760], "solution": "RIO"},
]

# Mensaje que muestra la pagina del QR de las Hesperides: "LADON" cifrado con Cesar +3
HESPERIDES_CIFRADO = "ODGRQ"

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
