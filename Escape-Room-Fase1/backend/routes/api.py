# -*- coding: utf-8 -*-
"""
Rutas de API REST para comunicacion Asincrona (DWES + DWEC)
Olympus Tech Solutions - Grupo 4
Sin emojis.
"""

from flask import Blueprint, request, jsonify
from models import db, Labor, GameSession, Team, LaborAttempt

api_bp = Blueprint('api', __name__, url_prefix='/api')

PASS_SECRET = "HERACLES.EXE"

SOLUTIONS = {
    0: {"ans": 0, "type": "quiz", "char": "H"},
    1: {"type": "order", "char": "E"},
    2: {"type": "deer", "char": "R"},
    3: {"ans": 0, "type": "quiz", "char": "A"},
    4: {"type": "dirt", "char": "C"},
    5: {"type": "typos", "char": "L"},
    6: {"ans": 2, "type": "quiz", "char": "E"},
    7: {"type": "simon", "char": "S"},
    8: {"type": "pairs", "char": "."},
    9: {"ans": 1, "type": "quiz", "char": "E"},
    10: {"ans": "HERCULES", "type": "cipher", "char": "X"},
    11: {"ans": [1, 0, 0], "type": "cerberus", "char": "E"}
}

@api_bp.route('/labors', methods=['GET'])
def get_all_labors():
    """Devuelve la lista de trabajos almacenada en la base de datos."""
    labors = Labor.query.order_by(Labor.order_num).all()
    return jsonify([l.to_dict() for l in labors]), 200

@api_bp.route('/validate-trial', methods=['POST'])
def validate_trial():
    """Valida la respuesta de un trabajo y registra el intento en SQLAlchemy."""
    data = request.get_json() or {}
    trial_id = data.get('trialId')

    if trial_id is None or trial_id not in SOLUTIONS:
        return jsonify({"status": "error", "message": "Identificador de trabajo invalido"}), 404

    sol = SOLUTIONS[trial_id]
    is_valid = False

    if sol["type"] == "quiz" and data.get("answer") == sol["ans"]:
        is_valid = True
    elif sol["type"] == "cipher" and (data.get("answer") or "").strip().upper() == sol["ans"]:
        is_valid = True
    elif sol["type"] == "cerberus" and data.get("answers") == sol["ans"]:
        is_valid = True
    elif sol["type"] in ["order", "deer", "dirt", "typos", "simon", "pairs"] and data.get("completed") is True:
        is_valid = True

    # Auditoria del intento en el modelo LaborAttempt
    attempt = LaborAttempt(
        labor_order=trial_id,
        is_correct=is_valid,
        answer_payload=str(data.get("answer") or data.get("completed") or "")[:250]
    )
    db.session.add(attempt)
    db.session.commit()

    if is_valid:
        return jsonify({
            "status": "ok",
            "trialId": trial_id,
            "character": sol["char"],
            "position": trial_id + 1,
            "message": "Validado con exito por SQLAlchemy"
        }), 200
    else:
        return jsonify({
            "status": "rejected",
            "message": "Respuesta incorrecta segun la base de datos"
        }), 400

@api_bp.route('/restore', methods=['POST'])
def restore_temple():
    """Valida la contraseña final y guarda el record del equipo en SQLite."""
    data = request.get_json() or {}
    pwd = (data.get('password') or '').strip().upper()
    team_name = (data.get('team') or 'Equipo Anonimo').strip()
    duration_str = data.get('duration') or '08:00'

    # Calcular duracion en segundos aproximada
    parts = duration_str.split(':')
    seconds = int(parts[0]) * 60 + int(parts[1]) if len(parts) == 2 else 480

    if pwd == PASS_SECRET:
        # Registrar equipo si no existe
        team = Team.query.filter_by(name=team_name).first()
        if not team:
            team = Team(name=team_name)
            db.session.add(team)
            db.session.commit()

        # Registrar sesion completada
        session_record = GameSession(
            team_name=team_name,
            team_id=team.id,
            duration_seconds=seconds,
            formatted_time=duration_str,
            labors_solved=12,
            completed=True,
            password_entered=pwd
        )
        db.session.add(session_record)
        db.session.commit()

        return jsonify({
            "status": "ok",
            "restored": True,
            "message": "Contraseña divina verificada por el ORM. Olimpo Restaurado.",
            "record_id": session_record.id
        }), 200
    else:
        return jsonify({
            "status": "error",
            "restored": False,
            "message": "Contraseña incorrecta. Acceso rechazado por el servidor."
        }), 403

@api_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard_json():
    """Devuelve la clasificacion de equipos en formato JSON."""
    sessions = GameSession.query.order_by(GameSession.duration_seconds.asc()).limit(20).all()
    return jsonify({
        "status": "ok",
        "leaderboard": [s.to_dict() for s in sessions]
    }), 200

@api_bp.route('/login', methods=['POST'])
def login_team():
    """Autentica o registra una grupo sin seleccion de deidades."""
    data = request.get_json() or {}
    team_name = (data.get('name') or data.get('teamName') or '').strip()
    if not team_name:
        return jsonify({"success": False, "message": "El nombre del equipo no puede estar vacio."}), 400

    team = Team.query.filter_by(name=team_name).first()
    if not team:
        team = Team(name=team_name)
        db.session.add(team)
        db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Grupo '{team.name}' registrada correctamente en la base de datos.",
        "team": team.to_dict()
    }), 200

@api_bp.route('/teams', methods=['GET'])
def get_teams():
    """Lista todas las grupos registradas."""
    teams = Team.query.all()
    return jsonify([t.to_dict() for t in teams]), 200

@api_bp.route('/team/current', methods=['GET'])
def get_current_team():
    """Devuelve la grupo activa."""
    team = Team.query.first()
    return jsonify({"authenticated": bool(team), "team": team.to_dict() if team else None}), 200

@api_bp.route('/verify', methods=['POST'])
def verify_password_alias():
    """Alias de verificacion final compatible con /restore."""
    return restore_temple()
