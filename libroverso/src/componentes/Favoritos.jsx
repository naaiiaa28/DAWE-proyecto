import { useEffect } from 'react'

export default function Favoritos({ isOpen, onClose, favoritos, onUnfav, formatEUR }) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <>
      {isOpen && <div className="offcanvas-backdrop fade show" onClick={onClose} />}

      <div
        className={`offcanvas offcanvas-end ${isOpen ? 'show' : ''}`}
        tabIndex="-1"
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Favoritos</h5>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
        </div>

        <div className="offcanvas-body d-flex flex-column">
          {favoritos.length === 0 ? (
            <div className="alert alert-info">No tienes favoritos.</div>
          ) : (
            <div className="d-flex flex-column gap-2 flex-grow-1">
              {favoritos.map(p => (
                <div key={p.id} className="carrito-linea">
                  <img
                    className="carrito-thumb"
                    src={p.imagen || ''}
                    alt={p.nombre || p.id}
                    onError={e => { e.target.src = 'imagenes/sin-imagen.png' }}
                  />
                  <div className="carrito-info">
                    <div className="carrito-nombre">{p.nombre || p.id}</div>
                    <div className="carrito-calc">{formatEUR(p.precio)}</div>
                  </div>
                  <button
                    className="carrito-remove"
                    type="button"
                    title="Quitar de favoritos"
                    onClick={() => onUnfav(p)}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
