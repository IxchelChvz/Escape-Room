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

// Mostrar grupo activo si esta guardada en localStorage
try {
    var teamData = JSON.parse(localStorage.getItem("dk") || "{}");
    if (teamData.team) {
        var td = document.getElementById("teamDisplay");
        if (td) {
            var a = document.createElement("a");
            a.href = "/login";
            a.className = "link-gold";
            a.textContent = teamData.team;
            td.replaceChildren(a);
        }
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
        timerEl.classList.toggle('timer-danger', rem <= 600);
        if (rem <= 0) {
            timerEl.textContent = '00:00:00';
            if (typeof window.showGameOverScreen === 'function') {
                window.showGameOverScreen();
            }
        }
    }
    tick();
    setInterval(tick, 1000);
})();

// Comprobar sesion de grupo y gestionar boton principal
(function() {
    try {
        var teamData = JSON.parse(localStorage.getItem("dk") || "{}");
        var btnAcceso = document.getElementById("btnAcceso");
        if (btnAcceso) {
            if (teamData && teamData.team && teamData.team.trim()) {
                btnAcceso.textContent = "Continuar al mapa (" + teamData.team + ")";
                btnAcceso.href = "/mapa";
            } else {
                btnAcceso.textContent = "Identificar Grupo y Entrar";
                btnAcceso.href = "/login";
                btnAcceso.addEventListener("click", function(e) {
                    var cur = JSON.parse(localStorage.getItem("dk") || "{}");
                    if (!cur || !cur.team || !cur.team.trim()) {
                        e.preventDefault();
                        window.location.href = "/login?msg=requerido";
                    }
                });
            }
        }
    } catch (err) {}
})();

// Pista 2 de 3 (solo visible en la consola del navegador)
console.log("%cENIGMA DE LA HIDRA DE LERNA", "color:#e0a82e;font-weight:bold;font-size:14px");
console.log("Por cada cabeza cortada nacen dos mas, salvo que cada munon se cauterice.");
console.log("El bucle empieza en 0 y termina antes de 9. Dentro: primero cortarCabeza(i), despues quemarMuñon(i).");
