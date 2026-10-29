# -*- coding: utf-8 -*-
"""
HERACLES.EXE - Modelos ORM con SQLAlchemy
Olympus Tech Solutions - Grupo 4 (Paul: Backend DWES)
Sin emojis.
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Labor(db.Model):
    """Modelo ORM que almacena los 12 trabajos de Heracles y su configuracion DAW."""
    __tablename__ = 'labors'

    id = db.Column(db.Integer, primary_key=True)
    order_num = db.Column(db.Integer, unique=True, nullable=False)
    greek_letter = db.Column(db.String(4), nullable=False)
    short_label = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    module_tag = db.Column(db.String(100), nullable=False)
    character_reward = db.Column(db.String(2), nullable=False)
    map_x = db.Column(db.Integer, nullable=False)
    map_y = db.Column(db.Integer, nullable=False)
    story = db.Column(db.Text, nullable=False)
    challenge_type = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'order': self.order_num,
            'greek_letter': self.greek_letter,
            'label': self.short_label,
            'title': self.title,
            'location': self.location,
            'module_tag': self.module_tag,
            'character': self.character_reward,
            'map_x': self.map_x,
            'map_y': self.map_y,
            'story': self.story,
            'challenge_type': self.challenge_type
        }

class Team(db.Model):
    """Modelo ORM para los equipos participantes en el Escape Room."""
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    group_code = db.Column(db.String(30), default='DAW-2026')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sessions = db.relationship('GameSession', backref='team_ref', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'group_code': self.group_code,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }

class GameSession(db.Model):
    """Modelo ORM que registra una partida, tiempo y estado de purga del Olimpo."""
    __tablename__ = 'game_sessions'

    id = db.Column(db.Integer, primary_key=True)
    team_name = db.Column(db.String(120), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=True)
    duration_seconds = db.Column(db.Integer, default=0)
    formatted_time = db.Column(db.String(20), default='00:00')
    labors_solved = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)
    password_entered = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    attempts = db.relationship('LaborAttempt', backref='session_ref', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'team': self.team_name,
            'time': self.formatted_time,
            'duration_seconds': self.duration_seconds,
            'labors': f"{self.labors_solved}/12",
            'completed': self.completed,
            'date': self.created_at.strftime('%Y-%m-%d %H:%M')
        }

class LaborAttempt(db.Model):
    """Auditoria ORM de cada intento de resolucion en el servidor."""
    __tablename__ = 'labor_attempts'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('game_sessions.id'), nullable=True)
    labor_order = db.Column(db.Integer, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    answer_payload = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
