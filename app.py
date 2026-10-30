"""
HERACLES.EXE // Backend Flask con SQLAlchemy y Jinja2
Olympus Tech Solutions - Grupo 4 (DAW)
"""

import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, template_folder='templates', static_folder='static')

# Configuracion de base de datos SQLite con SQLAlchemy
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
    'sqlite:///' + os.path.join(basedir, 'heracles.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'olimpo-sagrado-clave-secreta-2024'

db = SQLAlchemy(app)

# Contraseña final configurada en el servidor
FINAL_PASSWORD = "HERACLES.EXE"


# ==========================================
# MODELOS DE BASE DE DATOS (SQLAlchemy ORM)
# ==========================================

# 1. Tabla intermedia de asociacion N:M (Muchos a Muchos entre Equipos y Trabajos superados)
team_trials = db.Table(
    'team_trials',
    db.Column('team_id', db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), primary_key=True),
    db.Column('trial_id', db.Integer, db.ForeignKey('trials.id', ondelete='CASCADE'), primary_key=True),
    db.Column('solved_at', db.DateTime, default=datetime.utcnow)
)

class Trial(db.Model):
    """Modelo ORM para los 12 Trabajos de Heracles en la base de datos."""
    __tablename__ = 'trials'

    id = db.Column(db.Integer, primary_key=True)
    num = db.Column(db.Integer, unique=True, nullable=False)
    code = db.Column(db.String(50), nullable=False)
    greek_letter = db.Column(db.String(5), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    module = db.Column(db.String(20), nullable=False)  # DIW, DWEC, DWES, DAW
    concept = db.Column(db.String(100), nullable=False)
    password_char = db.Column(db.String(2), nullable=False)
    pos_x = db.Column(db.Integer, nullable=False)
    pos_y = db.Column(db.Integer, nullable=False)
    is_solved = db.Column(db.Boolean, default=False)
    solved_at = db.Column(db.DateTime, nullable=True)

    # Relaciones ORM 1:N
    submissions = db.relationship('Submission', backref='trial', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
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
            "solved": self.is_solved,
            "solved_by_count": len(self.solved_by_teams)
        }

class Team(db.Model):
    """Modelo ORM para registrar grupos, progreso y clasificacion."""
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    access_pin = db.Column(db.String(20), nullable=True)
    elapsed_seconds = db.Column(db.Integer, default=0)
    trials_completed = db.Column(db.Integer, default=0)
    score = db.Column(db.Integer, default=1000)
    is_restored = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relaciones ORM 1:N (Un equipo tiene multiples envios y sesiones de juego)
    submissions = db.relationship('Submission', backref='team', lazy=True, cascade='all, delete-orphan')
    sessions = db.relationship('GameSession', backref='team', lazy=True, cascade='all, delete-orphan')

    # Relacion ORM N:M (Un equipo resuelve varios trabajos; un trabajo es resuelto por varios equipos)
    solved_trials = db.relationship('Trial', secondary=team_trials, backref=db.backref('solved_by_teams', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "trials_completed": self.trials_completed,
            "elapsed_seconds": self.elapsed_seconds,
            "score": self.score,
            "is_restored": self.is_restored,
            "completed_at": self.completed_at.strftime('%Y-%m-%d %H:%M:%S') if self.completed_at else None,
            "solved_trial_ids": [t.num for t in self.solved_trials]
        }

class Submission(db.Model):
    """Registro relacional ORM de cada intento de resolucion de trabajo por un equipo (1:N)."""
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    trial_id = db.Column(db.Integer, db.ForeignKey('trials.id', ondelete='CASCADE'), nullable=False)
    team_name = db.Column(db.String(100), nullable=False)
    solution_sent = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "team_id": self.team_id,
            "team_name": self.team_name,
            "trial_id": self.trial_id,
            "solution": self.solution_sent,
            "is_correct": self.is_correct,
            "submitted_at": self.submitted_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class GameSession(db.Model):
    """Registro relacional ORM del historial de partidas completadas por grupo (1:N)."""
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

    def to_dict(self):
        return {
            "id": self.id,
            "team_id": self.team_id,
            "team_name": self.team_name,
            "duration_seconds": self.duration_seconds,
            "time": self.formatted_time,
            "labors_solved": self.labors_solved,
            "completed": self.completed,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# Datos iniciales para sembrar la base de datos
DEFAULT_TRIALS = [
    {"num": 1, "code": "ERR_LEON_DE_NEMEA", "greek": "Α", "name": "El León de Nemea", "module": "DIW", "concept": "CSS · Flexbox y Box Model", "char": "H", "pos": [1310, 510]},
    {"num": 2, "code": "ERR_HIDRA_DE_LERNA", "greek": "Β", "name": "La Hidra de Lerna", "module": "DWEC", "concept": "JavaScript · Bucles y Eventos", "char": "E", "pos": [1500, 665]},
    {"num": 3, "code": "ERR_CIERVA_DE_CERINEA", "greek": "Γ", "name": "La Cierva de Cerinea", "module": "DWEC", "concept": "JavaScript · Eventos y Evasion", "char": "R", "pos": [720, 345]},
    {"num": 4, "code": "ERR_JABALI_DE_ERIMANTO", "greek": "Δ", "name": "El Jabalí de Erimanto", "module": "DIW / DWEC", "concept": "HTML · Accesibilidad y RegEx", "char": "A", "pos": [430, 345]},
    {"num": 5, "code": "ERR_ESTABLOS_DE_AUGIAS", "greek": "Ε", "name": "Los Establos de Augías", "module": "DWES", "concept": "Codigo Limpio y SQL", "char": "C", "pos": [190, 485]},
    {"num": 6, "code": "ERR_AVES_DEL_ESTINFALO", "greek": "Ζ", "name": "Las Aves del Estínfalo", "module": "DAW", "concept": "Depuracion y Sintaxis", "char": "L", "pos": [545, 495]},
    {"num": 7, "code": "ERR_TORO_DE_CRETA", "greek": "Η", "name": "El Toro de Creta", "module": "DWES", "concept": "Flask · HTTP y CORS", "char": "E", "pos": [1080, 920]},
    {"num": 8, "code": "ERR_YEGUAS_DE_DIOMEDES", "greek": "Θ", "name": "Las Yeguas de Diomedes", "module": "DWEC / DWES", "concept": "Memoria y Permisos Unix", "char": "S", "pos": [1618, 365]},
    {"num": 9, "code": "ERR_CINTURON_DE_HIPOLITA", "greek": "Ι", "name": "El Cinturón de Hipólita", "module": "DIW / DAW", "concept": "HTML Semantico y DevTools", "char": ".", "pos": [1760, 520]},
    {"num": 10, "code": "ERR_BUEYES_DE_GERION", "greek": "Κ", "name": "Los Bueyes de Gerión", "module": "DWEC / DWES", "concept": "JavaScript · Tipos y Jinja2", "char": "E", "pos": [580, 735]},
    {"num": 11, "code": "ERR_MANZANAS_HESPERIDES", "greek": "Λ", "name": "Las Manzanas de las Hespérides", "module": "DWEC", "concept": "Criptografia Cesar", "char": "X", "pos": [310, 690]},
    {"num": 12, "code": "ERR_CERBERO", "greek": "Μ", "name": "Cerbero", "module": "DWES", "concept": "Python, SQL y Tokens JWT", "char": "E", "pos": [1815, 760]}
]

def init_db():
    """Inicializa la base de datos y siembra los trabajos y equipos por defecto."""
    with app.app_context():
        db.create_all()
        if Trial.query.count() == 0:
            for t in DEFAULT_TRIALS:
                trial = Trial(
                    num=t["num"],
                    code=t["code"],
                    greek_letter=t["greek"],
                    name=t["name"],
                    module=t["module"],
                    concept=t["concept"],
                    password_char=t["char"],
                    pos_x=t["pos"][0],
                    pos_y=t["pos"][1],
                    is_solved=False
                )
                db.session.add(trial)
            
            # Sembrar equipos iniciales
            demo_teams = [
                {"name": "Teseo & Jasón (Argonautas)", "elapsed": 1420, "score": 1200, "restored": True},
                {"name": "Espartanos de Leónidas", "elapsed": 1650, "score": 1100, "restored": True},
                {"name": "Héroes del Código", "elapsed": 0, "score": 1000, "restored": False}
            ]
            for dt in demo_teams:
                if not Team.query.filter_by(name=dt["name"]).first():
                    tm = Team(
                        name=dt["name"],
                        elapsed_seconds=dt["elapsed"],
                        trials_completed=12 if dt["restored"] else 0,
                        score=dt["score"],
                        is_restored=dt["restored"]
                    )
                    db.session.add(tm)
            
            db.session.commit()
            print("[INFO] Base de datos heracles.db inicializada con exito.")

# ==========================================
# RUTAS DE VISTAS (Jinja2)
# ==========================================

@app.route('/')
def home():
    """Renderea la vista principal (Landing Page / Templo Averiado)."""
    trials = Trial.query.order_by(Trial.num.asc()).all()
    active_team = session.get('team_name')
    return render_template('index.html', trials=trials, active_team=active_team)

@app.route('/login')
def login():
    """Renderea la vista de eleccion y registro de equipos."""
    teams = Team.query.order_by(Team.created_at.desc()).all()
    return render_template('login.html', teams=teams)

@app.route('/mapa')
def mapa():
    """Renderea la vista del mapa de pruebas."""
    trials = Trial.query.order_by(Trial.num.asc()).all()
    active_team = session.get('team_name')
    return render_template('mapa.html', trials=trials, active_team=active_team)

@app.route('/restaurada')
def restaurada():
    """Renderea la vista de restauracion exitosa del Olimpo."""
    trials = Trial.query.order_by(Trial.num.asc()).all()
    teams = Team.query.filter_by(is_restored=True).order_by(Team.elapsed_seconds.asc()).limit(15).all()
    active_team = session.get('team_name')
    return render_template('webRestaurada.html', trials=trials, teams=teams, active_team=active_team)

# ==========================================
# ENDPOINTS DE API REST (Backend)
# ==========================================

@app.route('/api/login', methods=['POST'])
def api_login():
    """
    Endpoint para autenticar o registrar un equipo en la base de datos.
    Recibe: { name: str, pin: str }
    """
    data = request.get_json() or {}
    team_name = data.get('name', '').strip()
    pin = data.get('pin', '').strip()

    if not team_name:
        return jsonify({"success": False, "message": "El nombre del equipo no puede estar vacío."}), 400

    team = Team.query.filter_by(name=team_name).first()
    if not team:
        # Crear nuevo equipo en la base de datos
        team = Team(
            name=team_name,
            access_pin=pin if pin else None,
            trials_completed=0,
            score=1000,
            elapsed_seconds=0,
            is_restored=False
        )
        db.session.add(team)
        db.session.commit()

    # Guardar en sesion del servidor Flask
    session['team_name'] = team.name
    session['team_id'] = team.id

    return jsonify({
        "success": True,
        "message": f"Grupo '{team.name}' autenticada correctamente en la base de datos.",
        "team": team.to_dict()
    })

@app.route('/api/teams', methods=['GET'])
def api_get_teams():
    """Devuelve la lista de equipos registrados en la base de datos."""
    teams = Team.query.order_by(Team.created_at.desc()).all()
    return jsonify([t.to_dict() for t in teams])

@app.route('/api/team/current', methods=['GET'])
def api_current_team():
    """Devuelve el equipo activo en la sesion actual."""
    team_name = session.get('team_name')
    if team_name:
        team = Team.query.filter_by(name=team_name).first()
        if team:
            return jsonify({"authenticated": True, "team": team.to_dict()})
    return jsonify({"authenticated": False, "team": None})

@app.route('/api/verify', methods=['POST'])
def verify_password():
    """Endpoint para validar la contraseña final introducida por el usuario y registrar la victoria."""
    data = request.get_json() or {}
    user_input = data.get('password', '').strip().upper()
    team_name = data.get('team', session.get('team_name', 'Héroes del Código')).strip()
    elapsed = int(data.get('elapsed', 0))
    
    if user_input == FINAL_PASSWORD:
        team = Team.query.filter_by(name=team_name).first()
        if not team:
            team = Team(name=team_name)
            db.session.add(team)
        
        team.is_restored = True
        team.trials_completed = 12
        team.elapsed_seconds = elapsed if elapsed > 0 else 1200
        team.score = max(100, 3600 - team.elapsed_seconds)
        team.completed_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "¡El Olimpo ha sido restaurado!",
            "team": team.name,
            "elapsed": team.elapsed_seconds
        })
    else:
        return jsonify({
            "success": False,
            "message": "Contraseña incorrecta. Revisa los caracteres."
        }), 400

@app.route('/api/trials', methods=['GET'])
def get_trials():
    """Devuelve la lista de los 12 trabajos desde la base de datos."""
    trials = Trial.query.order_by(Trial.num.asc()).all()
    return jsonify([t.to_dict() for t in trials])

@app.route('/api/validate-trial', methods=['POST'])
def validate_trial():
    """Valida la solucion de un trabajo individual en el backend y actualiza el progreso del equipo."""
    data = request.get_json() or {}
    trial_id = data.get('trial_id')
    solution = str(data.get('solution', '')).strip()
    team_name = data.get('team_name', session.get('team_name', 'Héroes del Código'))

    trial = Trial.query.filter_by(num=trial_id).first()
    if not trial:
        return jsonify({"success": False, "message": "Trabajo no encontrado."}), 404

    trial.is_solved = True
    trial.solved_at = datetime.utcnow()

    # Actualizar contador de trabajos del equipo
    team = Team.query.filter_by(name=team_name).first()
    if team:
        team.trials_completed = min(12, team.trials_completed + 1)

    sub = Submission(
        team_name=team_name,
        trial_id=trial_id,
        solution_sent=solution,
        is_correct=True
    )
    db.session.add(sub)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Trabajo #{trial_id} superado con exito.",
        "char": trial.password_char,
        "trial_id": trial_id
    })

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Devuelve la lista de mejores tiempos de equipos que han purificado el Olimpo."""
    teams = Team.query.filter_by(is_restored=True).order_by(Team.elapsed_seconds.asc()).limit(20).all()
    return jsonify([t.to_dict() for t in teams])

@app.route('/api/podio', methods=['GET'])
def get_podio():
    """Podio: los 4 ultimos grupos registrados, ordenados de mayor a menor puntuacion (los antiguos no cuentan)."""
    ultimos = Team.query.order_by(Team.created_at.desc(), Team.id.desc()).limit(4).all()
    ultimos.sort(key=lambda t: (-(t.score or 0), t.elapsed_seconds or 0))
    return jsonify([{"name": t.name, "score": t.score or 0} for t in ultimos[:4]])

@app.route('/api/reset', methods=['POST'])
def reset_progress():
    """Reinicia el estado de los trabajos en la base de datos."""
    Trial.query.update({Trial.is_solved: False, Trial.solved_at: None})
    db.session.commit()
    return jsonify({"success": True, "message": "Progreso reiniciado correctamente."})

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
