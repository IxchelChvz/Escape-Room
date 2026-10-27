# -*- coding: utf-8 -*-
"""
Script de Sembrado (Seed) para inicializar SQLite con SQLAlchemy
Olympus Tech Solutions - Grupo 4 (Paul: Backend DWES)
Sin emojis.
"""

from backend.models import db, Labor, Team, GameSession

LABORS_SEED = [
    {
        "order_num": 0, "greek_letter": "Α", "short_label": "León",
        "title": "El León de Nemea", "location": "Nemea (Argólida)",
        "module_tag": "DIW // CSS", "character_reward": "H",
        "map_x": 355, "map_y": 360, "challenge_type": "quiz",
        "story": "Ninguna flecha atraviesa la piel del león, y ninguna regla de estilo lo mueve de su guarida. Céntralo en el friso para debilitarlo."
    },
    {
        "order_num": 1, "greek_letter": "Β", "short_label": "Hidra",
        "title": "La Hidra de Lerna", "location": "Lerna (Golfo Argólico)",
        "module_tag": "DWEC // bucles", "character_reward": "E",
        "map_x": 375, "map_y": 395, "challenge_type": "order",
        "story": "Por cada cabeza cortada nacen dos más, salvo que cada muñón se cauterice. Ordena el código para cortar las nueve cabezas."
    },
    {
        "order_num": 2, "greek_letter": "Γ", "short_label": "Cierva",
        "title": "La Cierva de Cerinea", "location": "Cerinea (Acaya)",
        "module_tag": "DWEC // eventos", "character_reward": "R",
        "map_x": 320, "map_y": 335, "challenge_type": "deer",
        "story": "La cierva corre más rápido que cualquier flecha y cada vez salta antes. Atrápala con un clic seis veces."
    },
    {
        "order_num": 3, "greek_letter": "Δ", "short_label": "Jabalí",
        "title": "El Jabalí de Erimanto", "location": "Monte Erimanto",
        "module_tag": "DIW // accesibilidad", "character_reward": "A",
        "map_x": 290, "map_y": 365, "challenge_type": "quiz",
        "story": "El jabalí arrasa el marcado y deja imágenes sin descripción. Repara la etiqueta para que un lector de pantalla pueda describirla."
    },
    {
        "order_num": 4, "greek_letter": "Ε", "short_label": "Establos",
        "title": "Los Establos de Augías", "location": "Élide (Peloponeso)",
        "module_tag": "DWES // Código limpio", "character_reward": "C",
        "map_x": 255, "map_y": 385, "challenge_type": "dirt",
        "story": "Los establos acumulan décadas de código muerto. Barre todo el desecho: haz clic o arrastra sobre las manchas."
    },
    {
        "order_num": 5, "greek_letter": "Ζ", "short_label": "Aves",
        "title": "Las Aves del Estínfalo", "location": "Lago Estínfalo",
        "module_tag": "DWEC // Depuración", "character_reward": "L",
        "map_x": 340, "map_y": 370, "challenge_type": "typos",
        "story": "Una bandada de aves de bronce ha anidado en el código. Derriba solo las cinco palabras mal escritas."
    },
    {
        "order_num": 6, "greek_letter": "Η", "short_label": "Toro",
        "title": "El Toro de Creta", "location": "Isla de Creta",
        "module_tag": "DWES // Flask HTTP", "character_reward": "E",
        "map_x": 480, "map_y": 545, "challenge_type": "quiz",
        "story": "El toro se ha escapado del recinto y nadie sabe dónde está. Averigua qué responde el servidor cuando la ruta no existe."
    },
    {
        "order_num": 7, "greek_letter": "Θ", "short_label": "Yeguas",
        "title": "Las Yeguas de Diomedes", "location": "Tracia (Norte)",
        "module_tag": "DWEC // Memoria", "character_reward": "S",
        "map_x": 620, "map_y": 125, "challenge_type": "simon",
        "story": "Las yeguas devoran a quien se distrae. Memoriza el orden en que se encabritan y repítelo."
    },
    {
        "order_num": 8, "greek_letter": "Ι", "short_label": "Cinturón",
        "title": "El Cinturón de Hipólita", "location": "Temiscira (Ponto)",
        "module_tag": "DIW // HTML semántico", "character_reward": ".",
        "map_x": 740, "map_y": 145, "challenge_type": "pairs",
        "story": "Hipólita entregará el cinturón si reconoces cada pieza del templo. Une cada etiqueta con su función."
    },
    {
        "order_num": 9, "greek_letter": "Κ", "short_label": "Bueyes",
        "title": "Los Bueyes de Gerión", "location": "Eritia (Occidente)",
        "module_tag": "DWEC // Tipos de datos", "character_reward": "E",
        "map_x": 95, "map_y": 410, "challenge_type": "quiz",
        "story": "Gerión tiene tres cuerpos y todos parecen el mismo buey. Descubre qué devuelve la comparación estricta."
    },
    {
        "order_num": 10, "greek_letter": "Λ", "short_label": "Manzanas",
        "title": "Las Manzanas de las Hespérides", "location": "Jardín del Atlas",
        "module_tag": "DWES // Criptografía", "character_reward": "X",
        "map_x": 95, "map_y": 500, "challenge_type": "cipher",
        "story": "El dragón Ladón vigila el jardín con un cifrado César. Descifra el nombre del héroe para entrar."
    },
    {
        "order_num": 11, "greek_letter": "Μ", "short_label": "Cerbero",
        "title": "Cerbero", "location": "Cabo Ténaro (Hades)",
        "module_tag": "DWES // DAW // Python SQL", "character_reward": "E",
        "map_x": 355, "map_y": 495, "challenge_type": "cerberus",
        "story": "El guardián del inframundo tiene tres cabezas y cada una exige una respuesta distinta. Calma a las tres."
    }
]

def seed_database():
    """Siembra los datos iniciales de los trabajos y equipos en la base de datos."""
    if Labor.query.count() == 0:
        for item in LABORS_SEED:
            labor = Labor(**item)
            db.session.add(labor)
        db.session.commit()
        print("[INFO] 12 Trabajos de Heracles insertados con exito en SQLite via SQLAlchemy.")

    if Team.query.count() == 0:
        t1 = Team(name="Equipo Atenea")
        t2 = Team(name="Tigres de Esparta")
        t3 = Team(name="Argonautas del DWES")
        db.session.add_all([t1, t2, t3])
        db.session.commit()

        s1 = GameSession(team_name="Equipo Atenea", team_id=t1.id, duration_seconds=314, formatted_time="05:14", labors_solved=12, completed=True)
        s2 = GameSession(team_name="Tigres de Esparta", team_id=t2.id, duration_seconds=458, formatted_time="07:38", labors_solved=12, completed=True)
        s3 = GameSession(team_name="Argonautas del DWES", team_id=t3.id, duration_seconds=680, formatted_time="11:20", labors_solved=12, completed=True)
        db.session.add_all([s1, s2, s3])
        db.session.commit()
        print("[INFO] Equipos y partidas de prueba sembradas en SQLAlchemy.")
