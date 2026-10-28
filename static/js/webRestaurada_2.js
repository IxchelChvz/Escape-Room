// Quita las tildes para que buscar «leon» encuentre «León».
function norm(t) {
    return String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/* --------------- Grid Restaurado ----------------- */
var S = [
    ["León de Nemea", "Noticias", "Las novedades del templo vuelven a poder leerse."],
    ["Hidra de Lerna", "Galería", "Todas las imágenes cargan de nuevo."],
    ["Cierva de Cerinea", "Mapa del sitio", "El mapa guía otra vez por todo el portal."],
    ["Jabalí de Erimanto", "Buscador", "El buscador encuentra cualquier contenido."],
    ["Establos de Augías", "Archivo", "Archivo ordenado y sin código basura."],
    ["Aves del Estínfalo", "Chat", "El chat de los dioses está en línea."],
    ["Toro de Creta", "Tienda", "La tienda de reliquias funciona otra vez."],
    ["Yeguas de Diomedes", "Eventos", "El calendario de eventos ya no se bloquea."],
    ["Cinturón de Hipólita", "Perfil", "Los perfiles de usuario vuelven a abrirse."],
    ["Bueyes de Gerión", "Foro", "El foro de debate está abierto a todos."],
    ["Manzanas de las Hespérides", "Premios", "Diplomas y premios disponibles."],
    ["Cerbero", "Acceso final", "La última puerta del templo está abierta."]
];
var G = ["Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ"];

var g = document.getElementById("grid");

if (g) {
    g.innerHTML = ""; // Limpia cualquier contenido previo
    S.forEach(function(s, i) {
        var li = document.createElement("li");
        li.className = "tile";
        li.innerHTML = "<span class='tgr' aria-hidden='true'></span>" +
            "<span class='tbody'><span class='tname'></span><span class='tdesc'></span><span class='ttag'></span></span>" +
            "<span class='tst'>HTTP 200</span>";
        li.querySelector(".tgr").textContent = G[i];
        li.querySelector(".tname").textContent = s[1];
        li.querySelector(".tdesc").textContent = s[2];
        li.querySelector(".ttag").textContent = "Liberada de " + s[0];
        li.dataset.t = norm(s[0] + " " + s[1] + " " + s[2]);
        g.appendChild(li);
    });
}

// Lógica de la barra de búsqueda
var qInput = document.getElementById("q");
if (qInput) {
    qInput.oninput = function() {
        var v = norm(this.value.trim()),
            c = 0;
        Array.prototype.forEach.call(g.children, function(d) {
            var m = (d.dataset.t || "").indexOf(v) > -1;
            d.style.display = m ? "" : "none";
            if (m) c++;
        });
        var noneEl = document.getElementById("none");
        if (noneEl) noneEl.style.display = c ? "none" : "block";
    };
}

// Formulario de contacto
var form = document.getElementById("f");
if (form) {
    form.onsubmit = function(e) {
        e.preventDefault();
        var n = document.getElementById("n").value.trim(),
            m = document.getElementById("m").value.trim(),
            t = document.getElementById("thanks");
        if (!n || !m) {
            t.className = "msg bad";
            t.textContent = "Rellena tu nombre y el mensaje.";
            return;
        }
        t.className = "msg";
        t.textContent = "¡Gracias, " + n + "! (Prototipo: el mensaje no se envía a ningún sitio.)";
        this.reset();
    };
}

// Nombre del equipo y tiempo empleado desde localStorage
try {
    var s = JSON.parse(localStorage.getItem("dk") || "{}");
    if (s.team) {
        var whoEl = document.getElementById("who");
        if (whoEl) {
            whoEl.innerHTML = "El equipo <b></b> ha superado las pruebas del mapa y reunido los <b>12 caracteres</b>. El Olimpo Digital vuelve a ser vuestro.";
            whoEl.querySelector("b").textContent = s.team;
        }
    }
    var timeStat = document.getElementById("timeTakenStat");
    if (timeStat) {
        if (s.timeString) {
            timeStat.textContent = s.timeString;
        } else if (s.elapsed) {
            var elSec = Number(s.elapsed);
            var h = Math.floor(elSec / 3600);
            var m = Math.floor((elSec % 3600) / 60);
            var sec = elSec % 60;
            var pad = function(n) { return (n < 10 ? "0" : "") + n; };
            timeStat.textContent = pad(h) + ":" + pad(m) + ":" + pad(sec);
        }
    }
} catch (e) {}

// Cargar clasificacion desde la base de datos
fetch("/api/leaderboard")
    .then(function(res) { return res.json(); })
    .then(function(teams) {
        var lbRows = document.getElementById("lbRows");
        if (lbRows && Array.isArray(teams) && teams.length > 0) {
            lbRows.innerHTML = "";
            teams.forEach(function(tm, idx) {
                var tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid rgba(77, 59, 36, 0.3)";
                    var es = Number(tm.elapsed_seconds) || 0;
                    var mins = Math.floor(es / 60);
                    var secs = es % 60;
                    var timeStr = mins + "m " + (secs < 10 ? "0" : "") + secs + "s";
                    tr.innerHTML = "<td style='padding:0.5rem;color:var(--gold-ink);'>#" + (idx + 1) + "</td>" +
                        "<td style='padding:0.5rem;color:var(--text);font-weight:bold;'>" + tm.name + "</td>" +
                        "<td style='padding:0.5rem;color:var(--text);'>" + (tm.trials_completed || 12) + "/12</td>" +
                        "<td style='padding:0.5rem;color:var(--gold-ink);'>" + timeStr + "</td>";
                lbRows.appendChild(tr);
            });
        }
    })
    .catch(function() {});
