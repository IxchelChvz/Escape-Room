/* Identificacion de grupo: envia el nombre (y el PIN) a /api/login y sincroniza el progreso. */
(function () {
    'use strict';

    var formLogin = document.getElementById('formLogin');
    var teamNameInput = document.getElementById('teamNameInput');
    var pinInput = document.getElementById('pinInput');
    var alertBox = document.getElementById('alertBox');
    var submitting = false;

    function showAlert(msg, type) {
        alertBox.textContent = msg;
        alertBox.className = 'alert-msg ' + (type === 'ok' ? 'ok' : type === 'warn' ? 'warn' : 'err');
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function formatTime(sec) {
        sec = Math.max(0, Number(sec) || 0);
        return pad(Math.floor(sec / 3600)) + ':' + pad(Math.floor((sec % 3600) / 60)) + ':' + pad(sec % 60);
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('msg') === 'requerido' || params.get('requerido') === '1') {
        showAlert('Acceso restringido: debes identificarte con tu grupo antes de entrar al mapa de pruebas.', 'warn');
    }

    function saveSession(team) {
        // El servidor es la fuente de verdad: el progreso local se sustituye por el del grupo.
        var ids = (team.solved_trial_ids || []).map(function (n) { return n - 1; });
        try {
            localStorage.setItem('heracles-mapa-done', JSON.stringify(ids));
            var dk = { team: team.name, loggedAt: new Date().toISOString() };
            if (team.is_restored) {
                dk.completed = true;
                dk.elapsed = team.elapsed_seconds;
                dk.timeString = formatTime(team.elapsed_seconds);
            }
            localStorage.setItem('dk', JSON.stringify(dk));
        } catch (e) {}
    }

    function submitLogin(name) {
        if (submitting) return;
        var teamName = (name || teamNameInput.value).trim();
        var pin = pinInput.value.trim();

        if (!teamName) {
            showAlert('Por favor, indica el nombre de tu grupo.', 'err');
            teamNameInput.focus();
            return;
        }
        if (pin && !/^\d{4}$/.test(pin)) {
            showAlert('El PIN debe tener exactamente 4 dígitos.', 'err');
            pinInput.focus();
            return;
        }

        submitting = true;
        showAlert('Identificando grupo «' + teamName + '» en el Olimpo...', 'ok');

        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: teamName, pin: pin })
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data.success) {
                    submitting = false;
                    showAlert(data.message || 'Error al procesar el grupo.', 'err');
                    if (data.needs_pin) pinInput.focus();
                    return;
                }
                saveSession(data.team);
                showAlert(data.is_new
                    ? 'Grupo «' + data.team.name + '» registrado. Partiendo al mapa de la Hélade...'
                    : 'Sesión iniciada con «' + data.team.name + '». Partiendo al mapa de la Hélade...', 'ok');
                setTimeout(function () { window.location.href = '/mapa'; }, 700);
            })
            .catch(function () {
                submitting = false;
                showAlert('No se pudo contactar con el servidor. Comprueba que está en marcha e inténtalo de nuevo.', 'err');
            });
    }

    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        submitLogin();
    });

    // Clic en un grupo ya registrado
    document.querySelectorAll('.team-item').forEach(function (item) {
        item.addEventListener('click', function () {
            var name = item.getAttribute('data-name');
            teamNameInput.value = name;
            if (item.getAttribute('data-pin') === '1' && !pinInput.value.trim()) {
                showAlert('El grupo «' + name + '» está protegido con PIN. Introdúcelo y pulsa Entrar.', 'warn');
                pinInput.focus();
                return;
            }
            submitLogin(name);
        });
    });
})();
