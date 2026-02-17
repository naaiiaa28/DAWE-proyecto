import { Novela } from './novela.js';
import { CienciaFiccion } from './cienciaFiccion.js';
import { Ensayo } from './ensayo.js';
import { Infantil } from './infantil.js';
import { Comic } from './comic.js';
import { CART_KEY, CART_MAX_UNITS } from './utils.js';

// Lista de productos de la tienda
export const productos = [
    // Novelas
    new Novela('Cien años de soledad', 18.50, 'Obra maestra de García Márquez sobre la familia Buendía','imagenes/cien-anos-de-soledad.jpg', 'Gabriel García Márquez'),
    new Novela('1984', 15.99, 'Distopía clásica de George Orwell', 'imagenes/1984.jpg', 'George Orwell'),
    new Novela('El Quijote', 22.00, 'La obra cumbre de Cervantes', 'imagenes/El-Quijote.jpg', 'Miguel de Cervantes'),

    // Ciencia Ficción
    new CienciaFiccion('Dune', 24.99, 'Épica espacial de Frank Herbert', 'imagenes/Dune.jpg', 'Frank Herbert'),
    new CienciaFiccion('Fundación', 19.50, 'Primera entrega de la saga de Asimov', 'imagenes/Fundacion.jpg', 'Isaac Asimov'),
    new CienciaFiccion('Neuromante', 17.99, 'Cyberpunk clásico de William Gibson', 'imagenes/Neuromante.jpg', 'William Gibson'),

    // Ensayos
    new Ensayo('Sapiens', 21.90, 'De animales a dioses: Una breve historia de la humanidad', 'imagenes/Sapiens.jpg', 'Editorial Debate'),
    new Ensayo('El mundo y sus demonios', 16.50, 'Carl Sagan sobre el pensamiento crítico', 'imagenes/El-mundo-y-sus-demonios.jpg', 'Planeta'),
    new Ensayo('Pensar rápido, pensar despacio', 19.99, 'Daniel Kahneman sobre la toma de decisiones', 'imagenes/Pensar-rapido-pensar-despacio.jpg', 'Debate'),

    // Infantiles
    new Infantil('El Principito', 12.50, 'Clásico de Antoine de Saint-Exupéry', 'imagenes/El-Principito.jpg', '8+ años'),
    new Infantil('Matilda', 14.99, 'Historia de Roald Dahl sobre una niña prodigio', 'imagenes/Matilda.jpg', '7+ años'),
    new Infantil('Harry Potter y la Piedra Filosofal', 16.95, 'Primera aventura del joven mago', 'imagenes/harry.jpg', '9+ años'),

    // Cómics
    new Comic('Watchmen', 29.99, 'Obra maestra del cómic de Alan Moore', 'imagenes/Watchmen.jpg', 'Dave Gibbons'),
    new Comic('Maus', 24.50, 'Novela gráfica ganadora del Pulitzer', 'imagenes/Maus.jpg', 'Art Spiegelman'),
    new Comic('V de Vendetta', 26.00, 'Thriller político de Alan Moore', 'imagenes/V-d-eVendetta.jpg', 'David Lloyd')
];

// Carrito de la compra (inicialmente vacío)
export let carrito = [];

// Funciones relacionadas con el carrito
export function getCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        const cart = raw ? JSON.parse(raw) : [];
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

export function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function cartUnits(cart) {
    return cart.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
}

export function addToCart(productId, meta = {}) {
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
    return { ok: true };
}

export function decFromCart(productId) {
    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === productId);
    if (idx === -1) return;

    const q = Number(cart[idx].qty) || 0;
    if (q <= 1) cart.splice(idx, 1);
    else cart[idx].qty = q - 1;

    saveCart(cart);
}

export function incFromCart(productId) {
    const cart = getCart();
    if (cartUnits(cart) >= CART_MAX_UNITS) {
        return { ok: false, reason: "full" };
    }
    const item = cart.find((x) => x.id === productId);
    if (!item) return { ok: true };
    item.qty = (Number(item.qty) || 0) + 1;
    saveCart(cart);
    return { ok: true };
}

export function removeLine(productId) {
    const cart = getCart().filter((x) => x.id !== productId);
    saveCart(cart);
}

export function clearCart() {
    saveCart([]);
}

// Agregar producto a la lista de productos de la tienda
export function agregarProducto(data) {
    // Si ya es una instancia de Producto (o subclase), solo añadir
    try {
        if (!data) return null;
        if (data instanceof Producto) {
            productos.unshift(data);
            return data;
        }
    } catch (e) {
        // Producto puede no estar en alcance; seguimos con creación por tipo
    }

    const { tipo, nombre, precio, descripcion, extra, imagen } = data;
    let instancia = null;

    switch ((tipo || '').toLowerCase()) {
        case 'novela':
            instancia = new Novela(nombre, precio, descripcion, imagen, extra);
            break;
        case 'ciencia':
        case 'ciencia ficción':
            instancia = new CienciaFiccion(nombre, precio, descripcion, imagen, extra);
            break;
        case 'ensayo':
            instancia = new Ensayo(nombre, precio, descripcion, imagen, extra);
            break;
        case 'infantil':
            instancia = new Infantil(nombre, precio, descripcion, imagen, extra);
            break;
        case 'comic':
            instancia = new Comic(nombre, precio, descripcion, imagen, extra);
            break;
        default:
            instancia = new Producto(nombre, precio, descripcion, imagen);
    }

    productos.unshift(instancia);
    return instancia;
}