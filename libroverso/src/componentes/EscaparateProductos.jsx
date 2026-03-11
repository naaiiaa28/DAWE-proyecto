import { useState, useCallback } from 'react'
import BuscadorProductos from './BuscadorProductos.jsx'
import Paginacion from './Paginacion.jsx'
import DetallesProducto from './DetallesProducto.jsx'

const PRODUCTOS_POR_PAGINA = 6

function ProductoCard({ producto, onAddToCart, onToggleFavorite, esFavorito, onOpenDetalle }) {
  const [toast, setToast] = useState(null)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    const result = onAddToCart(producto)
    if (result.ok) {
      setToast('¡Añadido al carrito!')
      setTimeout(() => setToast(null), 1500)
    } else if (result.reason === 'max_per_product') {
      setToast('¡Límite máximo alcanzado!')
      setTimeout(() => setToast(null), 1500)
    }
  }

  const handleFav = (e) => {
    e.stopPropagation()
    onToggleFavorite(producto)
  }

  return (
    <div className="col-md-4">
      <div className="card h-100 position-relative producto-card">
        {toast && (
          <div className="alert alert-success position-absolute top-0 end-0 m-2" style={{ zIndex: 10, fontSize: '0.85rem', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
            {toast}
          </div>
        )}
        <img
          src={producto.imagen}
          className="card-img-top producto-img"
          alt={producto.nombre}
          onClick={() => onOpenDetalle(producto)}
          style={{ cursor: 'pointer' }}
          onError={e => { e.target.src = 'imagenes/sin-imagen.png' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{producto.nombre}</h5>
          <p className="card-text text-muted small flex-grow-1">{producto.descripcion}</p>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <span className="precio fw-bold">€ {Number(producto.precio).toFixed(2)}</span>
            <div>
              <button
                type="button"
                className={`btn-favorito me-1 ${esFavorito ? 'active' : ''}`}
                onClick={handleFav}
                aria-pressed={esFavorito}
                data-id={producto.id}
              >
                {esFavorito ? '★' : '☆'}
              </button>
              <button
                type="button"
                className="btn btn-carrito btn-sm"
                onClick={handleAddToCart}
              >
                🛒 Añadir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EscaparateProductos({ productos, onAddToCart, onToggleFavorite, isFavorite }) {
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [productoDetalle, setProductoDetalle] = useState(null)

  const handleBusqueda = useCallback((valor) => {
    setBusqueda(valor)
    setPaginaActual(1)
  }, [])

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PRODUCTOS_POR_PAGINA))
  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA
  const pagina = filtrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA)

  const handleCambiarPagina = (p) => {
    const np = Math.max(1, Math.min(p, totalPaginas))
    setPaginaActual(np)
  }

  return (
    <>
      <BuscadorProductos busqueda={busqueda} onBusqueda={handleBusqueda} />

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        mostrando={pagina.length}
        total={filtrados.length}
        onCambiarPagina={handleCambiarPagina}
      />

      <div id="grid-productos" className="row g-3">
        {pagina.map(p => (
          <ProductoCard
            key={p.id}
            producto={p}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            esFavorito={isFavorite(p.id)}
            onOpenDetalle={setProductoDetalle}
          />
        ))}
      </div>

      {pagina.length > 0 && totalPaginas > 1 && (
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          mostrando={pagina.length}
          total={filtrados.length}
          onCambiarPagina={handleCambiarPagina}
        />
      )}

      {productoDetalle && (
        <DetallesProducto
          producto={productoDetalle}
          onClose={() => setProductoDetalle(null)}
        />
      )}
    </>
  )
}
