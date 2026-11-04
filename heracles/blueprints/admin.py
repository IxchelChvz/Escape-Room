"""Panel interno /admin para el profesorado: grupos, tiempos, intentos y reinicios."""

import hmac
import secrets
from functools import wraps

from flask import (Blueprint, abort, current_app, flash, redirect,
                   render_template, request, session, url_for)

import segno

from ..extensions import db
from ..game_data import format_seconds
from ..models import Submission, Team, Trial

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
    trials = Trial.query.order_by(Trial.num.asc()).all()
    filas = []
    for t in teams:
        superadas = {tr.id for tr in t.solved_trials}
        filas.append({
            "team": t,
            "solved": len(t.solved_trials),
            "attempts": t.submissions.count(),
            "correct": t.submissions.filter_by(is_correct=True).count(),
            "sessions": t.sessions.count(),
            "time": format_seconds(t.elapsed_seconds) if t.is_restored else '—',
            # pruebas que aun no ha superado: las que se pueden desbloquear si el grupo se atasca
            "pendientes": [tr for tr in trials if tr.id not in superadas],
        })
    por_trabajo = [{
        "trial": tr,
        "solved_by": tr.solved_by_teams.count(),
        "attempts": tr.submissions.count(),
    } for tr in trials]
    ultimos = Submission.query.order_by(Submission.submitted_at.desc()).limit(20).all()
    return render_template('admin.html', filas=filas, por_trabajo=por_trabajo, ultimos=ultimos)


@admin_bp.route('/qr')
@admin_required
def qr_hesperides():
    """QR imprimible de las Hesperides. Usa la direccion con la que se abre el panel,
    asi que hay que entrar por la IP de la red (no por localhost) para que funcione en los moviles."""
    url = url_for('main.oraculo', token=current_app.config['QR_TOKEN'], _external=True)
    svg = segno.make(url, error='m').svg_inline(scale=10, dark='#1a1204', light='#ffffff')
    local = request.host.split(':')[0] in ('localhost', '127.0.0.1', '[::1]')
    return render_template('admin_qr.html', url=url, svg=svg, local=local)


@admin_bp.route('/team/<int:team_id>/reset', methods=['POST'])
@admin_required
def reset_team(team_id):
    _check_csrf()
    team = db.session.get(Team, team_id) or abort(404)
    team.reset_progress()
    db.session.commit()
    flash(f'Progreso de «{team.name}» reiniciado.', 'ok')
    return redirect(url_for('admin.dashboard'))


@admin_bp.route('/team/<int:team_id>/pass', methods=['POST'])
@admin_required
def pass_trial(team_id):
    """Da por superada una prueba a un grupo que se ha quedado atascado, para que pueda seguir."""
    _check_csrf()
    team = db.session.get(Team, team_id) or abort(404)
    try:
        num = int(request.form.get('trial', ''))
    except ValueError:
        num = 0
    trial = Trial.query.filter_by(num=num).first()
    if trial is None:
        flash('Elige una prueba válida.', 'err')
        return redirect(url_for('admin.dashboard'))
    if trial in team.solved_trials:
        flash(f'«{team.name}» ya tenía superada la prueba {trial.num}.', 'ok')
        return redirect(url_for('admin.dashboard'))
    team.solved_trials.append(trial)
    team.trials_completed = len(team.solved_trials)
    # Queda registrado en el historial de intentos para saber que lo concedio la administracion
    db.session.add(Submission(team_id=team.id, team_name=team.name, trial_id=trial.id,
                              solution_sent='(superada por la administración)', is_correct=True))
    db.session.commit()
    flash(f'Prueba {trial.num} ({trial.name}) marcada como superada para «{team.name}».', 'ok')
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
