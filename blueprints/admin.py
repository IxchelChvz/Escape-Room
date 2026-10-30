"""Panel interno /admin para el profesorado: grupos, tiempos, intentos y reinicios."""

import hmac
import secrets
from functools import wraps

from flask import (Blueprint, abort, current_app, flash, redirect,
                   render_template, request, session, url_for)

from extensions import db
from game_data import format_seconds
from models import Submission, Team, Trial

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def admin_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if not session.get('is_admin'):
            return redirect(url_for('admin.admin_login'))
        return view(*args, **kwargs)
    return wrapper


def _csrf_token():
    if '_csrf' not in session:
        session['_csrf'] = secrets.token_hex(16)
    return session['_csrf']


def _check_csrf():
    sent = request.form.get('_csrf', '')
    if not sent or not hmac.compare_digest(sent, session.get('_csrf', '')):
        abort(400)


@admin_bp.app_context_processor
def inject_csrf():
    return {"csrf_token": _csrf_token}


@admin_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        _check_csrf()
        given = request.form.get('password', '')
        real = current_app.config['ADMIN_PASSWORD']
        if hmac.compare_digest(given.encode('utf-8'), real.encode('utf-8')):
            session['is_admin'] = True
            return redirect(url_for('admin.dashboard'))
        flash('Contraseña de administración incorrecta.', 'err')
    return render_template('admin_login.html')


@admin_bp.route('/logout', methods=['POST'])
def admin_logout():
    _check_csrf()
    session.pop('is_admin', None)
    return redirect(url_for('admin.admin_login'))


@admin_bp.route('/')
@admin_required
def dashboard():
    teams = Team.query.order_by(Team.trials_completed.desc(), Team.elapsed_seconds.asc()).all()
    filas = []
    for t in teams:
        filas.append({
            "team": t,
            "solved": len(t.solved_trials),
            "attempts": t.submissions.count(),
            "correct": t.submissions.filter_by(is_correct=True).count(),
            "sessions": t.sessions.count(),
            "time": format_seconds(t.elapsed_seconds) if t.is_restored else '—',
        })
    trials = Trial.query.order_by(Trial.num.asc()).all()
    por_trabajo = [{
        "trial": tr,
        "solved_by": tr.solved_by_teams.count(),
        "attempts": tr.submissions.count(),
    } for tr in trials]
    ultimos = Submission.query.order_by(Submission.submitted_at.desc()).limit(20).all()
    return render_template('admin.html', filas=filas, por_trabajo=por_trabajo, ultimos=ultimos)


@admin_bp.route('/team/<int:team_id>/reset', methods=['POST'])
@admin_required
def reset_team(team_id):
    _check_csrf()
    team = db.session.get(Team, team_id) or abort(404)
    team.reset_progress()
    db.session.commit()
    flash(f'Progreso de «{team.name}» reiniciado.', 'ok')
    return redirect(url_for('admin.dashboard'))


@admin_bp.route('/team/<int:team_id>/delete', methods=['POST'])
@admin_required
def delete_team(team_id):
    _check_csrf()
    team = db.session.get(Team, team_id) or abort(404)
    name = team.name
    db.session.delete(team)
    db.session.commit()
    flash(f'Grupo «{name}» eliminado.', 'ok')
    return redirect(url_for('admin.dashboard'))


@admin_bp.route('/reset-all', methods=['POST'])
@admin_required
def reset_all():
    _check_csrf()
    for team in Team.query.all():
        team.reset_progress()
    db.session.commit()
    flash('Progreso de todos los grupos reiniciado.', 'ok')
    return redirect(url_for('admin.dashboard'))
