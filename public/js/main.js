import { productos, getCart, saveCart, cartUnits, addToCart, decFromCart, incFromCart, removeLine, clearCart, agregarProducto } from './tienda.js';
import { formatEUR, escapeHtml, CART_MAX_UNITS_PRODUCT} from './utils.js';
import { Novela } from './novela.js';
import { CienciaFiccion } from './cienciaFiccion.js';
import { Ensayo } from './ensayo.js';
import { Infantil } from './infantil.js';
import { Comic } from './comic.js';
import { getFavorites, toggleFavorite, isFavorite, favoritesCount } from "./favoritos.js";

document.addEventListener("DOMContentLoaded", () => {
    // Reiniciar el carrito al cargar la página
    clearCart();

    // Elementos del index.html  que necesitamos recoger
    const tipoLibro = document.getElementById("tipo-libro");
    const campoExtra = document.getElementById("campo-extra");
    const inputExtra = document.getElementById("extra");
    const formLibro = document.getElementById("form-libro");
    const inputImagen = document.getElementById("imagen-libro");
    const mensajes = document.getElementById("mensajes-form");

    const IMAGEN_DEFAULT = 'imagenes/INF.png';

    const grid = document.getElementById('grid-productos');
    const buscador = document.getElementById('buscador');
    const tituloProductos = document.getElementById('titulo-productos');
    const contador = document.getElementById('contador-productos');
    const paginacion = document.getElementById('paginacion');
    const cartCount = document.getElementById('cart-count');

    

    let paginaActual = 1;
    const productosPorPagina = 6;


    function actualizarContador(mostrando, total) {
        contador.textContent = `Mostrando ${mostrando} de ${total} productos`;
    }

    // Cosas del carrito
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

    // Funcion de mostrar mensajes del carrito
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

        if (cart.length === 0) {
            elVacio.classList.remove("d-none");
            elItems.innerHTML = "";
            if (elTotal) elTotal.textContent = formatEUR(0);
            return;
        }

        elVacio.classList.add("d-none");

        // 1) Pintar líneas normales
        elItems.innerHTML = cart.map((it) => {
            const price = Number(it.price) || 0;
            const qty = Number(it.qty) || 0;
            const sub = price * qty;

            return `
            <div class="carrito-linea" data-id="${escapeHtml(it.id)}">
                <img class="carrito-thumb" src="${escapeHtml(it.img || '')}" alt="${escapeHtml(it.name || it.id)}">

                <div class="carrito-info">
                <div class="carrito-nombre">${escapeHtml(it.name || it.id)}</div>
                <div class="carrito-calc">
                    ${formatEUR(price)} ×
                    <input class="carrito-qty" type="number" min="1" value="${qty}">
                    = <strong>${formatEUR(sub)}</strong>
                </div>
                </div>

                <button class="carrito-remove" data-action="remove" type="button" title="Eliminar">×</button>
            </div>
            `;
        }).join("");

        // 2) Subtotal (UNA sola vez)
        const subtotal = cart.reduce((acc, it) => {
            const price = Number(it.price) || 0;
            const qty = Number(it.qty) || 0;
            return acc + price * qty;
        }, 0);

        // 3) Línea cupón (UI) + quitar cupón
        if (appliedCoupon && couponDiscount > 0) {
            const line = document.createElement("div");
            line.className = "carrito-linea descuento-item";
            line.innerHTML = `
            <div class="carrito-info">
                <div class="carrito-nombre">Cupón ${escapeHtml(appliedCoupon)}</div>
                <div class="carrito-calc">- ${formatEUR(couponDiscount)}</div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger quitar-cupon">Quitar</button>
            `;
            elItems.appendChild(line);

            line.querySelector(".quitar-cupon").addEventListener("click", () => {
            appliedCoupon = null;
            couponDiscount = 0;
            const inputCupon = document.getElementById("input-cupon");
            if (inputCupon) inputCupon.value = "";
            showToast("Cupón eliminado.", true);
            renderCartUI();
            });
        }

        // 4) Total final (UNA sola vez)
        const totalFinal = Math.max(0, subtotal - (couponDiscount || 0));
        if (elTotal) elTotal.textContent = formatEUR(totalFinal);
    }

    if (linkCarrito && offcanvas) {
        linkCarrito.addEventListener("click", (e) => {
            e.preventDefault();
            renderCartUI();
            offcanvas.show();
        });
    }

    if (elItems) {

        // Eliminar con la X
        elItems.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-action='remove']");
            if (!btn) return;

            const itemEl = e.target.closest(".carrito-linea");
            if (!itemEl) return;

            removeLine(itemEl.dataset.id);
            updateBadge();
            renderCartUI();
        });

        // Cambiar cantidad con el input number
        elItems.addEventListener("input", (e) => {
            const input = e.target.closest(".carrito-qty");
            if (!input) return;

            const itemEl = e.target.closest(".carrito-linea");
            if (!itemEl) return;

            let qty = Math.max(1, Math.floor(Number(input.value) || 1));

            // limitacion de productos (20 por producto)
            if (qty > CART_MAX_UNITS_PRODUCT) {
            qty = CART_MAX_UNITS_PRODUCT;
            input.value = String(qty);
            showToast(`Máximo ${CART_MAX_UNITS_PRODUCT} por producto`, false);
            }

            const cart = getCart();
            const item = cart.find(x => x.id === itemEl.dataset.id);
            if (!item) return;

            item.qty = qty;
            saveCart(cart);

            updateBadge();
            renderCartUI();
        });
        }

    function resetCoupon() {
        appliedCoupon = null;
        couponDiscount = 0;
        const inputCupon = document.getElementById("input-cupon");
        if (inputCupon) inputCupon.value = "";
    }

    if (btnVaciar) btnVaciar.addEventListener("click", () => {
        clearCart();
        resetCoupon();
        updateBadge();
        renderCartUI();
        showToast("Carrito vacío", true);
    });

    if (btnFinalizar) btnFinalizar.addEventListener("click", () => {
        clearCart();
        resetCoupon();
        updateBadge();
        renderCartUI();
        showToast("Compra finalizada (simulación) ✅", true);
    });

    updateBadge();
    updateFavBadge();
    // colocar productos en pantalla 

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
            else if (p.campo) extraInfo = `Campo de estudio: ${p.campo}`;

            card.innerHTML = `
                <div class="card-body position-relative d-flex flex-column h-100">
                    <img src="${p.imagen}" 
                        class="card-img-top producto-img" 
                        data-id="${p.id}" 
                        alt="${escapeHtml(p.nombre)}">
                    <h5 class="card-title">${escapeHtml(p.nombre)}</h5>
                    <p class="precio mb-1">${formatEUR(p.precio)}</p>
                    <p class="text-muted small mb-2">${escapeHtml(extraInfo)}</p>
                    <p class="card-text flex-grow-1">${escapeHtml(p.descripcion)}</p>
                    <button class="btn btn-success position-absolute top-0 end-0 m-2 btn-carrito"
                        data-id="${p.id}" 
                        data-name="${escapeHtml(p.nombre)}" 
                        data-price="${p.precio}" 
                        data-img="${p.imagen}">
                        🛒
                    </button>
                    <button class="btn btn-warning position-absolute top-0 start-0 m-2 btn-favorito"
                        data-id="${p.id}"
                        aria-pressed="${isFavorite(p.id) ? "true" : "false"}">
                        ${isFavorite(p.id) ? "★" : "☆"}
                    </button>

                </div>
            `;



            col.appendChild(card);
            grid.appendChild(col);
        });

        generarPaginacion(filtrados.length);
    }
    //para crear la paginacion de productos
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

    // boton carrito
    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-carrito');
        if (!btn) return;

        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        const img = btn.dataset.img;

        const result = addToCart(id, { name, price, img });
        if (result.ok) {
            showButtonToast(btn,"Añadido al carrito ✓", true);
            updateBadge();
        } else {
            showButtonToast(btn,"Carrito lleno (máx. 20).", false);
        }
    });
    grid.addEventListener("click", (e) => {
        const btnFav = e.target.closest(".btn-favorito");
        if (!btnFav) return;

        const id = btnFav.dataset.id;
        const producto = productos.find(p => p.id === id);
        if (!producto) return;

        const marcado = toggleFavorite(producto);
        updateFavBadge();

        // UI estrella
        btnFav.classList.toggle("active", marcado);
        btnFav.setAttribute("aria-pressed", marcado ? "true" : "false");
        btnFav.textContent = marcado ? "★" : "☆";
    });


