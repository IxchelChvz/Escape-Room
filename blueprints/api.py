"""API REST (JSON). Las rutas que modifican datos exigen un grupo identificado."""

from datetime import datetime

from flask import Blueprint, current_app, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy.exc import IntegrityError

from extensions import db
from game_data import DEFAULT_TRIALS, format_seconds, normalize
from models import Submission, Team, Trial
from services import all_trials, podio_teams

api_bp = Blueprint('api', __name__, url_prefix='/api')

SOLUTIONS = {t["num"]: t["solution"] for t in DEFAULT_TRIALS}


def _error(message, status):
    return jsonify({"success": False, "message": message}), status


@api_bp.route('/login', methods=['POST'])
def api_login():
    """Entra en un grupo existente (comprobando el PIN) o crea uno nuevo."""
    data = request.get_json(silent=True) or {}
    name = ' '.join(str(data.get('name', '')).split())
    pin = str(data.get('pin', '')).strip()

    if not name:
        return _error("El nombre del grupo no puede estar vacío.", 400)
    if len(name) > 60:
        return _error("El nombre del grupo es demasiado largo (máximo 60 caracteres).", 400)
    if pin and not (pin.isdigit() and len(pin) == 4):
        return _error("El PIN debe tener exactamente 4 dígitos.", 400)

    team = Team.query.filter(db.func.lower(Team.name) == name.lower()).first()
    is_new = team is None
    if is_new:
        team = Team(name=name, score=1000, trials_completed=0, elapsed_seconds=0, is_restored=False)
        team.set_password(pin)
        db.session.add(team)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return _error("Ese nombre de grupo acaba de ser registrado. Inténtalo de nuevo.", 409)
    elif not team.check_password(pin):
        msg = "PIN incorrecto." if pin else "Este grupo está protegido con PIN. Introdúcelo para entrar."
        return jsonify({"success": False, "message": msg, "needs_pin": True}), 401
    else:
        db.session.commit()  # guarda el PIN antiguo ya convertido a hash, si era el caso

    login_user(team, remember=True)
    return jsonify({
        "success": True,
        "is_new": is_new,
        "message": f"Grupo '{team.name}' identificado correctamente.",
        "team": team.to_dict(),
    })


@api_bp.route('/logout', methods=['POST'])
def api_logout():
    logout_user()
    return jsonify({"success": True})


@api_bp.route('/teams', methods=['GET'])
def api_get_teams():
    teams = Team.query.order_by(Team.created_at.desc()).all()
    return jsonify([t.to_dict() for t in teams])


@api_bp.route('/team/current', methods=['GET'])
def api_current_team():
    """Grupo de la sesion actual y su progreso (el navegador lo usa para sincronizarse)."""
    if current_user.is_authenticated:
        return jsonify({"authenticated": True, "team": current_user.to_dict()})
    return jsonify({"authenticated": False, "team": None})


@api_bp.route('/trials', methods=['GET'])
def get_trials():
    team = current_user if current_user.is_authenticated else None
    return jsonify([t.to_dict(team) for t in all_trials()])


@api_bp.route('/validate-trial', methods=['POST'])
@login_required
def validate_trial():
    """
    Comprueba la solucion de un trabajo en el servidor y guarda el progreso del grupo.
    Recibe: { trial_id: 1..12, solution: str }
    """
    data = request.get_json(silent=True) or {}
    try:
        num = int(data.get('trial_id'))
    except (TypeError, ValueError):
        return _error("Trabajo no válido.", 400)
    solution = str(data.get('solution', '')).strip()[:200]

    trial = Trial.query.filter_by(num=num).first()
    if trial is None:
        return _error("Trabajo no encontrado.", 404)

    expected = SOLUTIONS.get(num)
    if expected is None:
        correct = solution.upper() == 'SOLVED'   # minijuego de accion: se resuelve en el navegador
    else:
        correct = normalize(solution) == normalize(expected)

    team = current_user
    db.session.add(Submission(team_id=team.id, team_name=team.name, trial_id=trial.id,
                              solution_sent=solution or '(vacío)', is_correct=correct))
    if not correct:
        db.session.commit()
        return _error("Solución incorrecta.", 400)

    if trial not in team.solved_trials:
        team.solved_trials.append(trial)
    team.trials_completed = len(team.solved_trials)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Trabajo #{num} superado con éxito.",
        "char": trial.password_char,
        "trial_id": num,
        "trials_completed": team.trials_completed,
    })


@api_bp.route('/verify', methods=['POST'])
@login_required
def verify_password():
    """Valida la contraseña final. El tiempo lo calcula el servidor, no el navegador."""
    data = request.get_json(silent=True) or {}
    password = str(data.get('password', '')).strip().upper()
    team = current_user

    if password != current_app.config['FINAL_PASSWORD']:
        return _error("Contraseña incorrecta. Revisa los caracteres.", 400)

    required = current_app.config['REQUIRED_TRIALS']
    if len(team.solved_trials) < required:
        return _error(f"Aún faltan trabajos por superar ({len(team.solved_trials)}/{required}).", 403)

    gs = team.current_session() or team.start_session()
    if not team.is_restored:
        elapsed = max(1, int((datetime.utcnow() - gs.created_at).total_seconds())) if gs.created_at else 1
        team.is_restored = True
        team.trials_completed = len(team.solved_trials)
        team.elapsed_seconds = elapsed
        team.score = max(100, current_app.config['TIME_LIMIT_SECONDS'] - elapsed)
        team.completed_at = datetime.utcnow()
        gs.duration_seconds = elapsed
        gs.formatted_time = format_seconds(elapsed)
        gs.labors_solved = team.trials_completed
        gs.completed = True
        gs.password_entered = password
        db.session.commit()

    return jsonify({
        "success": True,
        "message": "¡El Olimpo ha sido restaurado!",
        "team": team.name,
        "elapsed": team.elapsed_seconds,
        "time": format_seconds(team.elapsed_seconds),
        "score": team.score,
    })


@api_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    teams = (Team.query.filter_by(is_restored=True)
             .order_by(Team.elapsed_seconds.asc()).limit(20).all())
    return jsonify([t.to_dict() for t in teams])


@api_bp.route('/podio', methods=['GET'])
def get_podio():
    return jsonify([p for p in podio_teams() if p])


@api_bp.route('/reset', methods=['POST'])
@login_required
def reset_progress():
    """Reinicia SOLO el progreso del grupo identificado y abre una partida nueva."""
    current_user.reset_progress()
    db.session.commit()
    return jsonify({"success": True, "message": "Progreso reiniciado correctamente."})
