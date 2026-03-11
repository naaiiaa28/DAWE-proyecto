import { useState, useEffect, useCallback } from 'react'
import Cabecera from './componentes/Cabecera.jsx'
import MenuNavegacion from './componentes/MenuNavegacion.jsx'
import EscaparateProductos from './componentes/EscaparateProductos.jsx'
import FormularioNuevosProductos from './componentes/FormularioNuevosProductos.jsx'
import Carrito from './componentes/Carrito.jsx'
import Favoritos from './componentes/Favoritos.jsx'
import Pie from './componentes/Pie.jsx'
import {
  productosIniciales,
  cargarCarrito,
  addToCart,
  decFromCart,
  removeLine,
  clearCart,
  guardarEnCarrito,
  crearProducto,
  getFavorites,
  toggleFavorite,
  isFavorite,
  formatEUR
} from './tienda.js'

export default function App() {
  const [productos, setProductos] = useState(() => [...productosIniciales])
  const [carrito, setCarrito] = useState(() => cargarCarrito())
  const [favoritos, setFavoritos] = useState(() => getFavorites())
  const [carritoOpen, setCarritoOpen] = useState(false)
  const [favoritosOpen, setFavoritosOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  // Online/offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const refreshCart = useCallback(() => setCarrito(cargarCarrito()), [])

  const handleAddToCart = useCallback((producto) => {
    const result = addToCart(producto.id, {
      name: producto.nombre,
      price: producto.precio,
      img: producto.imagen
    })
    if (result.ok) {
      refreshCart()
    }
    return result
  }, [refreshCart])

  const handleDecFromCart = useCallback((productId) => {
    decFromCart(productId)
    refreshCart()
  }, [refreshCart])

  const handleRemoveLine = useCallback((productId) => {
    removeLine(productId)
    refreshCart()
  }, [refreshCart])

  const handleClearCart = useCallback(() => {
    clearCart()
    refreshCart()
  }, [refreshCart])

  const handleUpdateQty = useCallback((productId, qty) => {
    const cart = cargarCarrito()
    const item = cart.find(x => x.id === productId)
    if (!item) return
    item.qty = qty
    guardarEnCarrito(item)
    refreshCart()
  }, [refreshCart])

  const handleToggleFavorite = useCallback((producto) => {
    toggleFavorite(producto)
    setFavoritos(getFavorites())
  }, [])

  const handleAddProduct = useCallback((data) => {
    const nuevo = crearProducto(data)
    if (nuevo) {
      setProductos(prev => [nuevo, ...prev])
    }
    return nuevo
  }, [])

  const cartCount = carrito.reduce((acc, it) => acc + (Number(it.qty) || 0), 0)
  const favCount = favoritos.length

  return (
    <div id="contenedor-principal">
      <Cabecera titulo="Librería Online" />

      <MenuNavegacion
        cartCount={cartCount}
        favCount={favCount}
        onOpenCarrito={() => setCarritoOpen(true)}
        onOpenFavoritos={() => setFavoritosOpen(true)}
        isOnline={isOnline}
      />

      <div id="contenido" className="row m-0">
        <aside className="col-md-3">
          <FormularioNuevosProductos
            onAddProduct={handleAddProduct}
            isOnline={isOnline}
          />
        </aside>

        <main className="col-md-9">
          <EscaparateProductos
            productos={productos}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={(id) => favoritos.some(f => f.id === id)}
          />
        </main>
      </div>

      <Pie contenido="© 2026 Libroverso. Todos los derechos reservados." />

      <Carrito
        isOpen={carritoOpen}
        onClose={() => setCarritoOpen(false)}
        carrito={carrito}
        onDec={handleDecFromCart}
        onRemove={handleRemoveLine}
        onClear={handleClearCart}
        onUpdateQty={handleUpdateQty}
        formatEUR={formatEUR}
        maxUnits={20}
      />

      <Favoritos
        isOpen={favoritosOpen}
        onClose={() => setFavoritosOpen(false)}
        favoritos={favoritos}
        onUnfav={(producto) => {
          handleToggleFavorite(producto)
        }}
        formatEUR={formatEUR}
      />
    </div>
  )
}
