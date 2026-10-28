// Quita las tildes para que buscar «leon» encuentre «León».
function norm(t) {
    return String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/* --------------- Grid Restaurado ----------------- */
var S = [
    ["León de Nemea", "Noticias", "🦁", "Su piel invulnerable cedió: ya se pueden leer las novedades del templo."],
    ["Hidra de Lerna", "Galería", "🐍", "Cada cabeza cortada devolvió una imagen. La galería carga de nuevo."],
    ["Cierva de Cerinea", "Mapa del sitio", "🦌", "Atrapada con paciencia: el mapa vuelve a guiar por todo el templo."],
    ["Jabalí de Erimanto", "Buscador", "🐗", "Capturado en la nieve: el buscador encuentra cualquier contenido."],
    ["Establos de Augías", "Archivo", "🐴", "Limpiados en un día: el archivo está ordenado y sin código basura."],
    ["Aves del Estínfalo", "Chat", "🐦", "Ahuyentadas con ruido: el chat de los dioses está en línea."],
    ["Toro de Creta", "Tienda", "🐂", "Domado: la tienda de reliquias funciona otra vez."],
    ["Yeguas de Diomedes", "Eventos", "🐎", "Calmadas: el calendario de eventos ya no se bloquea."],
    ["Cinturón de Hipólita", "Perfil", "👑", "Recuperado: los perfiles de usuario vuelven a abrirse."],
    ["Bueyes de Gerión", "Foro", "🐄", "Reunido: el foro de debate está abierto a todos."],
    ["Manzanas de las Hespérides", "Premios", "🍎", "Conseguidas: los diplomas y premios están disponibles."],
    ["Cerbero", "Acceso final", "🐕", "Vencido: la última puerta del templo está abierta."]
];

var g = document.getElementById("grid");

if (g) {
    g.innerHTML = ""; // Limpia cualquier contenido previo
    S.forEach(function(s, i) {
        var d = document.createElement("article");
        d.className = "card";
        var h = document.createElement("h3");
        h.textContent = s[1];
        var im = document.createElement("div");
        im.className = "img";
        im.innerHTML = "<span aria-hidden='true'></span>imagen_" + (i + 1) + ".png ✔";
        im.firstChild.textContent = s[2];
        var p = document.createElement("p");
        p.textContent = s[3];
        var st = document.createElement("div");
        st.className = "st";
        st.textContent = "✔ Desbloqueada · vencido: " + s[0];
        d.appendChild(h);
        d.appendChild(im);
        d.appendChild(p);
        d.appendChild(st);
        d.dataset.t = norm(s[0] + " " + s[1] + " " + s[3]);
        g.appendChild(d);
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
            t.style.color = "#b3261e";
            t.textContent = "Rellena tu nombre y el mensaje.";
            return;
        }
        t.style.color = "";
        t.textContent = "¡Gracias, " + n + "! (Prototipo: el mensaje no se envía a ningún sitio.)";
        this.reset();
    };
}

// Nombre del equipo desde localStorage
try {
    var s = JSON.parse(localStorage.getItem("dk") || "{}");
    if (s.team) {
        var whoEl = document.getElementById("who");
        if (whoEl) {
            whoEl.innerHTML = "El equipo <b></b> ha superado las pruebas del mapa y reunido los <b>12 caracteres</b>. El Olimpo Digital vuelve a ser vuestro.";
            whoEl.querySelector("b").textContent = s.team;
        }
    }
} catch (e) {}