//mensajes de añadido al carrito
function mostrarMensaje(texto, ok = true) {
    mensajes.textContent = texto;
    mensajes.className = "mt-3 alert";
    mensajes.classList.add(ok ? "alert-success" : "alert-danger");

    setTimeout(() => {
        mensajes.textContent = "";
        mensajes.className = "";
    }, 2000);
}


//campo extra de los productos
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

//drag drop 
const dropZone = document.getElementById("drop-zone");
const dropText = document.getElementById("dropText");

const placeholderText = "Arrastra aquí la imagen del libro";
const successText = "¡elemento añadido!";
let archivoDrop = null;
let archivoInput = null;

function setImagen(file, origen) {
    if (!file) return;

    if (origen === "drop") {
        archivoDrop = file;
        archivoInput = null;

        // limpiar y bloquear input file
        if (inputImagen) {
            inputImagen.value = "";
            inputImagen.disabled = true;
        }

        dropText.textContent = "Imagen cargada (drag & drop)";
    }

    if (origen === "input") {
        archivoInput = file;
        archivoDrop = null;

        // por si estaba bloqueado antes
        if (inputImagen) {
            inputImagen.disabled = false;
        }

        dropText.textContent = "Imagen cargada (input)";
    }
}



["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});


dropZone.addEventListener("dragover", () => {
    dropZone.classList.add("dragover");
});


dropZone.addEventListener("dragenter", () => {
    dropZone.classList.add("dragover");
});


dropZone.addEventListener("dragleave", (e) => {
    if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove("dragover");
    }
});

