"""
HERACLES.EXE // Punto de Entrada WSGI para Servidores de Produccion
Compatible con Gunicorn, uWSGI y mod_wsgi.
Olympus Tech Solutions - Grupo 4 (DAW)
"""

import os
from app import app, init_db

# Inicializar tablas y esquema de la base de datos al arrancar
init_db()

# Objeto WSGI expuesto para el servidor HTTP
application = app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    application.run(host="0.0.0.0", port=port)
