import { useEffect } from 'react'
import { getExtraInfo } from '../tienda.js'

export default function DetallesProducto({ producto, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!producto) return null

  const extra = getExtraInfo(producto)

  return (
    <>
      <div className="producto-overlay" onClick={onClose} />
      <div className="producto-modal">
        <button className="producto-modal-close" type="button" aria-label="Cerrar" onClick={onClose}>×</button>

        <div className="producto-modal-izq">
          <img src={producto.imagen} alt={producto.nombre} />
        </div>

        <div className="producto-modal-der">
          <h3>{producto.nombre} — € {Number(producto.precio).toFixed(2)}</h3>

          {extra && (
            <div className="producto-modal-meta">
              <strong>{extra.label}:</strong> {extra.value}
            </div>
          )}

          <div className="producto-modal-meta"><strong>Descripción:</strong></div>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{producto.descripcion}</p>
        </div>
      </div>
    </>
  )
}
