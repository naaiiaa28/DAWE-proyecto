document.addEventListener("DOMContentLoaded", () => {
    const tipoLibro = document.getElementById("tipo-libro");
    const campoExtra = document.getElementById("campo-extra");
    const inputExtra = document.getElementById("extra");
    const formLibro = document.getElementById("form-libro");
    const dropZone = document.getElementById("drop-zone");

    if(tipoLibro){
        tipoLibro.addEventListener("change", () => {
            const valor = tipoLibro.value;

            if (valor === "") {
                campoExtra.classList.add("d-none");
                inputExtra.value = "";
            } else {
                campoExtra.classList.remove("d-none");

                switch (valor) {
                    case "novela":
                    case "ciencia":
                        inputExtra.placeholder = "Autor";
                        break;
                    case "ensayo":
                        inputExtra.placeholder = "Editor";
                        break;
                    case "infantil":
                        inputExtra.placeholder = "Edad recomendada";
                        break;
                    default:
                        inputExtra.placeholder = "Campo extra";
                }
            }
        });
    }

    // Drag & Drop
    if(dropZone){
        const textoOriginal = dropZone.textContent;

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("dragover");
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");

            dropZone.textContent = "Imagen añadida correctamente ✔";

            setTimeout(() => {
                dropZone.textContent = textoOriginal;
            }, 1500);
        });
    }

    // Previene envío real (para pruebas)
    if(formLibro){
        formLibro.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Libro añadido (simulación) ✅");
            formLibro.reset();
            campoExtra.classList.add("d-none");
        });
    }

    // Carrito
    const CART_KEY = "carrito_dawe_v1";
    const CART_MAX_UNITS = 20;

    // Elementos UI (si existen)
    const linkCarrito = document.getElementById("link-carrito");
    const badgeCount = document.getElementById("cart-count");

    const elResumen = document.getElementById("carrito-resumen");
    const elVacio = document.getElementById("carrito-vacio");
    const elItems = document.getElementById("carrito-items");
    const elTotal = document.getElementById("carrito-total");
    const btnVaciar = document.getElementById("btn-vaciar-carrito");
    const btnFinalizar = document.getElementById("btn-finalizar");
    const toast = document.getElementById("carrito-toast");

    const offcanvasEl = document.getElementById("offcanvasCarrito");
    const offcanvas =
    offcanvasEl && window.bootstrap
        ? bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl)
        : null;

    // --- helpers carrito ---
    function getCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        const cart = raw ? JSON.parse(raw) : [];
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
    }

    function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function cartUnits(cart) {
    return cart.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
    }

    function formatEUR(n) {
    return `€ ${Number(n).toFixed(2)}`;
    }

    function showToast(msg, ok = true) {
    if (!toast) return;
    toast.classList.remove("d-none", "alert-success", "alert-danger");
    toast.classList.add(ok ? "alert-success" : "alert-danger");
    toast.textContent = msg;
    setTimeout(() => toast.classList.add("d-none"), 1500);
    }

    function updateBadge() {
    if (!badgeCount) return;
    badgeCount.textContent = String(cartUnits(getCart()));
    }

    // Añadir 1 unidad (máx 20 totales)
    function addToCart(productId, meta = {}) {
    const cart = getCart();
    if (cartUnits(cart) >= CART_MAX_UNITS) return { ok: false, reason: "full" };

    const item = cart.find((x) => x.id === productId);
    if (item) {
        item.qty = (Number(item.qty) || 0) + 1;
    } else {
        // guardamos también nombre/precio si vienen (opcional)
        cart.push({
        id: productId,
        qty: 1,
        name: meta.name || productId,
        price: Number(meta.price) || 0,
        });
    }

    if (cartUnits(cart) > CART_MAX_UNITS) return { ok: false, reason: "full" };

    saveCart(cart);
    updateBadge();
    return { ok: true };
    }

    function decFromCart(productId) {
    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === productId);
    if (idx === -1) return;

    const q = Number(cart[idx].qty) || 0;
    if (q <= 1) cart.splice(idx, 1);
    else cart[idx].qty = q - 1;

    saveCart(cart);
    updateBadge();
    }

    function incFromCart(productId) {
    const cart = getCart();
    if (cartUnits(cart) >= CART_MAX_UNITS) {
        showToast("Carrito lleno (máx. 20).", false);
        return;
    }
    const item = cart.find((x) => x.id === productId);
    if (!item) return;
    item.qty = (Number(item.qty) || 0) + 1;
    saveCart(cart);
    updateBadge();
    }

    function removeLine(productId) {
    const cart = getCart().filter((x) => x.id !== productId);
    saveCart(cart);
    updateBadge();
    }

    function clearCart() {
    saveCart([]);
    updateBadge();
    }

    // --- render offcanvas ---
    function renderCartUI() {
    if (!elItems || !elTotal || !elResumen || !elVacio) return;

    const cart = getCart();
    const units = cartUnits(cart);

    elResumen.textContent = `Tienes ${units} unidad(es) en el carrito (máx. 20).`;

    if (cart.length === 0) {
        elVacio.classList.remove("d-none");
        elItems.innerHTML = "";
        elTotal.textContent = formatEUR(0);
        return;
    }

    elVacio.classList.add("d-none");

    let total = 0;
    elItems.innerHTML = cart
        .map((it) => {
        const price = Number(it.price) || 0;
        const qty = Number(it.qty) || 0;
        const sub = price * qty;
        total += sub;

        return `
            <div class="carrito-item" data-id="${escapeHtml(it.id)}">
            <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                <div class="fw-semibold">${escapeHtml(it.name || it.id)}</div>
                <div class="text-muted small">
                    ${formatEUR(price)} · Subtotal: ${formatEUR(sub)}
                </div>
                </div>

                <button class="btn btn-outline-danger btn-sm" data-action="remove" type="button">
                ✕
                </button>
            </div>

            <div class="d-flex align-items-center gap-2 mt-2">
                <button class="btn btn-outline-secondary btn-sm" data-action="dec" type="button">-</button>
                <span class="fw-semibold">${qty}</span>
                <button class="btn btn-outline-secondary btn-sm" data-action="inc" type="button">+</button>
            </div>
            </div>
        `;
        })
        .join("");

    elTotal.textContent = formatEUR(total);
    }

    function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    // --- eventos UI carrito ---
    if (linkCarrito && offcanvas) {
    linkCarrito.addEventListener("click", (e) => {
        e.preventDefault();
        renderCartUI();
        offcanvas.show();
    });
    }

    if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        clearCart();
        renderCartUI();
        showToast("Carrito vaciado.");
    });
    }

    if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
        const cart = getCart();
        if (cart.length === 0) return;
        clearCart();
        renderCartUI();
        showToast("Compra finalizada (simulación) ✅", true);
    });
    }

    if (elItems) {
    elItems.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const itemEl = e.target.closest(".carrito-item");
        if (!itemEl) return;

        const id = itemEl.dataset.id;
        const action = btn.dataset.action;

        if (action === "inc") incFromCart(id);
        if (action === "dec") decFromCart(id);
        if (action === "remove") removeLine(id);

        renderCartUI();
    });
    }

    /**
     * Enganche para "Añadir al carrito" desde tus cards:
     * - botón con class="btn-carrito"
     * - data-id="libro-1"
     * - opcional data-name y data-price para que el carrito muestre nombre/precio
     */
    const gridProductos = document.getElementById("grid-productos");
    if (gridProductos) {
    gridProductos.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-carrito");
        if (!btn) return;

        const id = btn.dataset.id;
        if (!id) return;

        const meta = {
        name: btn.dataset.name,
        price: btn.dataset.price,
        };

        const res = addToCart(id, meta);

        // Si quieres usar tu mensaje verde en la card:
        // (crea un div con class "mensaje-carrito d-none" dentro de la card)
        const card = btn.closest(".card");
        const msg = card ? card.querySelector(".mensaje-carrito") : null;

        if (res.ok) {
        if (msg) {
            msg.classList.remove("d-none");
            setTimeout(() => msg.classList.add("d-none"), 1500);
        } else {
            showToast("¡Añadido!", true);
        }
        } else {
        if (msg) {
            msg.textContent = "Carrito lleno (máx. 20)";
            msg.classList.remove("d-none");
            setTimeout(() => {
            msg.classList.add("d-none");
            msg.textContent = "¡Añadido!";
            }, 1500);
        } else {
            showToast("Carrito lleno (máx. 20).", false);
        }
        }
    });
    }

    // Inicial
    updateBadge();
});

