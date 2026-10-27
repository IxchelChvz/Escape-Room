const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PASS = 'HERACLES.EXE';

// Respuestas correctas del backend protegidas (no visibles en el cliente)
const TRIAL_SOLUTIONS = {
    0: { type: 'quiz', ans: 0, char: 'H' },
    1: { type: 'order', seq: [0, 1, 2, 3], char: 'E' },
    2: { type: 'counter', min: 6, char: 'R' },
    3: { type: 'quiz', ans: 0, char: 'A' },
    4: { type: 'counter', min: 24, char: 'C' },
    5: { type: 'typos', min: 5, char: 'L' },
    6: { type: 'quiz', ans: 2, char: 'E' },
    7: { type: 'simon', min: 5, char: 'S' },
    8: { type: 'pairs', min: 4, char: '.' },
    9: { type: 'quiz', ans: 1, char: 'E' },
    10: { type: 'cipher', ans: 'HERCULES', char: 'X' },
    11: { type: 'cerberus', answers: [1, 0, 0], char: 'E' }
};

// Base de datos en memoria para equipos y clasificacion
const leaderboard = [
    { team: 'Equipo Atenea (Micenas)', time: '05:14', labors: '12/12', timestamp: '2026-10-27 09:30' },
    { team: 'Esparta Devs (DIW)', time: '07:38', labors: '12/12', timestamp: '2026-10-27 09:45' },
    { team: 'Centauros de Tesalia', time: '09:45', labors: '12/12', timestamp: '2026-10-27 10:10' },
    { team: 'Argonautas del DWES', time: '11:20', labors: '12/12', timestamp: '2026-10-27 10:20' }
];

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    // Endpoints de API Backend
    if (req.url.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        // GET /api/leaderboard
        if (req.url === '/api/leaderboard' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'ok', leaderboard }));
            return;
        }

        // POST /api/validate-trial
        if (req.url === '/api/validate-trial' && req.method === 'POST') {
            try {
                const data = await readJsonBody(req);
                const trialId = parseInt(data.trialId, 10);
                const sol = TRIAL_SOLUTIONS[trialId];

                if (!sol) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ status: 'error', message: 'Trabajo no encontrado' }));
                    return;
                }

                let valid = false;
                if (sol.type === 'quiz' && data.answer === sol.ans) valid = true;
                else if (sol.type === 'cipher' && (data.answer || '').trim().toUpperCase() === sol.ans) valid = true;
                else if (sol.type === 'cerberus' && JSON.stringify(data.answers) === JSON.stringify(sol.answers)) valid = true;
                else if (['counter', 'order', 'dirt', 'typos', 'simon', 'pairs'].includes(sol.type) && data.completed === true) valid = true;

                if (valid) {
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        status: 'ok',
                        trialId,
                        character: sol.char,
                        position: trialId + 1,
                        message: 'Prueba validada por el servidor backend'
                    }));
                } else {
                    res.writeHead(400);
                    res.end(JSON.stringify({ status: 'rejected', message: 'Respuesta incorrecta segun el servidor' }));
                }
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ status: 'error', message: 'Error procesando peticion JSON' }));
            }
            return;
        }

        // POST /api/restore
        if (req.url === '/api/restore' && req.method === 'POST') {
            try {
                const data = await readJsonBody(req);
                const pwd = (data.password || '').trim().toUpperCase();
                const team = (data.team || 'Equipo Sin Nombre').trim();
                const duration = data.duration || '07:00';

                if (pwd === PASS) {
                    leaderboard.push({
                        team,
                        time: duration,
                        labors: '12/12',
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
                    });

                    res.writeHead(200);
                    res.end(JSON.stringify({
                        status: 'ok',
                        restored: true,
                        message: 'Maldicion disipada. El Olimpo vuelve a brillar.',
                        team,
                        rank: leaderboard.length
                    }));
                } else {
                    res.writeHead(403);
                    res.end(JSON.stringify({
                        status: 'error',
                        restored: false,
                        message: 'Contraseña incorrecta. Rechazado por el oraculo backend.'
                    }));
                }
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ status: 'error', message: 'Error en el servidor' }));
            }
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ status: 'error', message: 'Endpoint no encontrado' }));
        return;
    }

    // Servidor de estáticos (HTML, CSS, JS)
    let reqUrl = req.url === '/' ? '/index.html' : req.url;
    const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, safePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
                res.end('<h1>404 Not Found - Recurso no encontrado</h1>');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[INFO] Servidor HERACLES.EXE con API Backend iniciado en http://localhost:${PORT}`);
});
