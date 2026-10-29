/* ==========================================================================
   PANTALLA DE COLAPSO CRT RETRO // OJO DE PEZ (FISHEYE) AJUSTADO A PANTALLA
   Manejo de timeout a los 00:00:00 con telemetria y mensaje de derrota (Cero emojis)
   ========================================================================== */

(function () {
    'use strict';

    var TIMER_KEY = 'heracles-timer-end';
    var COUNTDOWN_SECONDS = 90 * 60; // 5400s (1.30h)
    var isGameOverActive = false;

    function getTeamInfo() {
        var name = 'Grupo sin registrar';
        try {
            var dk = JSON.parse(localStorage.getItem('dk') || '{}');
            if (dk && dk.team) name = dk.team;
        } catch (e) {}
        return name;
    }

    function getSolvedCount() {
        var count = 0;
        try {
            var saved = JSON.parse(localStorage.getItem('heracles-mapa-done') || '[]');
            if (Array.isArray(saved)) count = saved.length;
        } catch (e) {}
        return count;
    }

    function getPartialKey() {
        var PASS = 'HERACLES.EXE';
        var chars = [];
        try {
            var saved = JSON.parse(localStorage.getItem('heracles-mapa-done') || '[]');
            var set = new Set(saved);
            for (var i = 0; i < 12; i++) {
                chars.push(set.has(i) ? PASS[i] : '_');
            }
            return chars.join(' ');
        } catch (e) {
            return '_ _ _ _ _ _ _ _ _ _ _ _';
        }
    }

    function removeGameOverScreen() {
        var existing = document.getElementById('crtGameOverModal');
        if (existing) existing.remove();
        document.documentElement.classList.remove('crt-active');
        document.body.classList.remove('crt-active');
        isGameOverActive = false;
    }

    function showGameOverScreen() {
        if (isGameOverActive || document.getElementById('crtGameOverModal')) return;
        // Si el Olimpo ya habia sido restaurado con exito antes de agotarse el tiempo, no mostrar derrota
        if (document.documentElement.classList.contains('restored')) return;
        try {
            var dk = JSON.parse(localStorage.getItem('dk') || '{}');
            if (dk && dk.completed) return;
        } catch (e) {}

        isGameOverActive = true;

        // Bloquear scroll de la pagina de fondo
        document.documentElement.classList.add('crt-active');
        document.body.classList.add('crt-active');

        var teamName = getTeamInfo();
        var solved = getSolvedCount();
        var partialKey = getPartialKey();

        var overlay = document.createElement('div');
        overlay.id = 'crtGameOverModal';
        overlay.className = 'crt-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Alerta de Colapso del Sistema');

        overlay.innerHTML = 
            '<div class="crt-fisheye-frame"></div>' +
            '<div class="crt-fisheye-lens"></div>' +
            '<div class="crt-scanlines"></div>' +
            '<div class="crt-sweep-line"></div>' +
            '<div class="crt-content-wrap">' +
                '<div class="crt-banner">Ooops, el Olimpo Digital ha colapsado irreversiblemente.</div>' +
                '<div class="crt-sep">========================================================================================</div>' +
                '<p class="crt-lead">Si estais viendo este texto en pantalla, vuestro tiempo limite de 1h 30m ha expirado y no habeis sido capaces de recuperar la web.</p>' +
                '<p>Quizas estuvisteis buscando una forma de superar los 12 Trabajos del Codigo para purificar los templos, pero habeis perdido demasiado tiempo. Nadie puede restaurar ya las tablas, las rutas ni los datos del portal sin autorizacion de raiz.</p>' +
                '<p>La maldicion de Hera y el exploit de HERACLES.EXE han tomado el control absoluto de la infraestructura. Todos vuestros archivos de configuracion han sido purgados de forma permanente.</p>' +
                '<div class="crt-farewell">' +
                    'Despedios para siempre del Olimpo Digital.<br>' +
                    'Vuestro esfuerzo ha sido en vano y la sesion ha concluido en derrota total.' +
                '</div>' +
                '<div class="crt-telemetry">' +
                    '<div class="crt-telemetry-header">--- TELEMETRIA DEL COLAPSO (BUILD 1989-2026) ---</div>' +
                    '<div class="crt-telemetry-row">' +
                        '<span class="crt-telemetry-label">ESTADO DEL SERVIDOR :</span>' +
                        '<span class="crt-telemetry-val bad">500 INTERNAL_PURGE // HALTED</span>' +
                    '</div>' +
                    '<div class="crt-telemetry-row">' +
                        '<span class="crt-telemetry-label">TIEMPO RESTANTE     :</span>' +
                        '<span class="crt-telemetry-val bad">00:00:00 [TIEMPO AGOTADO]</span>' +
                    '</div>' +
                    '<div class="crt-telemetry-row">' +
                        '<span class="crt-telemetry-label">GRUPO AFECTADO   :</span>' +
                        '<span class="crt-telemetry-val">' + teamName + '</span>' +
                    '</div>' +
                    '<div class="crt-telemetry-row">' +
                        '<span class="crt-telemetry-label">TRABAJOS SUPERADOS  :</span>' +
                        '<span class="crt-telemetry-val bad">' + solved + ' / 12 [INSUFICIENTE]</span>' +
                    '</div>' +
                    '<div class="crt-telemetry-row">' +
                        '<span class="crt-telemetry-label">CARACTERES CLAVE    :</span>' +
                        '<span class="crt-telemetry-val">' + partialKey + '</span>' +
                    '</div>' +
                    '<div class="crt-telemetry-row">' +
                        '<span class="crt-telemetry-label">VEREDICTO FINAL     :</span>' +
                        '<span class="crt-telemetry-val bad">MISION FALLIDA // ACCESO DENEGADO</span>' +
                    '</div>' +
                '</div>' +
                '<div class="crt-cli">' +
                    '<span>&gt; ROOT@OLIMPO-CRASH:~#</span>' +
                    '<span>SYSTEM_HALTED_TIMEOUT</span>' +
                    '<span class="crt-cursor"></span>' +
                '</div>' +
                '<div class="crt-actions">' +
                    '<button type="button" id="crtResetBtn" class="crt-btn">' +
                        '[ REINICIAR MISION Y RESTABLECER RELOJ (1.30H) ]' +
                    '</button>' +
                    '<button type="button" id="crtCloseBtn" class="crt-btn crt-btn-secondary">' +
                        '[ INSPECCIONAR RUINAS DEL SISTEMA ]' +
                    '</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // Accion: Reiniciar mision
        var resetBtn = document.getElementById('crtResetBtn');
        if (resetBtn) {
            resetBtn.onclick = function () {
                try {
                    localStorage.removeItem('heracles-mapa-done');
                    localStorage.setItem(TIMER_KEY, (Date.now() + COUNTDOWN_SECONDS * 1000).toString());
                    fetch('/api/reset', { method: 'POST' }).catch(function () {});
                } catch (e) {}
                removeGameOverScreen();
                var pill = document.getElementById('crtReopenPill');
                if (pill) pill.remove();
                window.location.reload();
            };
        }

        // Accion: Inspeccionar ruinas (cerrar modal pero mantener indicador)
        var closeBtn = document.getElementById('crtCloseBtn');
        if (closeBtn) {
            closeBtn.onclick = function () {
                removeGameOverScreen();
                ensureReopenPill();
            };
        }
    }

    function ensureReopenPill() {
        if (document.getElementById('crtReopenPill')) return;
        var pill = document.createElement('button');
        pill.id = 'crtReopenPill';
        pill.className = 'crt-reopen-pill';
        pill.type = 'button';
        pill.textContent = '[ ALERTA: TIEMPO AGOTADO - VER COLAPSO ]';
        pill.onclick = function () {
            showGameOverScreen();
        };
        document.body.appendChild(pill);
    }

    function checkTimerStatus() {
        var end = localStorage.getItem(TIMER_KEY);
        if (!end || isNaN(parseInt(end, 10))) return;
        var diff = parseInt(end, 10) - Date.now();
        if (diff <= 0) {
            showGameOverScreen();
        }
    }

    // Exponer globalmente
    window.showGameOverScreen = showGameOverScreen;
    window.checkGameOverCondition = checkTimerStatus;

    // Comprobacion periodica
    setInterval(checkTimerStatus, 1000);

    // Comprobacion inicial tras cargar el DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkTimerStatus);
    } else {
        setTimeout(checkTimerStatus, 300);
    }
})();
