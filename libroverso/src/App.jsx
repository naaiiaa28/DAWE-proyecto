import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase.js'
import Cabecera from './componentes/Cabecera.jsx'
import MenuNavegacion from './componentes/MenuNavegacion.jsx'
import EscaparateProductos from './componentes/EscaparateProductos.jsx'
import FormularioNuevosProductos from './componentes/FormularioNuevosProductos.jsx'
import MiCuenta from './componentes/MiCuenta.jsx'
import EditarBorrarProductos from './componentes/EditarBorrarProductos.jsx'
import PanelAutenticacion from './componentes/PanelAutenticacion.jsx'
import PanelUsuario from './componentes/PanelUsuario.jsx'
import Carrito from './componentes/Carrito.jsx'
import Favoritos from './componentes/Favoritos.jsx'
import Pie from './componentes/Pie.jsx'
import {
  cargarCarrito,
  addToCart,
  decFromCart,
  removeLine,
  clearCart,
  guardarEnCarrito,
  crearProducto,
  getFavorites,
  toggleFavorite,
  formatEUR,
} from './tienda.js'

export default function App() {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState(() => cargarCarrito())
  const [favoritos, setFavoritos] = useState(() => getFavorites())
  const [carritoOpen, setCarritoOpen] = useState(false)
  const [favoritosOpen, setFavoritosOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [sesion, setSesion] = useState(null)
  const [seccionActiva, setSeccionActiva] = useState('escaparate')

  // Detectar online/offline
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

  // Cargar productos desde MongoDB al arrancar
  useEffect(() => {
    fetch('/api/productos')
      .then(r => r.json())
      .then(data => {
        const lista = data.map(p => {
          const producto = crearProducto(p)
          if (producto) producto._id = p._id
          return producto
        }).filter(Boolean)
        setProductos(lista)
      })
      .catch(() => {})
  }, [])

  // Rehidratar sesión desde el servidor al cargar la página
  useEffect(() => {
    fetch('/api/usuarios/sesion')
      .then(r => r.json())
      .then(data => {
        if (data.email) {
          const { visitCount, ...user } = data
          setSesion({ user, visitCount })
        }
      })
      .catch(() => {})
  }, [])

  const refreshCart = useCallback(() => setCarrito(cargarCarrito()), [])

  const handleAddToCart = useCallback((producto) => {
    const result = addToCart(producto.id, {
      name: producto.nombre,
      price: producto.precio,
      img: producto.imagen,
    })
    if (result.ok) refreshCart()
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

  const handleAddProduct = useCallback(async (data) => {
    const formData = new FormData()
    formData.append('tipo',        data.tipo)
    formData.append('nombre',      data.nombre)
    formData.append('precio',      data.precio)
    formData.append('descripcion', data.descripcion || '')
    formData.append('extra',       data.extra || '')
    if (data.imagenFile) formData.append('imagen', data.imagenFile)

    try {
      const res = await fetch('/api/productos', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) return { ok: false, error: json.error || 'Error al añadir' }
      const nuevo = crearProducto({ ...data, imagen: json.imagen || '' })
      if (nuevo) {
        nuevo._id = json._id  // MongoDB ID para llamadas a la API
        setProductos(prev => [nuevo, ...prev])
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Error de red' }
    }
  }, [])

  // PanelAutenticacion llama a onLogin con los datos del usuario ya validados
  const handleLogin = useCallback((userData) => {
    const { visitCount, ...user } = userData
    setSesion({ user, visitCount })
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth)
      await fetch('/api/usuarios/logout', { method: 'POST' })
    } catch {
      // ignorar errores de red o Firebase
    }
    setSesion(null)
    setSeccionActiva('escaparate')
  }, [])

  const handleUpdateUsuario = useCallback((data) => {
    setSesion(prev => prev ? { ...prev, user: { ...prev.user, ...data } } : prev)
  }, [])

  const handleDeleteProductos = useCallback((ids) => {
    setProductos(prev => prev.filter(p => !ids.includes(p.id)))
  }, [])

  const handleUpdateProducto = useCallback((id, data) => {
    setProductos(prev => {
      const idx = prev.findIndex(p => p.id === id)
      if (idx === -1) return prev
      const p = prev[idx]
      p.nombre = data.nombre
      p.precio = Number(data.precio)
      p.descripcion = data.descripcion
      if (data.imagen != null) p.imagen = data.imagen
      if (p.autor !== undefined)                p.autor = data.extra
      else if (p.campo !== undefined)           p.campo = data.extra
      else if (p.editor !== undefined)          p.editor = data.extra
      else if (p.edadRecomendada !== undefined) p.edadRecomendada = data.extra
      else if (p.ilustrador !== undefined)      p.ilustrador = data.extra
      return [...prev]
    })
  }, [])

  const usuario = sesion?.user || null
  const visitCount = sesion?.visitCount || 1
  const esAdmin = usuario?.rol === 'admin'

  const cartCount = carrito.reduce((acc, it) => acc + (Number(it.qty) || 0), 0)
  const favCount = favoritos.length

  const renderMain = () => {
    if (seccionActiva === 'mi-cuenta') {
      if (!usuario) {
        return (
          <div className="p-4 text-center text-muted">
            <p>Debes iniciar sesión para acceder a tu cuenta.</p>
          </div>
        )
      }
      return <MiCuenta usuario={usuario} isOnline={isOnline} onUpdateUsuario={handleUpdateUsuario} />
    }
    if (seccionActiva === 'anadir-producto' && esAdmin) {
      return (
        <FormularioNuevosProductos
          onAddProduct={handleAddProduct}
          isOnline={isOnline}
        />
      )
    }
    if (seccionActiva === 'editar-borrar' && esAdmin) {
      return (
        <EditarBorrarProductos
          productos={productos}
          isOnline={isOnline}
          onDeleteProductos={handleDeleteProductos}
          onUpdateProducto={handleUpdateProducto}
        />
      )
    }
    return (
      <EscaparateProductos
        productos={productos}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={(id) => favoritos.some(f => f.id === id)}
      />
    )
  }

  return (
    <div id="contenedor-principal">
      <Cabecera titulo="Librería Online" />

      <MenuNavegacion
        cartCount={cartCount}
        favCount={favCount}
        onOpenCarrito={() => setCarritoOpen(true)}
        onOpenFavoritos={() => setFavoritosOpen(true)}
        isOnline={isOnline}
        esAdmin={esAdmin}
        usuarioLogueado={!!usuario}
        seccionActiva={seccionActiva}
        onNavegar={setSeccionActiva}
      />

      <div id="contenido" className="row m-0">
        <aside className="col-md-3">
          {usuario ? (
            <PanelUsuario
              usuario={usuario}
              visitCount={visitCount}
              onLogout={handleLogout}
            />
          ) : (
            <PanelAutenticacion onLogin={handleLogin} isOnline={isOnline} />
          )}
        </aside>

        <main className="col-md-9">
          {renderMain()}
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
        onUnfav={(producto) => handleToggleFavorite(producto)}
        formatEUR={formatEUR}
      />
    </div>
  )
}
