"""
Configuracion de Produccion para Servidor Gunicorn WSGI
HERACLES.EXE // Olympus Tech Solutions
"""

import multiprocessing
import os

# Enlace de red y puerto
bind = f"0.0.0.0:{os.environ.get('PORT', 3000)}"

# Procesos de trabajo (2 * nucleos + 1)
workers = min(4, multiprocessing.cpu_count() * 2 + 1)
worker_class = "sync"
worker_connections = 1000
timeout = 60
keepalive = 5

# Registro de accesos y errores
accesslog = "-"
errorlog = "-"
loglevel = "info"
capture_output = True

# Nombre del proceso en el sistema operativo
proc_name = "heracles_wsgi"

# Limpieza de recursos al reiniciar
preload_app = True
