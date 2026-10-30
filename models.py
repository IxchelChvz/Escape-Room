"""Modelos ORM (Flask-SQLAlchemy). Relaciones 1:N con back_populates y una N:M."""

from datetime import datetime

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db
from game_data import format_seconds

# Tabla intermedia N:M: que trabajos ha superado cada grupo.
team_trials = db.Table(
    'team_trials',
    db.Column('team_id', db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), primary_key=True),
    db.Column('trial_id', db.Integer, db.ForeignKey('trials.id', ondelete='CASCADE'), primary_key=True),
    db.Column('solved_at', db.DateTime, default=datetime.utcnow),
)


class Trial(db.Model):
    """Uno de los 12 trabajos de Heracles."""
    __tablename__ = 'trials'

    id = db.Column(db.Integer, primary_key=True)
    num = db.Column(db.Integer, unique=True, nullable=False)
    code = db.Column(db.String(50), nullable=False)
    greek_letter = db.Column(db.String(5), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    module = db.Column(db.String(20), nullable=False)
    concept = db.Column(db.String(100), nullable=False)
    password_char = db.Column(db.String(2), nullable=False)
    pos_x = db.Column(db.Integer, nullable=False)
    pos_y = db.Column(db.Integer, nullable=False)

    # 1:N -> un trabajo recibe muchos envios (la clave foranea esta en Submission)
    submissions = db.relationship('Submission', back_populates='trial',
                                  lazy='dynamic', cascade='all, delete-orphan')
    # N:M -> grupos que lo han superado
    solved_by_teams = db.relationship('Team', secondary=team_trials,
                                      back_populates='solved_trials', lazy='dynamic')

    def to_dict(self, team=None):
        solved = bool(team) and any(t.id == self.id for t in team.solved_trials)
        return {
            "id": self.id,
            "num": self.num,
            "code": self.code,
            "greek": self.greek_letter,
            "name": self.name,
            "module": self.module,
            "concept": self.concept,
            "char": self.password_char,
            "pos": [self.pos_x, self.pos_y],
            "solved": solved,
            "solved_by_count": self.solved_by_teams.count(),
        }


class Team(UserMixin, db.Model):
    """Grupo de jugadores. Es el usuario de Flask-Login (UserMixin)."""
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    access_pin = db.Column(db.String(255), nullable=True)  # hash del PIN, nunca el PIN
    elapsed_seconds = db.Column(db.Integer, default=0)
    trials_completed = db.Column(db.Integer, default=0)
    score = db.Column(db.Integer, default=1000)
    is_restored = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    # 1:N -> un grupo tiene muchos envios y muchas partidas
    submissions = db.relationship('Submission', back_populates='team',
                                  lazy='dynamic', cascade='all, delete-orphan')
    sessions = db.relationship('GameSession', back_populates='team',
                               lazy='dynamic', cascade='all, delete-orphan')
    # N:M -> trabajos superados
    solved_trials = db.relationship('Trial', secondary=team_trials, back_populates='solved_by_teams')

    # ---- PIN con hash (werkzeug.security) ----
    def set_password(self, pin):
        self.access_pin = generate_password_hash(pin) if pin else None

    @property
    def has_pin(self):
        return bool(self.access_pin)

    def check_password(self, pin):
        """True si el grupo no tiene PIN o si el PIN coincide con el hash guardado."""
        if not self.access_pin:
            return True
        stored = self.access_pin
        if stored.startswith(('scrypt:', 'pbkdf2:')):
            return check_password_hash(stored, pin or '')
        # PIN antiguo guardado en claro (version anterior): se compara y se pasa a hash.
        if stored == (pin or ''):
            self.set_password(pin)
            return True
        return False

    # ---- Partida ----
    def current_session(self):
        return (self.sessions.filter_by(completed=False)
                .order_by(GameSession.created_at.desc()).first())

    def start_session(self):
        """Abre una partida nueva (el reloj del servidor empieza aqui)."""
        gs = GameSession(team_id=self.id, team_name=self.name)
        db.session.add(gs)
        return gs

    def reset_progress(self):
        """Borra el progreso del grupo y abre una partida nueva. Conserva el historial de envios."""
        self.solved_trials = []
        self.trials_completed = 0
        self.is_restored = False
        self.elapsed_seconds = 0
        self.score = 1000
        self.completed_at = None
        for gs in self.sessions.filter_by(completed=False).all():
            db.session.delete(gs)
        self.start_session()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "has_pin": self.has_pin,
            "trials_completed": len(self.solved_trials),
            "elapsed_seconds": self.elapsed_seconds,
            "time": format_seconds(self.elapsed_seconds),
            "score": self.score,
            "is_restored": bool(self.is_restored),
            "completed_at": self.completed_at.strftime('%Y-%m-%d %H:%M:%S') if self.completed_at else None,
            "solved_trial_ids": sorted(t.num for t in self.solved_trials),
        }


class Submission(db.Model):
    """Cada intento de resolver un trabajo (N:1 con Team y con Trial)."""
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    trial_id = db.Column(db.Integer, db.ForeignKey('trials.id', ondelete='CASCADE'), nullable=False)
    team_name = db.Column(db.String(100), nullable=False)
    solution_sent = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    team = db.relationship('Team', back_populates='submissions')
    trial = db.relationship('Trial', back_populates='submissions')

    def to_dict(self):
        return {
            "id": self.id,
            "team_id": self.team_id,
            "team_name": self.team_name,
            "trial_id": self.trial_id,
            "solution": self.solution_sent,
            "is_correct": self.is_correct,
            "submitted_at": self.submitted_at.strftime('%Y-%m-%d %H:%M:%S'),
        }


class GameSession(db.Model):
    """Una partida de un grupo: cuando empezo, cuanto tardo y si lo logro (N:1 con Team)."""
    __tablename__ = 'game_sessions'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    team_name = db.Column(db.String(100), nullable=False)
    duration_seconds = db.Column(db.Integer, default=0)
    formatted_time = db.Column(db.String(20), default='00:00:00')
    labors_solved = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)
    password_entered = db.Column(db.String(30), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    team = db.relationship('Team', back_populates='sessions')

    def to_dict(self):
        return {
            "id": self.id,
            "team_id": self.team_id,
            "team_name": self.team_name,
            "duration_seconds": self.duration_seconds,
            "time": self.formatted_time,
            "labors_solved": self.labors_solved,
            "completed": self.completed,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        }
