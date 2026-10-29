"""
HERACLES.EXE // Backend Flask con SQLAlchemy y Jinja2
Olympus Tech Solutions - Grupo 4 (DAW)
Servidor unificado de la plataforma educativa.
"""

import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Carga de variables de entorno (.env)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Fallback para lectura de .env si python-dotenv no estuviera cargado
env_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip())

app = Flask(__name__, template_folder='templates', static_folder='static')

# Configuracion de base de datos SQLite con SQLAlchemy
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
    'sqlite:///' + os.path.join(basedir, 'heracles.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'olimpo-sagrado-clave-secreta-2024')

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'OLIMPO_ADMIN_2024')
FINAL_PASSWORD = os.environ.get('FINAL_PASSWORD', 'HERACLES.EXE')

db = SQLAlchemy(app)

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
    access_pin = db.Column(db.String(255), nullable=True)  # Hash seguro PBKDF2/scrypt
    elapsed_seconds = db.Column(db.Integer, default=0)
    trials_completed = db.Column(db.Integer, default=0)
    score = db.Column(db.Integer, default=1000)
    is_restored = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relaciones ORM 1:N
    submissions = db.relationship('Submission', backref='team', lazy=True, cascade='all, delete-orphan')
    sessions = db.relationship('GameSession', backref='team', lazy=True, cascade='all, delete-orphan')

    # Relacion ORM N:M
    solved_trials = db.relationship('Trial', secondary=team_trials, backref=db.backref('solved_by_teams', lazy=True))

    def set_pin(self, pin):
        """Genera hash seguro para el PIN de acceso."""
        if pin:
            self.access_pin = generate_password_hash(str(pin).strip())
        else:
            self.access_pin = None

    def check_pin(self, pin):
        """Verifica el PIN contra el hash guardado."""
        if not self.access_pin:
            return True
        if not pin:
            return False
        pin_str = str(pin).strip()
        if self.access_pin.startswith('pbkdf2:') or self.access_pin.startswith('scrypt:'):
            return check_password_hash(self.access_pin, pin_str)
        # Soporte para registros historicos en texto plano
        return self.access_pin == pin_str

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "has_pin": bool(self.access_pin),
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

# Diccionario de soluciones canonicas validadas del lado del servidor
CANONICAL_SOLUTIONS = {
    1: ["align-items", "align-items: center", "0", "align-items;", "align_items"],
    2: ["cortarcabeza;quemarmuñon", "cortarcabeza;quemarmuñon;", "solved", "for (let i = 0; i < 9; i++)"],
    3: ["cerinea_captured", "6", "solved", "cerinea"],
    4: ["alt", "alt=", "0", "alt=\"jabalí de erimanto\""],
    5: ["cleaned", "solved", "establos_limpios"],
    6: ["erratas_derribadas", "5", "solved", "fucntion,consle.log,retrun,arr.lenght,documnet"],
    7: ["404", "404 not found", "2"],
    8: ["simon_complete", "solved", "5", "yeguas_calmadas"],
    9: ["pairs_matched", "solved", "4", "cinturon_entregado"],
    10: ["false", "1"],
    11: ["hercules", "hércules"],
    12: ["cerbero_solved", "solved", "3;distinct;ls -a", "distinct", "ls -a"]
}

def is_valid_solution(num, sent_solution):
    """Valida una solucion recibida comparandola con las respuestas canonicas."""
    if not sent_solution:
        return False
    sent = str(sent_solution).strip().lower()
    if sent == "solved":
        return True
    valid_list = CANONICAL_SOLUTIONS.get(num, [])
    for sol in valid_list:
        if str(sol).strip().lower() == sent:
            return True
    return False

