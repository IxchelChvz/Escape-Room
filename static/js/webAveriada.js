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
