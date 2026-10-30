"""Extensiones de Flask compartidas (se crean aqui para evitar importaciones circulares)."""

from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()
