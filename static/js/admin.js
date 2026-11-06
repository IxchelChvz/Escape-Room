/* Panel /admin: pide confirmacion antes de enviar los formularios marcados con data-confirm. */
document.addEventListener('submit', function (e) {
    var msg = e.target.getAttribute && e.target.getAttribute('data-confirm');
    if (msg && !window.confirm(msg)) {
        e.preventDefault();
    }
});

/* Vista previa de la pantalla de tiempo agotado (gameover.js en modo vista previa). */
var verDerrota = document.getElementById('verDerrota');
if (verDerrota) {
    verDerrota.addEventListener('click', function () {
        if (window.showGameOverScreen) window.showGameOverScreen();
    });
}