//cuando sueltas la imagen 
dropZone.addEventListener("drop", (e) => {
    dropZone.classList.remove("dragover");

    const files = e.dataTransfer.files;

    //si ya hay imagen por input se bloquea
    if (archivoInput) {
        mostrarMensaje("Ya hay una imagen seleccionada", false);
        return;
    }

    if (files && files.length > 0) {
        dropZone.classList.add("success");
        setImagen(files[0], "drop");
        setTimeout(() => {
            dropZone.classList.remove("success");
        }, 1500);
    }
});

//mas comprobaciones de si ya hay imagenes en uno de los dos
if (inputImagen) {
    inputImagen.addEventListener("change", () => {
        if (!inputImagen.files.length) return;

        
        if (archivoDrop) {
            mostrarMensaje("Ya hay una imagen cargada por drag & drop", false);
            inputImagen.value = "";
            return;
        }

        setImagen(inputImagen.files[0], "input");
    });
}



//formulario del aside y sus comprobaciones

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

        if (archivoInput) {
            imagenFinal = URL.createObjectURL(archivoInput);
        } else if (archivoDrop) {
            imagenFinal = URL.createObjectURL(archivoDrop);
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

        // limpiar estado de imágenes
        archivoDrop = null;
        archivoInput = null;

        if (inputImagen) inputImagen.disabled = false;
        dropText.textContent = placeholderText;


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

function getExtraInfo(producto) {

  if (producto.autor) return { label: "Autor", value: producto.autor };
  if (producto.editor) return { label: "Editor", value: producto.editor };
  if (producto.edadRecomendada) return { label: "Edad recomendada", value: producto.edadRecomendada };
  if (producto.ilustrador) return { label: "Ilustrador", value: producto.ilustrador };

  if (producto.campo) return { label: "Campo de estudio", value: producto.campo };
  if (producto.campoEstudio) return { label: "Campo de estudio", value: producto.campoEstudio };
  if (producto.campoDeEstudio) return { label: "Campo de estudio", value: producto.campoDeEstudio };

  const tipo = (producto.tipo || producto.constructor?.name || "").toLowerCase();
  const v = producto.extra;
  if (!v) return null;

  if (tipo.includes("novela")) return { label: "Autor", value: v };
  if (tipo.includes("ciencia")) return { label: "Campo de estudio", value: v };
  if (tipo.includes("ensayo")) return { label: "Editor", value: v };
  if (tipo.includes("infantil")) return { label: "Edad recomendada", value: v };
  if (tipo.includes("comic")) return { label: "Ilustrador", value: v };

  return { label: "Extra", value: v };
}

function openProductoDetalle(producto) {
  // Evita duplicados
  if (document.querySelector(".producto-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "producto-overlay";

  const modal = document.createElement("div");
  modal.className = "producto-modal";

  const extra = getExtraInfo(producto);

  const descripcionLarga = String(producto.descripcion ?? "").repeat(1);

  modal.innerHTML = `
    <button class="producto-modal-close" type="button" aria-label="Cerrar">×</button>

    <div class="producto-modal-izq">
      <img src="${producto.imagen}" alt="${escapeHtml(producto.nombre)}">
    </div>

    <div class="producto-modal-der">
      <h3>${escapeHtml(producto.nombre)} — € ${Number(producto.precio).toFixed(2)}</h3>

      ${extra ? `<div class="producto-modal-meta"><strong>${escapeHtml(extra.label)}:</strong> ${escapeHtml(extra.value)}</div>` : ""}

      <div class="producto-modal-meta"><strong>Descripción:</strong></div>
      <p style="margin:0; white-space: pre-wrap;">${escapeHtml(descripcionLarga)}</p>
    </div>
  `;

  function close() {
    document.removeEventListener("keydown", onKey);
    overlay.remove();
    modal.remove();
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  overlay.addEventListener("click", close);
  modal.querySelector(".producto-modal-close").addEventListener("click", close);
  document.addEventListener("keydown", onKey);

  document.body.appendChild(overlay);
  document.body.appendChild(modal);
}

// Delegación: click en imagen de producto
if (grid) {
  grid.addEventListener("click", (e) => {
    if (e.target.closest(".btn-carrito")) return;

    const img = e.target.closest("img.producto-img");
    if (!img) return;

    const id = img.dataset.id;
    if (!id) return;

    // Aquí asumo que tienes acceso al array "productos" en main.js
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    openProductoDetalle(producto);


  });    
}
let appliedCoupon = null;
let couponDiscount = 0;

function applyCoupon() {
  const couponInput = document.getElementById("input-cupon"); // ID REAL del HTML
  if (!couponInput) return;

  const code = couponInput.value.trim().toUpperCase();
  if (!code) {
    showToast("Introduce un cupón.", false);
    return;
  }

  // Evitar duplicados
  if (appliedCoupon === code) {
    showToast("Ese cupón ya está aplicado.", false);
    return;
  }

  // Validación simple (luego puedes ampliarla a varios cupones)
  if (code === "DESCUENTO10") {
    appliedCoupon = code;
    couponDiscount = 10;

    showToast("Cupón aplicado: -10€", true);
    renderCartUI(); // <- en el Paso 6 te digo qué tocar dentro
    return;
  }

  showToast("Cupón no válido.", false);
}
// Botón aplicar cupón
const btnAplicarCupon = document.getElementById("aplicar-cupon");
if (btnAplicarCupon) btnAplicarCupon.addEventListener("click", applyCoupon);

// (Opcional) Enter en el input
const inputCupon = document.getElementById("input-cupon");
if (inputCupon) {
  inputCupon.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyCoupon();
  });
}

// ===== FAVORITOS UI =====
const badgeFav = document.getElementById("fav-count");
const linkFavoritos = document.getElementById("link-favoritos");
const favVacio = document.getElementById("favoritos-vacio");
const favItems = document.getElementById("favoritos-items");

const offFavEl = document.getElementById("offcanvasFavoritos");
const offFav =
  offFavEl && window.bootstrap
    ? bootstrap.Offcanvas.getOrCreateInstance(offFavEl)
    : null;

function updateFavBadge() {
  if (!badgeFav) return;
  badgeFav.textContent = String(favoritesCount());
}

function renderFavoritesUI() {
  if (!favItems || !favVacio) return;

  const favs = getFavorites();

  if (favs.length === 0) {
    favVacio.classList.remove("d-none");
    favItems.innerHTML = "";
    return;
  }

  favVacio.classList.add("d-none");

  favItems.innerHTML = favs.map((p) => `
    <div class="carrito-linea" data-id="${escapeHtml(p.id)}">
      <img class="carrito-thumb" src="${escapeHtml(p.imagen || '')}" alt="${escapeHtml(p.nombre || p.id)}">
      <div class="carrito-info">
        <div class="carrito-nombre">${escapeHtml(p.nombre || p.id)}</div>
        <div class="carrito-calc">${formatEUR(p.precio)}</div>
      </div>
      <button class="carrito-remove" data-action="unfav" type="button" title="Quitar de favoritos">×</button>
    </div>
  `).join("");
}

if (linkFavoritos && offFav) {
  linkFavoritos.addEventListener("click", (e) => {
    e.preventDefault();
    renderFavoritesUI();
    updateFavBadge();
    offFav.show();
  });
}

if (favItems) {
  favItems.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='unfav']");
    if (!btn) return;

    const row = e.target.closest("[data-id]");
    if (!row) return;

    const id = row.dataset.id;

    const producto = productos.find(p => p.id === id);
    if (!producto) {
      // si no lo encontramos, lo quitamos del DOM y luego podríamos limpiar storage con otra función
      row.remove();
      updateFavBadge();
      return;
    }

    toggleFavorite(producto); // lo desmarca
    renderFavoritesUI();
    updateFavBadge();
    // También actualiza estrellas en el grid:
    refreshFavoriteStars();
  });
}
function refreshFavoriteStars() {
  if (!grid) return;
  grid.querySelectorAll(".btn-favorito").forEach((btn) => {
    const id = btn.dataset.id;
    const fav = isFavorite(id);
    btn.classList.toggle("active", fav);
    btn.setAttribute("aria-pressed", fav ? "true" : "false");
    btn.textContent = fav ? "★" : "☆";
  });
}

// ======= INICIO =======
    mostrarProductos();
});


