"""Vistas HTML renderizadas con Jinja2."""

from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import current_user, login_required, logout_user

from extensions import db
from game_data import format_seconds
from models import Team
from services import all_trials, podio_teams

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def home():
    """Templo averiado (landing)."""
    return render_template('index.html', trials=all_trials())


@main_bp.route('/login')
def login():
    """Identificacion de grupo (lista de grupos renderizada con Jinja2)."""
    teams = Team.query.order_by(Team.created_at.desc()).all()
    return render_template('login.html', teams=teams)


@main_bp.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.login'))


@main_bp.route('/mapa')
@login_required
def mapa():
    """Mapa de pruebas. Solo para grupos identificados; aqui arranca el reloj del servidor."""
    if current_user.current_session() is None and not current_user.is_restored:
        current_user.start_session()
        db.session.commit()
    return render_template('mapa.html', trials=all_trials())


@main_bp.route('/restaurada')
def restaurada():
    """Web restaurada. Requiere haber ganado, salvo en modo presentacion (?presentacion=1)."""
    presentacion = request.args.get('presentacion') is not None
    if not presentacion and not (current_user.is_authenticated and current_user.is_restored):
        return redirect(url_for('main.mapa'))
    tiempo = None
    if current_user.is_authenticated and current_user.is_restored:
        tiempo = format_seconds(current_user.elapsed_seconds)
    return render_template('webRestaurada.html', podio=podio_teams(), tiempo=tiempo)
