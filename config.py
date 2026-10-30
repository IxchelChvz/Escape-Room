"""
Configuracion de la aplicacion.

Todo lo sensible se lee de variables de entorno. Si no existen, se genera un valor
aleatorio la primera vez y se guarda en un archivo local (ignorado por git), de modo
que no hay claves escritas en el codigo.
"""

import os
import secrets
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def _persisted(filename, factory):
    """Devuelve el contenido de un archivo local; si no existe lo crea con factory()."""
    path = os.path.join(BASE_DIR, filename)
    try:
        with open(path, 'r', encoding='utf-8') as fh:
            value = fh.read().strip()
            if value:
                return value
    except OSError:
        pass
    value = factory()
    try:
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(value)
    except OSError:
        pass
    return value


def _database_uri():
    url = os.environ.get('DATABASE_URL')
    if not url:
        return 'sqlite:///' + os.path.join(BASE_DIR, 'heracles.db')
    # Algunos proveedores devuelven "postgres://", que SQLAlchemy ya no acepta.
    if url.startswith('postgres://'):
        url = 'postgresql://' + url[len('postgres://'):]
    return url


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or _persisted('.secret_key', lambda: secrets.token_hex(32))
    SQLALCHEMY_DATABASE_URI = _database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Panel /admin
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or _persisted('.admin_password', lambda: secrets.token_urlsafe(9))

    # Cookies de sesion
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_DURATION = timedelta(hours=12)
    REMEMBER_COOKIE_HTTPONLY = True

    # Reglas del juego
    FINAL_PASSWORD = (os.environ.get('FINAL_PASSWORD') or 'HERACLES.EXE').upper()
    REQUIRED_TRIALS = int(os.environ.get('REQUIRED_TRIALS', '12'))
    TIME_LIMIT_SECONDS = 90 * 60
