/* Web averiada: rellena la lista con las 12 secciones bloqueadas. */
var S = [
    ["León de Nemea", "Noticias"],
    ["Hidra de Lerna", "Galería"],
    ["Cierva de Cerinea", "Mapa del sitio"],
    ["Jabalí de Erimanto", "Buscador"],
    ["Establos de Augías", "Archivo"],
    ["Aves del Estínfalo", "Chat"],
    ["Toro de Creta", "Tienda"],
    ["Yeguas de Diomedes", "Eventos"],
    ["Cinturón de Hipólita", "Perfil"],
    ["Bueyes de Gerión", "Foro"],
    ["Manzanas de las Hespérides", "Premios"],
    ["Cerbero", "Acceso final"]
];
var G = ["Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ"];
var g = document.getElementById("grid");

// "León de Nemea" -> "ERR_LEON_DE_NEMEA"
function code(n) {
    return "ERR_" + n.normalize("NFD").replace(/[̀-ͯ]/g, "")
        .toUpperCase().replace(/[^A-Z]+/g, "_");
}

S.forEach(function (s, i) {
    var li = document.createElement("li");
    li.className = "tile";
    li.innerHTML = "<span class='tgr' aria-hidden='true'></span>" +
        "<span class='tbody'><span class='tname'></span><span class='ttag'></span></span>" +
        "<span class='tst'>ΣΦΑΛΜΑ 403</span>";
    li.querySelector(".tgr").textContent = G[i];
    li.querySelector(".tname").textContent = s[1];
    li.querySelector(".ttag").textContent = "Bloqueada · " + code(s[0]);
    g.appendChild(li);
});

// Mostrar escuadra activa si esta guardada en localStorage
try {
    var teamData = JSON.parse(localStorage.getItem("dk") || "{}");
    if (teamData.team) {
        var td = document.getElementById("teamDisplay");
        if (td) td.innerHTML = '<a href="/login" style="color:var(--gold-ink);text-decoration:none;">' + teamData.team + '</a>';
    }
} catch (e) {}

// Contador de tiempo restante de 1h 30m (5400s)
(function() {
    var timerEl = document.getElementById("timerVal");
    if (!timerEl) return;
    var COUNTDOWN_SECONDS = 90 * 60;
    var TIMER_KEY = "heracles-timer-end";
    var end = localStorage.getItem(TIMER_KEY);
    if (!end || isNaN(parseInt(end, 10))) {
        end = Date.now() + COUNTDOWN_SECONDS * 1000;
        localStorage.setItem(TIMER_KEY, end.toString());
    } else {
        end = parseInt(end, 10);
    }
    function tick() {
        var rem = Math.max(0, Math.floor((end - Date.now()) / 1000));
        var h = Math.floor(rem / 3600);
        var m = Math.floor((rem % 3600) / 60);
        var s = rem % 60;
        timerEl.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        if (rem <= 600 && rem > 0) {
            timerEl.style.color = '#e5603f';
        } else if (rem <= 0) {
            timerEl.style.color = '#e5603f';
            timerEl.textContent = '00:00:00';
            if (typeof window.showGameOverScreen === 'function') {
                window.showGameOverScreen();
            }
        }
    }
    tick();
    setInterval(tick, 1000);
})();
