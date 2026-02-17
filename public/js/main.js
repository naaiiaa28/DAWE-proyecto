import { productos, getCart, saveCart, cartUnits, addToCart, decFromCart, incFromCart, removeLine, clearCart, agregarProducto } from './tienda.js';
import { formatEUR, escapeHtml, CART_MAX_UNITS } from './utils.js';
import { Novela } from './novela.js';
import { CienciaFiccion } from './cienciaFiccion.js';
import { Ensayo } from './ensayo.js';
import { Infantil } from './infantil.js';
import { Comic } from './comic.js';

document.addEventListener("DOMContentLoaded", () => {
    // ======= ELEMENTOS HTML =======
    const tipoLibro = document.getElementById("tipo-libro");
    const campoExtra = document.getElementById("campo-extra");
    const inputExtra = document.getElementById("extra");
    const formLibro = document.getElementById("form-libro");

    const grid = document.getElementById('grid-productos');
    const buscador = document.getElementById('buscador');
    const tituloProductos = document.getElementById('titulo-productos');
    const contador = document.getElementById('contador-productos');
    const paginacion = document.getElementById('paginacion');
    const cartCount = document.getElementById('cart-count');

    let paginaActual = 1;
    const productosPorPagina = 6;

    // ======= FUNCIONES AUXILIARES =======

    function actualizarContador(mostrando, total) {
        contador.textContent = `Mostrando ${mostrando} de ${total} productos`;
    }

    // ======= ELEMENTOS CARRITO =======
    const linkCarrito = document.getElementById("link-carrito");
    const badgeCount = document.getElementById("cart-count");
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

    function renderCartUI() {
        if (!elItems || !elVacio) return;

        const cart = getCart();
        const units = cartUnits(cart);

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

            if (action === "inc") {
                const result = incFromCart(id);
                if (!result.ok) showToast("Carrito lleno (máx. 20).", false);
            }
            if (action === "dec") decFromCart(id);
            if (action === "remove") removeLine(id);

            updateBadge();
            renderCartUI();
        });
    }

    if (btnVaciar) btnVaciar.addEventListener("click", () => { clearCart(); updateBadge(); renderCartUI(); showToast("Carrito vaciado."); });
    if (btnFinalizar) btnFinalizar.addEventListener("click", () => { clearCart(); updateBadge(); renderCartUI(); showToast("Compra finalizada (simulación) ✅", true); });

    updateBadge();

    // ======= FUNCIONALIDAD PRODUCTOS =======

    function mostrarProductos() {
        const filtro = buscador.value.trim().toLowerCase();
        let filtrados = productos.filter(p => p.nombre.toLowerCase().includes(filtro));

        tituloProductos.textContent = filtro ? `Buscando por: ${buscador.value}` : "Todos los productos";

        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productosPagina = filtrados.slice(inicio, fin);

        actualizarContador(productosPagina.length, filtrados.length);

        grid.innerHTML = '';

        productosPagina.forEach((p) => {
            const col = document.createElement('div');
            col.className = 'col-md-4';

            const card = document.createElement('div');
            card.className = 'card position-relative';

            // Determinar el atributo extra según el tipo de producto
            let extraInfo = '';
            if (p.autor) extraInfo = `Autor: ${p.autor}`;
            else if (p.editor) extraInfo = `Editor: ${p.editor}`;
            else if (p.edadRecomendada) extraInfo = `Edad: ${p.edadRecomendada}`;
            else if (p.ilustrador) extraInfo = `Ilustrador: ${p.ilustrador}`;

            card.innerHTML = `
                <div class="card-body position-relative">
                    <img src="${p.imagen}" alt="Portada de ${escapeHtml(p.nombre)}" class="card-img-top mb-2">
                    <h5 class="card-title">${escapeHtml(p.nombre)}</h5>
                    <p class="card-text">${escapeHtml(p.descripcion)}</p>
                    <p>Precio: ${formatEUR(p.precio)}</p>
                    <p class="text-muted small">${escapeHtml(extraInfo)}</p>
                    <button class="btn btn-primary position-absolute top-0 end-0 m-2 btn-carrito"
                        data-id="${p.id}" data-name="${escapeHtml(p.nombre)}" data-price="${p.precio}">
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
            btnPrev.addEventListener('click', (e) => { e.preventDefault(); paginaActual--; mostrarProductos(); });
            paginacion.appendChild(btnPrev);
        }

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('li');
            btn.className = `page-item ${i === paginaActual ? 'active' : ''}`;
            btn.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            btn.addEventListener('click', (e) => { e.preventDefault(); paginaActual = i; mostrarProductos(); });
            paginacion.appendChild(btn);
        }

        if (paginaActual < totalPaginas) {
            const btnNext = document.createElement('li');
            btnNext.className = 'page-item';
            btnNext.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
            btnNext.addEventListener('click', (e) => { e.preventDefault(); paginaActual++; mostrarProductos(); });
            paginacion.appendChild(btnNext);
        }
    }

    buscador.addEventListener('input', () => { paginaActual = 1; mostrarProductos(); });

    // Event delegation para botones de carrito
    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-carrito');
        if (!btn) return;

        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = btn.dataset.price;

        const result = addToCart(id, { name, price });
        if (result.ok) {
            showButtonToast(btn,"Añadido al carrito ✓", true);
            updateBadge();
        } else {
            showButtonToast(btn,"Carrito lleno (máx. 20).", false);
        }
    });

const inputImagen = document.getElementById("imagen-libro");
const mensajes = document.getElementById("mensajes-form");

const IMAGEN_DEFAULT = "imagenes/default.jpg";

/* ===========================
   MENSAJES
=========================== */

function mostrarMensaje(texto, ok = true) {
    mensajes.textContent = texto;
    mensajes.className = "mt-3 alert";
    mensajes.classList.add(ok ? "alert-success" : "alert-danger");

    setTimeout(() => {
        mensajes.textContent = "";
        mensajes.className = "";
    }, 2000);
}

/* ===========================
   CAMPO EXTRA DINÁMICO
=========================== */

if (tipoLibro) {
    tipoLibro.addEventListener("change", () => {

        console.log("Cambio detectado"); // <-- para comprobar

        const valor = tipoLibro.value;

        if (valor === "") {
            campoExtra.classList.add("d-none");
            inputExtra.value = "";
            return;
        }

        campoExtra.classList.remove("d-none");

        switch (valor) {
            case "novela":
                 inputExtra.placeholder = "Autor";
                break;
            case "ciencia":
                inputExtra.placeholder = "Campo de estudio";
                break;
            case "ensayo":
                inputExtra.placeholder = "Editor";
                break;
            case "infantil":
                inputExtra.placeholder = "Edad recomendada";
                break;
            case "comic":
                inputExtra.placeholder = "Ilustrador";
                break;
        }
    });
}

const dropZone = document.getElementById("drop-zone");
const dropText = document.getElementById("dropText");

const placeholderText = "Arrastra aquí la imagen del libro";
const successText = "¡elemento añadido!";

// =====================================================
//  MUY IMPORTANTE: evitar que el navegador abra el archivo
// =====================================================
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});

// =====================================================
// DRAG OVER EN LA ZONA
// =====================================================
dropZone.addEventListener("dragover", () => {
    dropZone.classList.add("dragover");
});

// =====================================================
// DRAG ENTER (mejora la detección)
// =====================================================
dropZone.addEventListener("dragenter", () => {
    dropZone.classList.add("dragover");
});

// =====================================================
// DRAG LEAVE
// =====================================================
dropZone.addEventListener("dragleave", (e) => {
    // 👇 evita falsos dragleave al pasar por hijos
    if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove("dragover");
    }
});

// =====================================================
// DROP
// =====================================================
dropZone.addEventListener("drop", (e) => {
    dropZone.classList.remove("dragover");
    dropZone.classList.add("success");

    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
        dropText.textContent = successText;
    }

    setTimeout(() => {
        dropZone.classList.remove("success");
        dropText.textContent = placeholderText;
    }, 1500);
});


/* ===========================
   ENVÍO FORMULARIO
=========================== */

if (formLibro) {

    formLibro.addEventListener("submit", (e) => {

        e.preventDefault();

        const nombre = document.getElementById("nombre-libro").value.trim();
        const precio = parseFloat(document.getElementById("precio-libro").value);
        const descripcion = document.getElementById("descripcion-libro").value.trim();
        const tipo = tipoLibro.value;
        const extraVal = inputExtra.value.trim();

        if (tipo === "") {
            mostrarMensaje("Debes escoger un tipo", false);
            return;
        }

        if (!nombre) {
            mostrarMensaje("El nombre es obligatorio", false);
            return;
        }

        if (isNaN(precio) || precio <= 0) {
            mostrarMensaje("El precio debe ser válido", false);
            return;
        }

        if (!extraVal) {
        const nombreCampo = inputExtra.placeholder;
        mostrarMensaje(`El  ${nombreCampo} es obligatorio`, false);
        return;
        }

        let imagenFinal = IMAGEN_DEFAULT;

        if (inputImagen.files.length > 0) {
            imagenFinal = URL.createObjectURL(inputImagen.files[0]);
        }

        
        const nuevo = agregarProducto({
            tipo,
            nombre,
            precio,
            descripcion,
            extra: extraVal,
            imagen: imagenFinal
        });

        if (!nuevo) {
            mostrarMensaje("Error al añadir producto", false);
            return;
        }

        // ACTUALIZAR TIENDA
        if (typeof mostrarProductos === "function") {
            paginaActual = 1;
            mostrarProductos();
        }

        if (typeof actualizarPaginacion === "function") {
            actualizarPaginacion();
        }

        formLibro.reset();
        campoExtra.classList.add("d-none");

        mostrarMensaje("Libro añadido correctamente ✔", true);
    });
}

//mensaje cuando se da al boton del carrito
function showButtonToast(btn, msg, ok = true) {
    if (!btn) return;

    const toastEl = document.createElement("div");
    toastEl.className = `btn-toast ${ok ? "success" : "error"}`;
    toastEl.textContent = msg;

    toastEl.style.position = "absolute";
    toastEl.style.top = "-35px";
    toastEl.style.right = "0";
    toastEl.style.padding = "5px 10px";
    toastEl.style.backgroundColor = ok ? "#28a745" : "#dc3545";
    toastEl.style.color = "white";
    toastEl.style.borderRadius = "5px";
    toastEl.style.fontSize = "0.85rem";
    toastEl.style.zIndex = "1000";
    toastEl.style.whiteSpace = "nowrap";
    toastEl.style.pointerEvents = "none";

    btn.parentElement.appendChild(toastEl);

    requestAnimationFrame(() => toastEl.classList.add("show"));

    setTimeout(() => toastEl.remove(), 1500);
}


    // ======= INICIO =======
    mostrarProductos();
});