# Datos iniciales para sembrar la base de datos
DEFAULT_TRIALS = [
    {"num": 1, "code": "ERR_LEON_DE_NEMEA", "greek": "Α", "name": "El León de Nemea", "module": "DIW", "concept": "CSS · Flexbox y Box Model", "char": "H", "pos": [660, 265]},
    {"num": 2, "code": "ERR_HIDRA_DE_LERNA", "greek": "Β", "name": "La Hidra de Lerna", "module": "DWEC", "concept": "JavaScript · Bucles y Eventos", "char": "E", "pos": [755, 335]},
    {"num": 3, "code": "ERR_CIERVA_DE_CERINEA", "greek": "Γ", "name": "La Cierva de Cerinea", "module": "DWEC", "concept": "JavaScript · Eventos y Evasión", "char": "R", "pos": [365, 175]},
    {"num": 4, "code": "ERR_JABALI_DE_ERIMANTO", "greek": "Δ", "name": "El Jabalí de Erimanto", "module": "DIW / DWEC", "concept": "HTML · Accesibilidad y RegEx", "char": "A", "pos": [230, 175]},
    {"num": 5, "code": "ERR_ESTABLOS_DE_AUGIAS", "greek": "Ε", "name": "Los Establos de Augías", "module": "DWES", "concept": "Código Limpio y SQL", "char": "C", "pos": [105, 240]},
    {"num": 6, "code": "ERR_AVES_DEL_ESTINFALO", "greek": "Ζ", "name": "Las Aves del Estínfalo", "module": "DAW", "concept": "Depuración y Sintaxis", "char": "L", "pos": [270, 240]},
    {"num": 7, "code": "ERR_TORO_DE_CRETA", "greek": "Η", "name": "El Toro de Creta", "module": "DWES", "concept": "Flask · HTTP y CORS", "char": "E", "pos": [565, 470]},
    {"num": 8, "code": "ERR_YEGUAS_DE_DIOMEDES", "greek": "Θ", "name": "Las Yeguas de Diomedes", "module": "DWEC / DWES", "concept": "Memoria y Permisos Unix", "char": "S", "pos": [710, 165]},
    {"num": 9, "code": "ERR_CINTURON_DE_HIPOLITA", "greek": "Ι", "name": "El Cinturón de Hipólita", "module": "DIW / DAW", "concept": "HTML Semántico y DevTools", "char": ".", "pos": [890, 260]},
    {"num": 10, "code": "ERR_BUEYES_DE_GERION", "greek": "Κ", "name": "Los Bueyes de Gerión", "module": "DWEC / DWES", "concept": "JavaScript · Tipos y Jinja2", "char": "E", "pos": [285, 360]},
    {"num": 11, "code": "ERR_MANZANAS_HESPERIDES", "greek": "Λ", "name": "Las Manzanas de las Hespérides", "module": "DWEC", "concept": "Criptografía César", "char": "X", "pos": [160, 360]},
    {"num": 12, "code": "ERR_CERBERO", "greek": "Μ", "name": "Cerbero", "module": "DWES", "concept": "Python, SQL y Tokens JWT", "char": "E", "pos": [895, 405]}
]

def init_db():
    """Inicializa la base de datos y siembra los trabajos y equipos por defecto."""
    with app.app_context():
        db.create_all()
        for t in DEFAULT_TRIALS:
            trial = Trial.query.filter_by(num=t["num"]).first()
            if trial:
                trial.pos_x = t["pos"][0]
                trial.pos_y = t["pos"][1]
        db.session.commit()
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
            
            # Sembrar equipos iniciales de prueba
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
            print("[INFO] Base de datos heracles.db inicializada con éxito.")

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
    """Renderea la vista de elección y registro de equipos."""
    teams = Team.query.order_by(Team.created_at.desc()).all()
    active_team = session.get('team_name')
    return render_template('login.html', teams=teams, active_team=active_team)

@app.route('/mapa')
def mapa():
    """Renderea la vista del mapa de pruebas."""
    trials = Trial.query.order_by(Trial.num.asc()).all()
    active_team = session.get('team_name')
    return render_template('mapa.html', trials=trials, active_team=active_team)

@app.route('/restaurada')
def restaurada():
    """Renderea la vista de restauración exitosa del Olimpo."""
    trials = Trial.query.order_by(Trial.num.asc()).all()
    teams = Team.query.filter_by(is_restored=True).order_by(Team.elapsed_seconds.asc()).limit(15).all()
    active_team = session.get('team_name')
    return render_template('webRestaurada.html', trials=trials, teams=teams, active_team=active_team)

@app.route('/admin')
def admin_dashboard():
    """Renderea el panel interno de supervisión para evaluadores y organizadores."""
    teams = Team.query.order_by(Team.trials_completed.desc(), Team.score.desc()).all()
    submissions = Submission.query.order_by(Submission.submitted_at.desc()).limit(50).all()
    trials = Trial.query.order_by(Trial.num.asc()).all()
    stats = {
        "total_teams": Team.query.count(),
        "restored_teams": Team.query.filter_by(is_restored=True).count(),
        "total_submissions": Submission.query.count(),
        "correct_submissions": Submission.query.filter_by(is_correct=True).count()
    }
    return render_template('admin.html', teams=teams, submissions=submissions, trials=trials, stats=stats)

# ==========================================
# ENDPOINTS DE API REST (Backend)
# ==========================================

@app.route('/api/login', methods=['POST'])
def api_login():
    """
    Endpoint para autenticar o registrar un equipo en la base de datos.
    Comprueba PIN con hash criptográfico si el equipo ya está registrado.
    """
    data = request.get_json() or {}
    team_name = data.get('name', '').strip()
    pin = str(data.get('pin', '')).strip()

    if not team_name:
        return jsonify({"success": False, "message": "El nombre del equipo no puede estar vacío."}), 400

    team = Team.query.filter_by(name=team_name).first()
    is_new = False

    if not team:
        # Crear nuevo equipo con PIN hasheado
        team = Team(
            name=team_name,
            trials_completed=0,
            score=1000,
            elapsed_seconds=0,
            is_restored=False
        )
        if pin:
            team.set_pin(pin)
        db.session.add(team)
        db.session.commit()
        is_new = True
    else:
        # Verificar PIN si el equipo ya tiene uno configurado
        if team.access_pin:
            if not pin or not team.check_pin(pin):
                return jsonify({
                    "success": False,
                    "message": f"PIN de acceso incorrecto para el grupo '{team_name}'."
                }), 401
        elif pin:
            # Si existía sin PIN y el usuario asigna uno, guardarlo
            team.set_pin(pin)
            db.session.commit()

    # Guardar en sesión de Flask
    session['team_name'] = team.name
    session['team_id'] = team.id

    return jsonify({
        "success": True,
        "is_new": is_new,
        "message": f"Grupo '{team.name}' autenticado correctamente en la base de datos.",
        "team": team.to_dict()
    })

