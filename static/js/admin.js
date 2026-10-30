/* Panel /admin: pide confirmacion antes de enviar los formularios marcados con data-confirm. */
document.addEventListener('submit', function (e) {
    var msg = e.target.getAttribute && e.target.getAttribute('data-confirm');
    if (msg && !window.confirm(msg)) {
        e.preventDefault();
    }
});
