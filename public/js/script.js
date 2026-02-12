document.addEventListener("DOMContentLoaded", () => {
    // ======= ELEMENTOS HTML =======
    const tipoLibro = document.getElementById("tipo-libro");
    const campoExtra = document.getElementById("campo-extra");
    const inputExtra = document.getElementById("extra");
    const formLibro = document.getElementById("form-libro");
    const dropZone = document.getElementById("drop-zone");

    const grid = document.getElementById('grid-productos');
    const buscador = document.getElementById('buscador');
    const tituloProductos = document.getElementById('titulo-productos');
    const contador = document.getElementById('contador-productos');
    const paginacion = document.getElementById('paginacion');
    const cartCount = document.getElementById('cart-count');

    let productos = [];
    let paginaActual = 1;
    const productosPorPagina = 6;

    // ======= FUNCIONES AUXILIARES =======

    function mostrarNotificacion(card, mensaje) {
        const noti = document.createElement('div');
        noti.className = 'alert alert-success position-absolute top-0 end-0 m-2';
        noti.style.zIndex = 10;
        noti.textContent = mensaje;
        card.appendChild(noti);
        setTimeout(() => noti.remove(), 1500);
    }

    function actualizarContador(mostrando, total) {
        contador.textContent = `Mostrando ${mostrando} de ${total} productos`;
    }

    // ======= CARRITO  =======
    const CART_KEY = "carrito_dawe_v1";
    const CART_MAX_UNITS = 20;

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

    function addToCart(productId, meta = {}) {
        const cart = getCart();
        if (cartUnits(cart) >= CART_MAX_UNITS) return { ok: false, reason: "full" };

        const item = cart.find((x) => x.id === productId);
        if (item) {
            item.qty = (Number(item.qty) || 0) + 1;
        } else {
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

    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function renderCartUI() {
        if (!elItems || !elTotal || !elResumen || !elVacio) return;

        const cart = getCart();
        const units = cartUnits(cart);
        if (elResumen) elResumen.textContent = `Tienes ${units} unidad(es) en el carrito (máx. 20).`;

        if (cart.length === 0) {
            elVacio.classList.remove("d-none");
            elItems.innerHTML = "";
            if (elTotal) elTotal.textContent = formatEUR(0);
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
                            <button class="btn btn-outline-danger btn-sm" data-action="remove" type="button">✕</button>
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

        if (elTotal) elTotal.textContent = formatEUR(total);
    }

    if (linkCarrito && offcanvas) {
        linkCarrito.addEventListener("click", (e) => {
            e.preventDefault();
            renderCartUI();
            offcanvas.show();
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

    if (btnVaciar) btnVaciar.addEventListener("click", () => { clearCart(); renderCartUI(); showToast("Carrito vaciado."); });
    if (btnFinalizar) btnFinalizar.addEventListener("click", () => { clearCart(); renderCartUI(); showToast("Compra finalizada (simulación) ✅", true); });

    updateBadge();

    // ======= FUNCIONALIDAD PRODUCTOS =======  esto no deberia estar aqui

    function mostrarProductos() {
        const filtro = buscador.value.trim().toLowerCase();
        let filtrados = productos.filter(p => p.nombre.toLowerCase().includes(filtro));

        tituloProductos.textContent = filtro ? `Buscando por: ${buscador.value}` : "Todos los productos";

        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productosPagina = filtrados.slice(inicio, fin);

        actualizarContador(productosPagina.length, filtrados.length);

        grid.innerHTML = '';

        productosPagina.forEach((p, i) => {
            const col = document.createElement('div');
            col.className = 'col-md-4';

            const card = document.createElement('div');
            card.className = 'card position-relative';

            const id = `libro-${i}-${Date.now()}`;

            card.innerHTML = `
                <div class="card-body position-relative">
                    <h5 class="card-title">${p.nombre}</h5>
                    <p class="card-text">${p.descripcion}</p>
                    <p>Precio: €${p.precio}</p>
                    <p>${p.extra}</p>
                    <button class="btn btn-primary position-absolute top-0 end-0 m-2 btn-carrito"
                        data-id="${id}" data-name="${p.nombre}" data-price="${p.precio}">
                        🛒
                    </button>
                </div>
            `;

            col.appendChild(card);
            grid.appendChild(col);
        });

        generarPaginacion(filtrados.length);
    }

    function generarPaginacion(total) {
        paginacion.innerHTML = '';
        const totalPaginas = Math.ceil(total / productosPorPagina);

        if (paginaActual > 1) {
            const btnPrev = document.createElement('li');
            btnPrev.className = 'page-item';
            btnPrev.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
            btnPrev.addEventListener('click', () => { paginaActual--; mostrarProductos(); });
            paginacion.appendChild(btnPrev);
        }

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('li');
            btn.className = `page-item ${i === paginaActual ? 'active' : ''}`;
            btn.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            btn.addEventListener('click', () => { paginaActual = i; mostrarProductos(); });
            paginacion.appendChild(btn);
        }

        if (paginaActual < totalPaginas) {
            const btnNext = document.createElement('li');
            btnNext.className = 'page-item';
            btnNext.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
            btnNext.addEventListener('click', () => { paginaActual++; mostrarProductos(); });
            paginacion.appendChild(btnNext);
        }
    }

    buscador.addEventListener('input', () => { paginaActual = 1; mostrarProductos(); });

    // ======= FORMULARIO AÑADIR LIBRO =======
    if(formLibro){
        formLibro.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre-libro').value;
            const descripcion = document.getElementById('descripcion-libro').value;
            const precio = parseFloat(document.getElementById('precio-libro').value) || 0;
            const extra = document.getElementById('extra').value || '';

            productos.push({nombre, descripcion, precio, extra});
            formLibro.reset();
            campoExtra.classList.add('d-none');

            mostrarProductos();
        });
    }

    // ======= TIPO LIBRO / CAMPO EXTRA =======
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

    // ======= DRAG & DROP =======
    if(dropZone){
        const textoOriginal = dropZone.textContent;
        dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
        dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
            dropZone.textContent = "Imagen añadida correctamente ✔";
            setTimeout(() => dropZone.textContent = textoOriginal, 1500);
        });
    }

    // ======= INICIO ======= esto sobraria es para pruebas
    productos = [
        {nombre: 'Libro 1', descripcion: 'Descripción del libro 1', precio: 10, extra: 'Extra 1'},
        {nombre: 'Libro 2', descripcion: 'Descripción del libro 2', precio: 12, extra: 'Extra 2'},
        {nombre: 'Libro 3', descripcion: 'Descripción del libro 3', precio: 8, extra: 'Extra 3'},
        {nombre: 'Libro 4', descripcion: 'Descripción del libro 4', precio: 15, extra: 'Extra 4'},
        {nombre: 'Libro 5', descripcion: 'Descripción del libro 5', precio: 9, extra: 'Extra 5'},
        {nombre: 'Libro 6', descripcion: 'Descripción del libro 6', precio: 11, extra: 'Extra 6'},
        {nombre: 'Libro 7', descripcion: 'Descripción del libro 7', precio: 14, extra: 'Extra 7'},
        {nombre: 'Libro 8', descripcion: 'Descripción del libro 8', precio: 13, extra: 'Extra 8'}
    ];

    mostrarProductos();
});
