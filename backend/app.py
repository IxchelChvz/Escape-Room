# -*- coding: utf-8 -*-
"""
HERACLES.EXE - Servidor Web Principal Flask + Jinja2 + SQLAlchemy
Olympus Tech Solutions - Grupo 4 (Paul: Backend DWES, Juan: Sistemas DAW)
Sin emojis.
"""

import os
from flask import Flask
from flask_cors import CORS
from backend.models import db
from backend.routes.views import views_bp
from backend.routes.api import api_bp
from backend.seed import seed_database

def create_app():
    """Fabrica de la aplicacion Flask con soporte ORM y plantillas Jinja2."""
    app = Flask(
        __name__,
        template_folder='templates',
        static_folder='static'
    )
    CORS(app)

    # Configuracion de base de datos SQLite relacional
    db_path = os.path.join(os.path.dirname(__file__), 'olympus.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'heracles-olimpiada-daw-2026-secret'

    # Inicializar ORM SQLAlchemy
    db.init_app(app)

    # Registro de Blueprints (Vistas Jinja2 y API REST)
    app.register_blueprint(views_bp)
    app.register_blueprint(api_bp)

    # Inicializar tablas y datos iniciales (Seed)
    with app.app_context():
        db.create_all()
        seed_database()

    return app

if __name__ == '__main__':
    app = create_app()
    print("[INFO] Servidor Flask + SQLAlchemy + Jinja2 listo en http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
