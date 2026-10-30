"""
HERACLES.EXE // Backend Flask + SQLAlchemy + Flask-Login + Jinja2
Dódeka - Grupo 4 (DAW)

Estructura:
    app.py            -> crea la aplicacion (factory) y arranca el servidor
    config.py         -> configuracion (variables de entorno)
    extensions.py     -> db y login_manager
    models.py         -> modelos ORM
    game_data.py      -> los 12 trabajos y sus soluciones
    services.py       -> consultas compartidas
    blueprints/       -> main (vistas), api (JSON), admin (panel)
    templates/        -> plantillas Jinja2 (base.html + paginas)
"""

import os

from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_login import current_user

from config import Config
from extensions import db, login_manager
from game_data import DEFAULT_TRIALS, DEMO_TEAMS
from models import Team, Trial


def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='static')
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'main.login'

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(Team, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        if request.path.startswith('/api/'):
            return jsonify({"success": False, "message": "Debes identificar a tu grupo primero."}), 401
        return redirect(url_for('main.login', msg='requerido'))

    @app.context_processor
    def inject_globals():
        """Variables disponibles en TODAS las plantillas."""
        return {
            "active_team": current_user.name if current_user.is_authenticated else None,
            "company": "Dódeka",
        }

    @app.errorhandler(404)
    def not_found(_e):
        if request.path.startswith('/api/'):
            return jsonify({"success": False, "message": "Ruta no encontrada."}), 404
        return render_template('404.html'), 404

    from blueprints.main import main_bp
    from blueprints.api import api_bp
    from blueprints.admin import admin_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(admin_bp)

    init_db(app)
    return app


def init_db(app):
    """Crea las tablas y siembra los 12 trabajos y los grupos de ejemplo."""
    with app.app_context():
        db.create_all()
        if Trial.query.count() == 0:
            for t in DEFAULT_TRIALS:
                db.session.add(Trial(
                    num=t["num"], code=t["code"], greek_letter=t["greek"], name=t["name"],
                    module=t["module"], concept=t["concept"], password_char=t["char"],
                    pos_x=t["pos"][0], pos_y=t["pos"][1],
                ))
            db.session.commit()
        if Team.query.count() == 0:
            trials = Trial.query.all()
            for dt in DEMO_TEAMS:
                team = Team(name=dt["name"], elapsed_seconds=dt["elapsed"], score=dt["score"],
                            is_restored=dt["restored"])
                if dt["restored"]:
                    team.solved_trials = list(trials)
                    team.trials_completed = len(trials)
                db.session.add(team)
            db.session.commit()
            print("[INFO] Base de datos inicializada con éxito.")


app = create_app()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    if not os.environ.get('ADMIN_PASSWORD'):
        print("[INFO] Contraseña de /admin guardada en el archivo .admin_password")
    app.run(host=os.environ.get('HOST', '0.0.0.0'), port=port, debug=debug)
