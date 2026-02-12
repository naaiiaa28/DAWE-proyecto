// Formatear precio en euros
export function formatEUR(n) {
    return `€ ${Number(n).toFixed(2)}`;
}

// Escapar HTML para evitar XSS
export function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Mostrar notificación temporal
export function mostrarNotificacion(card, mensaje) {
    const noti = document.createElement('div');
    noti.className = 'alert alert-success position-absolute top-0 end-0 m-2';
    noti.style.zIndex = 10;
    noti.textContent = mensaje;
    card.appendChild(noti);
    setTimeout(() => noti.remove(), 1500);
}

// Constantes del carrito
export const CART_KEY = "carrito_dawe_v1";
export const CART_MAX_UNITS = 20;