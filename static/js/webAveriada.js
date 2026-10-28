/* Web averiada: rellena la rejilla con las 12 secciones bloqueadas. */
var S = [
    ["León de Nemea", "Noticias", "🦁", "Últimas noticias del templo: ΣΦΑΛΜΑ al cargar el feed."],
    ["Hidra de Lerna", "Galería", "🐍", "Imágenes no disponibles: la Hidra ha mordido el servidor."],
    ["Cierva de Cerinea", "Mapa del sitio", "🦌", "El mapa del sitio no responde."],
    ["Jabalí de Erimanto", "Buscador", "🐗", "Buscando… el jabalí ha arrasado el índice."],
    ["Establos de Augías", "Archivo", "🐴", "Archivo ilegible: demasiado código basura."],
    ["Aves del Estínfalo", "Chat", "🐦", "Chat de los dioses sin conexión."],
    ["Toro de Creta", "Tienda", "🐂", "Tienda cerrada: el toro ha roto el carrito."],
    ["Yeguas de Diomedes", "Eventos", "🐎", "El calendario se ha bloqueado."],
    ["Cinturón de Hipólita", "Perfil", "👑", "Perfil de usuario no encontrado (404)."],
    ["Bueyes de Gerión", "Foro", "🐄", "Foro caído: los bueyes han pisado los hilos."],
    ["Manzanas de las Hespérides", "Premios", "🍎", "Premios no disponibles."],
    ["Cerbero", "Acceso final", "🐕", "Puerta final cerrada."]
];

var grid = document.getElementById("grid");

S.forEach(function (s, i) {
    var card = document.createElement("article");
    card.className = "card";

    var title = document.createElement("h3");
    title.textContent = s[1];

    var img = document.createElement("div");
    img.className = "img";
    img.textContent = "imagen_" + (i + 1) + ".png ✖ 404";

    var text = document.createElement("p");
    text.textContent = s[3];

    var lock = document.createElement("div");
    lock.className = "lock";
    lock.innerHTML = "<span aria-hidden='true'>🔒</span><div>BLOQUEADA</div>";
    var by = document.createElement("div");
    by.textContent = "por: " + s[0];
    lock.appendChild(by);

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(text);
    card.appendChild(lock);
    grid.appendChild(card);
});