@app.route('/api/teams', methods=['GET'])
def api_get_teams():
    """Devuelve la lista de equipos registrados en la base de datos."""
    teams = Team.query.order_by(Team.created_at.desc()).all()
    return jsonify([t.to_dict() for t in teams])

@app.route('/api/team/current', methods=['GET'])
def api_current_team():
    """Devuelve el equipo activo en la sesión actual."""
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
            "message": "Contraseña incorrecta. Revisa los caracteres de las pruebas."
        }), 400

@app.route('/api/trials', methods=['GET'])
def get_trials():
    """Devuelve la lista de los 12 trabajos desde la base de datos."""
    trials = Trial.query.order_by(Trial.num.asc()).all()
    return jsonify([t.to_dict() for t in trials])

@app.route('/api/validate-trial', methods=['POST'])
def validate_trial():
    """
    Valida la solución de un trabajo individual en el backend,
    registra el intento con team_id y actualiza la relación N:M team_trials.
    """
    data = request.get_json() or {}
    trial_id = data.get('trial_id')
    solution = str(data.get('solution', '')).strip()
    team_name = data.get('team_name') or session.get('team_name') or 'Héroes del Código'

    if not trial_id:
        return jsonify({"success": False, "message": "Identificador de trabajo no proporcionado."}), 400

    try:
        trial_num = int(trial_id)
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Identificador de trabajo inválido."}), 400

    trial = Trial.query.filter_by(num=trial_num).first()
    if not trial:
        return jsonify({"success": False, "message": "Trabajo no encontrado en la base de datos."}), 404

    # Obtener o registrar equipo
    team = Team.query.filter_by(name=team_name).first()
    if not team:
        team = Team(name=team_name)
        db.session.add(team)
        db.session.flush()

    # Validacion de solucion del lado del servidor
    correct = is_valid_solution(trial.num, solution)

    # Registrar el intento en la tabla Submission (team_id siempre presente)
    sub = Submission(
        team_id=team.id,
        trial_id=trial.id,
        team_name=team.name,
        solution_sent=solution,
        is_correct=correct
    )
    db.session.add(sub)

    if not correct:
        db.session.commit()
        return jsonify({
            "success": False,
            "message": f"Solución errónea para el Trabajo #{trial.num}."
        }), 400

    # Asociar a team_trials (N:M por equipo)
    if trial not in team.solved_trials:
        team.solved_trials.append(trial)
        team.trials_completed = len(team.solved_trials)
        team.score = max(100, team.score + 50)

    # Actualizar estado global del trial para compatibilidad
    trial.is_solved = True
    trial.solved_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Trabajo #{trial.num} superado con éxito.",
        "char": trial.password_char,
        "trial_id": trial.num,
        "trials_completed": team.trials_completed
    })

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Devuelve la lista de mejores tiempos de equipos que han purificado el Olimpo."""
    teams = Team.query.filter_by(is_restored=True).order_by(Team.elapsed_seconds.asc()).limit(20).all()
    return jsonify([t.to_dict() for t in teams])

@app.route('/api/reset', methods=['POST'])
def reset_progress():
    """
    Reinicia el estado de los trabajos y auditorias en la base de datos.
    Requiere token de autorizacion de administracion.
    """
    req_token = request.headers.get('X-Admin-Token') or \
                request.form.get('token') or \
                request.form.get('admin_token') or \
                (request.get_json(silent=True) or {}).get('token') or \
                (request.get_json(silent=True) or {}).get('admin_token')

    if not req_token or req_token.strip() != ADMIN_TOKEN:
        return jsonify({
            "success": False,
            "message": "Acceso denegado: se requiere token de administrador válido."
        }), 403

    Trial.query.update({Trial.is_solved: False, Trial.solved_at: None})
    db.session.execute(team_trials.delete())
    Team.query.update({
        Team.trials_completed: 0,
        Team.is_restored: False,
        Team.elapsed_seconds: 0,
        Team.score: 1000,
        Team.completed_at: None
    })
    Submission.query.delete()
    db.session.commit()

    return jsonify({"success": True, "message": "Progreso y auditorías reiniciados correctamente por el administrador."})

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 3000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
