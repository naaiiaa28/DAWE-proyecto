import { Novela } from './Novela.js'
import { CienciaFiccion } from './CienciaFiccion.js'
import { Ensayo } from './Ensayo.js'
import { Infantil } from './Infantil.js'
import { Comic } from './Comic.js'
import { Producto } from './Producto.js'

// ─── Constantes ───────────────────────────────────────────────────────────────
export const DIVISA = '€'
export const MAX_COPIAS = 20
export const CART_KEY = 'carrito_dawe_v1'
export const CART_MAX_UNITS_PRODUCT = 20

// ─── Productos iniciales ───────────────────────────────────────────────────────
export const productosIniciales = [
  // Novelas
  new Novela('Cien años de soledad', 18.50, 'Obra maestra de García Márquez sobre la familia Buendía', 'imagenes/cien-anos-de-soledad.jpg', 'Gabriel García Márquez'),
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
]

// ─── Carrito en localStorage (un key por producto: 'producto_<id>') ─────────────

/**
 * Guarda o actualiza un elemento del carrito en localStorage.
 * key: 'producto_<id>'
 * value: JSON string con { id, name, price, img, qty }
 */
export function guardarEnCarrito(item) {
  const key = `producto_${item.id}`
  localStorage.setItem(key, JSON.stringify(item))
}

/**
 * Borra un producto por su ID del localStorage.
 */
export function borrarDelCarrito(productId) {
  localStorage.removeItem(`producto_${productId}`)
}

/**
 * Carga todo el carrito desde localStorage en un array.
 * Filtra por las claves que empiezan por 'producto_'.
 */
export function cargarCarrito() {
  const cart = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('producto_')) {
      try {
        const item = JSON.parse(localStorage.getItem(key))
        if (item) cart.push(item)
      } catch {
        // entrada corrupta, ignorar
      }
    }
  }
  return cart
}

/**
 * Añade o incrementa un producto en el carrito (localStorage).
 */
export function addToCart(productId, meta = {}) {
  const cart = cargarCarrito()
  const item = cart.find(x => x.id === productId)
  const currentQty = item ? (Number(item.qty) || 0) : 0

  if (currentQty >= MAX_COPIAS) {
    return { ok: false, reason: 'max_per_product' }
  }

  if (item) {
    item.qty = currentQty + 1
    guardarEnCarrito(item)
  } else {
    const newItem = {
      id: productId,
      qty: 1,
      name: meta.name || productId,
      price: Number(meta.price) || 0,
      img: meta.img || ''
    }
    guardarEnCarrito(newItem)
  }
  return { ok: true }
}

/**
 * Decrementa la cantidad de un producto; lo elimina si llega a 0.
 */
export function decFromCart(productId) {
  const cart = cargarCarrito()
  const item = cart.find(x => x.id === productId)
  if (!item) return
  const q = Number(item.qty) || 0
  if (q <= 1) {
    borrarDelCarrito(productId)
  } else {
    item.qty = q - 1
    guardarEnCarrito(item)
  }
}

/**
 * Incrementa la cantidad de un producto.
 */
export function incFromCart(productId) {
  const cart = cargarCarrito()
  const item = cart.find(x => x.id === productId)
  if (!item) return { ok: true }
  const currentQty = Number(item.qty) || 0
  if (currentQty >= MAX_COPIAS) return { ok: false, reason: 'max_per_product' }
  item.qty = currentQty + 1
  guardarEnCarrito(item)
  return { ok: true }
}

/**
 * Elimina una línea completa del carrito.
 */
export function removeLine(productId) {
  borrarDelCarrito(productId)
}

/**
 * Vacía el carrito completo (elimina todas las claves 'producto_*').
 */
export function clearCart() {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('producto_')) keysToRemove.push(key)
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
}

/**
 * Crea una instancia de producto según el tipo y la añade al array pasado.
 */
export function crearProducto(data) {
  if (!data) return null
  if (data instanceof Producto) return data

  const { tipo, nombre, precio, descripcion, extra, imagen } = data

  switch ((tipo || '').toLowerCase()) {
    case 'novela':    return new Novela(nombre, precio, descripcion, imagen, extra)
    case 'ciencia':   return new CienciaFiccion(nombre, precio, descripcion, imagen, extra)
    case 'ensayo':    return new Ensayo(nombre, precio, descripcion, imagen, extra)
    case 'infantil':  return new Infantil(nombre, precio, descripcion, imagen, extra)
    case 'comic':     return new Comic(nombre, precio, descripcion, imagen, extra)
    default:          return new Producto(nombre, precio, descripcion, imagen)
  }
}

// ─── Favoritos en localStorage ────────────────────────────────────────────────
export const FAV_KEY = 'favoritos_dawe_v1'

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    const favs = raw ? JSON.parse(raw) : []
    return Array.isArray(favs) ? favs : []
  } catch {
    return []
  }
}

export function saveFavorites(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs))
}

export function isFavorite(productId) {
  return getFavorites().some(p => p.id === productId)
}

export function toggleFavorite(product) {
  const favs = getFavorites()
  const idx = favs.findIndex(x => x.id === product.id)
  if (idx === -1) {
    favs.push({ id: product.id, nombre: product.nombre, precio: Number(product.precio) || 0, imagen: product.imagen || '' })
    saveFavorites(favs)
    return true
  } else {
    favs.splice(idx, 1)
    saveFavorites(favs)
    return false
  }
}

export function favoritesCount() {
  return getFavorites().length
}

// ─── Utilidades ────────────────────────────────────────────────────────────────
export function formatEUR(n) {
  return `${DIVISA} ${Number(n).toFixed(2)}`
}

export function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function getExtraInfo(producto) {
  if (producto.autor)           return { label: 'Autor', value: producto.autor }
  if (producto.editor)          return { label: 'Editor', value: producto.editor }
  if (producto.edadRecomendada) return { label: 'Edad recomendada', value: producto.edadRecomendada }
  if (producto.ilustrador)      return { label: 'Ilustrador', value: producto.ilustrador }
  if (producto.campo)           return { label: 'Campo de estudio', value: producto.campo }
  return null
}
