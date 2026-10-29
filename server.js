/**
 * HERACLES.EXE // Servidor Local Node.js con API REST y Gestion de Equipos
 * Olympus Tech Solutions - Grupo 4 (DAW)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const FINAL_PASSWORD = 'HERACLES.EXE';
const TEAMS_FILE = path.join(BASE_DIR, 'heracles_teams.json');

// Cargar o inicializar equipos persistidos en JSON
let teams = [
  { id: 1, name: 'Teseo & Jasón (Argonautas)', trials_completed: 12, elapsed_seconds: 1420, score: 1200, is_restored: true },
  { id: 2, name: 'Espartanos de Leónidas', trials_completed: 12, elapsed_seconds: 1650, score: 1100, is_restored: true },
  { id: 3, name: 'Héroes del Código', trials_completed: 0, elapsed_seconds: 0, score: 1000, is_restored: false }
];

try {
  if (fs.existsSync(TEAMS_FILE)) {
    const raw = fs.readFileSync(TEAMS_FILE, 'utf8');
    teams = JSON.parse(raw);
  } else {
    fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2), 'utf8');
  }
} catch (e) {}

function saveTeams() {
  try {
    fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2), 'utf8');
  } catch (e) {}
}

let activeTeamName = 'Héroes del Código';

// Estado en memoria de los 12 trabajos
const trialsState = [
  { num: 1, greek: 'Α', name: 'El León de Nemea', module: 'DIW', concept: 'CSS · Flexbox y Box Model', char: 'H', solved: false },
  { num: 2, greek: 'Β', name: 'La Hidra de Lerna', module: 'DWEC', concept: 'JavaScript · Bucles y Eventos', char: 'E', solved: false },
  { num: 3, greek: 'Γ', name: 'La Cierva de Cerinea', module: 'DWEC', concept: 'JavaScript · Eventos y Evasión', char: 'R', solved: false },
  { num: 4, greek: 'Δ', name: 'El Jabalí de Erimanto', module: 'DIW / DWEC', concept: 'HTML · Accesibilidad y RegEx', char: 'A', solved: false },
  { num: 5, greek: 'Ε', name: 'Los Establos de Augías', module: 'DWES', concept: 'Código Limpio y SQL', char: 'C', solved: false },
  { num: 6, greek: 'Ζ', name: 'Las Aves del Estínfalo', module: 'DAW', concept: 'Depuración y Sintaxis', char: 'L', solved: false },
  { num: 7, greek: 'Η', name: 'El Toro de Creta', module: 'DWES', concept: 'Flask · HTTP y CORS', char: 'E', solved: false },
  { num: 8, greek: 'Θ', name: 'Las Yeguas de Diomedes', module: 'DWEC / DWES', concept: 'Memoria y Permisos Unix', char: 'S', solved: false },
  { num: 9, greek: 'Ι', name: 'El Cinturón de Hipólita', module: 'DIW / DAW', concept: 'HTML Semántico y DevTools', char: '.', solved: false },
  { num: 10, greek: 'Κ', name: 'Los Bueyes de Gerión', module: 'DWEC / DWES', concept: 'JavaScript · Tipos y Jinja2', char: 'E', solved: false },
  { num: 11, greek: 'Λ', name: 'Las Manzanas de las Hespérides', module: 'DWEC', concept: 'Criptografía César', char: 'X', solved: false },
  { num: 12, greek: 'Μ', name: 'Cerbero', module: 'DWES', concept: 'Python, SQL y Tokens JWT', char: 'E', solved: false }
];

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Manejo de CORS pre-flight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // ==========================================
  // RUTAS DE LA API REST
  // ==========================================

  // 1. Login y registro de equipos
  if (pathname === '/api/login' && req.method === 'POST') {
    const data = await parseBody(req);
    const teamName = (data.name || data.teamName || '').trim();

    if (!teamName) {
      return sendJSON(res, 400, { success: false, message: 'El nombre del equipo no puede estar vacío.' });
    }

    let team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    if (!team) {
      team = {
        id: teams.length + 1,
        name: teamName,
        trials_completed: 0,
        elapsed_seconds: 0,
        score: 1000,
        is_restored: false,
        created_at: new Date().toISOString()
      };
      teams.unshift(team);
      saveTeams();
    }
    activeTeamName = team.name;

    return sendJSON(res, 200, {
      success: true,
      message: `Escuadra «${team.name}» autenticada correctamente.`,
      team: team
    });
  }

  if (pathname === '/api/teams' && req.method === 'GET') {
    return sendJSON(res, 200, teams);
  }

  if (pathname === '/api/team/current' && req.method === 'GET') {
    const team = teams.find(t => t.name === activeTeamName);
    return sendJSON(res, 200, { authenticated: !!team, team: team || null });
  }

  if (pathname === '/api/trials' && req.method === 'GET') {
    return sendJSON(res, 200, trialsState);
  }

  if (pathname === '/api/validate-trial' && req.method === 'POST') {
    const data = await parseBody(req);
    const trialId = parseInt(data.trial_id, 10);
    const teamName = (data.team_name || activeTeamName).trim();
    const trial = trialsState.find(t => t.num === trialId);
    if (trial) trial.solved = true;

    const team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    if (team) {
      team.trials_completed = Math.min(12, (team.trials_completed || 0) + 1);
      saveTeams();
    }

    return sendJSON(res, 200, {
      success: true,
      message: `Trabajo #${trialId} registrado correctamente.`,
      char: trial ? trial.char : '',
      trial_id: trialId
    });
  }

  if (pathname === '/api/verify' && req.method === 'POST') {
    const data = await parseBody(req);
    const userPassword = (data.password || '').trim().toUpperCase();
    const teamName = (data.team || activeTeamName).trim();
    const elapsed = parseInt(data.elapsed || 1200, 10);

    if (userPassword === FINAL_PASSWORD) {
      let team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
      if (!team) {
        team = { id: teams.length + 1, name: teamName };
        teams.unshift(team);
      }
      team.is_restored = true;
      team.trials_completed = 12;
      team.elapsed_seconds = elapsed;
      team.score = Math.max(100, 3600 - elapsed);
      team.completed_at = new Date().toISOString();
      saveTeams();

      return sendJSON(res, 200, {
        success: true,
        message: '¡El Olimpo ha sido restaurado!',
        team: team.name,
        elapsed: team.elapsed_seconds
      });
    } else {
      return sendJSON(res, 400, {
        success: false,
        message: 'Contraseña incorrecta. Revisa los caracteres.'
      });
    }
  }

  if (pathname === '/api/leaderboard' && req.method === 'GET') {
    const restoredTeams = teams.filter(t => t.is_restored).sort((a, b) => a.elapsed_seconds - b.elapsed_seconds);
    return sendJSON(res, 200, restoredTeams);
  }

  if (pathname === '/api/reset' && req.method === 'POST') {
    trialsState.forEach(t => t.solved = false);
    return sendJSON(res, 200, { success: true, message: 'Progreso reiniciado' });
  }

  // ==========================================
  // SERVICIO DE ARCHIVOS HTML Y ESTÁTICOS
  // ==========================================
  let filePath = '';
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(BASE_DIR, 'templates', 'index.html');
  } else if (pathname === '/login' || pathname === '/login.html') {
    filePath = path.join(BASE_DIR, 'templates', 'login.html');
  } else if (pathname === '/mapa' || pathname === '/mapa.html') {
    filePath = path.join(BASE_DIR, 'templates', 'mapa.html');
  } else if (pathname === '/restaurada' || pathname === '/webRestaurada.html') {
    filePath = path.join(BASE_DIR, 'templates', 'webRestaurada.html');
  } else if (pathname.startsWith('/static/')) {
    filePath = path.join(BASE_DIR, pathname);
  } else {
    filePath = path.join(BASE_DIR, 'static', pathname);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('HTTP 404 - Recurso no encontrado en el Olimpo.');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[INFO] Servidor HERACLES.EXE iniciado en http://localhost:${PORT}`);
  console.log(`  - 1. Landing:     http://localhost:${PORT}/`);
  console.log(`  - 2. Login:       http://localhost:${PORT}/login`);
  console.log(`  - 3. Mapa:        http://localhost:${PORT}/mapa`);
  console.log(`  - 4. Restaurada:  http://localhost:${PORT}/restaurada`);
});
