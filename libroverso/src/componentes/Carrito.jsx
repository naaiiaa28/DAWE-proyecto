import { useState, useEffect, useRef } from 'react'
import { MAX_COPIAS } from '../tienda.js'

const CUPONES = {
  'DESCUENTO10': 10,
}

export default function Carrito({ isOpen, onClose, carrito, onRemove, onClear, onUpdateQty, formatEUR, maxUnits }) {
  const [toast, setToast] = useState(null)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const panelRef = useRef(null)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 1500)
  }

  const subtotal = carrito.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 0), 0)
  const total = Math.max(0, subtotal - couponDiscount)

  const handleQtyChange = (id, val) => {
    let qty = Math.max(1, Math.floor(Number(val) || 1))
    if (qty > (maxUnits || MAX_COPIAS)) {
      qty = maxUnits || MAX_COPIAS
      showToast(`Máximo ${maxUnits || MAX_COPIAS} por producto`, false)
    }
    onUpdateQty(id, qty)
  }

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return showToast('Introduce un cupón.', false)
    if (appliedCoupon === code) return showToast('Ese cupón ya está aplicado.', false)
    if (CUPONES[code] !== undefined) {
      setAppliedCoupon(code)
      setCouponDiscount(CUPONES[code])
      showToast(`Cupón aplicado: -${CUPONES[code]}€`, true)
    } else {
      showToast('Cupón no válido.', false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponInput('')
    showToast('Cupón eliminado.', true)
  }

  const handleClear = () => {
    onClear()
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponInput('')
    showToast('Carrito vacío', true)
  }

  const handleFinalizar = () => {
    onClear()
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponInput('')
    showToast('Compra finalizada (simulación)', true)
  }

  // Trap focus / ESC
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="offcanvas-backdrop fade show" onClick={onClose} />}

      <div
        ref={panelRef}
        className={`offcanvas offcanvas-end ${isOpen ? 'show' : ''}`}
        tabIndex="-1"
        id="offcanvasCarrito"
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Carrito</h5>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
        </div>

        <div className="offcanvas-body d-flex flex-column">
          {carrito.length === 0 ? (
            <div className="alert alert-info">Tu carrito está vacío.</div>
          ) : (
            <>
              <div className="d-flex flex-column gap-2 flex-grow-1" id="carrito-items">
                {carrito.map(it => {
                  const price = Number(it.price) || 0
                  const qty = Number(it.qty) || 0
                  return (
                    <div key={it.id} className="carrito-linea">
                      <img className="carrito-thumb" src={it.img || ''} alt={it.name || it.id}
                        onError={e => { e.target.src = 'imagenes/sin-imagen.png' }} />
                      <div className="carrito-info">
                        <div className="carrito-nombre">{it.name || it.id}</div>
                        <div className="carrito-calc">
                          {formatEUR(price)} ×
                          <input
                            className="carrito-qty"
                            type="number"
                            min="1"
                            value={qty}
                            onChange={e => handleQtyChange(it.id, e.target.value)}
                          />
                          = <strong>{formatEUR(price * qty)}</strong>
                        </div>
                      </div>
                      <button
                        className="carrito-remove"
                        type="button"
                        title="Eliminar"
                        onClick={() => onRemove(it.id)}
                      >×</button>
                    </div>
                  )
                })}

                {appliedCoupon && (
                  <div className="carrito-linea descuento-item">
                    <div className="carrito-info">
                      <div className="carrito-nombre">Cupón {appliedCoupon}</div>
                      <div className="carrito-calc">- {formatEUR(couponDiscount)}</div>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={removeCoupon}>
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              <div className="carrito-total-bar mt-3">
                <span>Total:</span>
                <strong id="carrito-total">{formatEUR(total)}</strong>
              </div>

              <div id="cupon-descuento" className="mt-2">
                <label htmlFor="input-cupon">Introduce tu cupón:</label>
                <div className="d-flex gap-1 mt-1">
                  <input
                    type="text"
                    id="input-cupon"
                    className="form-control form-control-sm"
                    placeholder="Código de cupón"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') applyCoupon() }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={applyCoupon}
                  >Aplicar</button>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-danger btn-sm flex-grow-1" onClick={handleClear}>
                  Vaciar
                </button>
                <button type="button" className="btn btn-success btn-sm flex-grow-1" onClick={handleFinalizar}>
                  Finalizar compra
                </button>
              </div>
            </>
          )}

          {toast && (
            <div className={`alert alert-${toast.ok ? 'success' : 'danger'} mt-3 mb-0`}>
              {toast.msg}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
