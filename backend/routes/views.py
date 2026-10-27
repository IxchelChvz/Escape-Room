# -*- coding: utf-8 -*-
"""
Rutas de Vistas Renderizadas con Jinja2 (DWES)
Olympus Tech Solutions - Grupo 4 (Paul: Backend DWES)
Sin emojis.
"""

import json
from flask import Blueprint, render_template, redirect, url_for, flash
from backend.models import db, Labor, GameSession, Team, LaborAttempt

views_bp = Blueprint('views', __name__)

@views_bp.route('/')
def index():
    """Vista principal con el mapa y los 12 trabajos consultados desde SQLite."""
    labors = Labor.query.order_by(Labor.order_num).all()
    labors_dict = [l.to_dict() for l in labors]
    return render_template(
        'index.html',
        labors=labors,
        labors_json=json.dumps(labors_dict)
    )

@views_bp.route('/leaderboard')
def leaderboard_view():
    """Vista del cuadro de honor renderizada con herencia Jinja2 y SQLAlchemy."""
    sessions = GameSession.query.order_by(GameSession.duration_seconds.asc()).all()
    return render_template('leaderboard.html', sessions=sessions)

@views_bp.route('/admin')
def admin_view():
    """Panel de control para profesores y evaluadores del ciclo DAW."""
    teams = Team.query.all()
    sessions = GameSession.query.order_by(GameSession.created_at.desc()).all()
    attempts = LaborAttempt.query.order_by(LaborAttempt.created_at.desc()).limit(20).all()
    labors = Labor.query.all()

    return render_template(
        'admin.html',
        teams=teams,
        sessions=sessions,
        attempts=attempts,
        labors=labors
    )

@views_bp.route('/admin/reset', methods=['POST'])
def reset_db_action():
    """Accion administrativa para vaciar intentos y partidas previas."""
    LaborAttempt.query.delete()
    GameSession.query.delete()
    db.session.commit()
    return redirect(url_for('views.admin_view'))
