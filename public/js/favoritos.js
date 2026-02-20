import { escapeHtml } from "./utils.js";

export const FAV_KEY = "favoritos_dawe_v1";

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const favs = raw ? JSON.parse(raw) : [];
    return Array.isArray(favs) ? favs : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

export function isFavorite(productId) {
  return getFavorites().some((p) => p.id === productId);
}

// Guardamos lo mínimo necesario para pintar el panel
function normalizeProduct(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    precio: Number(p.precio) || 0,
    imagen: p.imagen || "",
  };
}

// Devuelve true si queda marcado, false si se desmarca
export function toggleFavorite(product) {
  const favs = getFavorites();
  const id = product.id;

  const idx = favs.findIndex((x) => x.id === id);
  if (idx === -1) {
    favs.push(normalizeProduct(product));
    saveFavorites(favs);
    return true;
  } else {
    favs.splice(idx, 1);
    saveFavorites(favs);
    return false;
  }
}

export function favoritesCount() {
  return getFavorites().length;
}