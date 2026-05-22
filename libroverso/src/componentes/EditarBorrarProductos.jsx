import { useState, useRef } from 'react'
import { getTipoProducto, getExtraValor } from '../tienda.js'

const TIPOS_LABEL = {
  novela: 'Novela',
  ciencia: 'Ciencia ficción',
  ensayo: 'Ensayo',
  infantil: 'Infantil',
  comic: 'Comic',
}

const PLACEHOLDER_EXTRA = {
  novela: 'Autor',
  ciencia: 'Campo de estudio',
  ensayo: 'Editorial',
  infantil: 'Edad recomendada',
  comic: 'Ilustrador',
}

function FormularioEdicion({ producto, isOnline, onGuardar, onCerrar }) {
  const tipo = getTipoProducto(producto)
  const [nombre, setNombre] = useState(producto.nombre)
  const [precio, setPrecio] = useState(producto.precio)
  const [descripcion, setDescripcion] = useState(producto.descripcion || '')
  const [extra, setExtra] = useState(getExtraValor(producto))
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(producto.imagen)
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)
  const fileRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isOnline || cargando) return
    if (!nombre.trim()) {
      setMensaje({ tipo: 'danger', texto: 'El nombre es obligatorio.' })
      return
    }
    if (!precio || isNaN(Number(precio)) || Number(precio) < 0) {
      setMensaje({ tipo: 'danger', texto: 'El precio no es válido.' })
      return
    }

    const formData = new FormData()
    formData.append('nombre',      nombre.trim())
    formData.append('precio',      precio)
    formData.append('descripcion', descripcion.trim())
    formData.append('extra',       extra.trim())
    if (imagenFile) formData.append('imagen', imagenFile)

    setCargando(true)
    try {
      const res = await fetch(`/api/productos/${producto._id}`, {
        method: 'PUT',
        body: formData,
      })
      const datos = await res.json()
      if (!res.ok) throw new Error(datos.error || 'Error al guardar')
      onGuardar(producto.id, {
        nombre:      datos.nombre,
        precio:      datos.precio,
        descripcion: datos.descripcion,
        extra:       datos.extra,
        imagen:      datos.imagen || null,
      })
      onCerrar()
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="form-edicion-producto">
      <form onSubmit={handleSubmit}>
        <div className="row g-2">
          <div className="col-sm-6">
            <label className="form-label small fw-semibold">Tipo (no editable)</label>
            <select className="form-select form-select-sm" disabled value={tipo}>
              <option value={tipo}>{TIPOS_LABEL[tipo] || tipo}</option>
            </select>
          </div>
          <div className="col-sm-6">
            <label className="form-label small fw-semibold">
              {PLACEHOLDER_EXTRA[tipo] || 'Campo extra'}
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={extra}
              onChange={e => setExtra(e.target.value)}
              disabled={cargando}
            />
          </div>
          <div className="col-sm-8">
            <label className="form-label small fw-semibold">Nombre</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              disabled={cargando}
            />
          </div>
          <div className="col-sm-4">
            <label className="form-label small fw-semibold">Precio (€)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              step="0.01"
              min="0"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              disabled={cargando}
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Descripción</label>
            <textarea
              className="form-control form-control-sm"
              rows="2"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              disabled={cargando}
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Imagen</label>
            {imagenPreview && (
              <div className="mb-1">
                <img
                  src={imagenPreview}
                  alt="Vista previa"
                  className="img-edicion-preview"
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>
            )}
            <input
              type="file"
              className="form-control form-control-sm"
              accept="image/jpg,image/jpeg,image/png,image/webp,image/gif"
              ref={fileRef}
              onChange={handleFileChange}
              disabled={cargando}
            />
          </div>
        </div>
        {mensaje && (
          <div className={`alert alert-${mensaje.tipo} mt-2 py-1 mb-0 small`}>
            {mensaje.texto}
          </div>
        )}
        <button type="submit" className="btn btn-sm btn-success mt-2" disabled={cargando}>
          {cargando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

export default function EditarBorrarProductos({ productos, isOnline, onDeleteProductos, onUpdateProducto }) {
  const [seleccionados, setSeleccionados] = useState([])
  const [editando, setEditando] = useState(null)
  const [cargandoBorrar, setCargandoBorrar] = useState(false)
  const [errorBorrar, setErrorBorrar] = useState(null)

  const toggleSeleccion = (id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleBorrar = async () => {
    if (seleccionados.length === 0 || !isOnline) return
    setCargandoBorrar(true)
    setErrorBorrar(null)
    try {
      // Solo borramos en la BD los que tienen _id de MongoDB
      const mongoIds = productos
        .filter(p => seleccionados.includes(p.id) && p._id)
        .map(p => p._id)

      if (mongoIds.length > 0) {
        const res = await fetch('/api/productos', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: mongoIds }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Error al borrar')
        }
      }
      if (seleccionados.includes(editando)) setEditando(null)
      onDeleteProductos(seleccionados)
      setSeleccionados([])
    } catch (err) {
      setErrorBorrar(err.message)
      setTimeout(() => setErrorBorrar(null), 3000)
    } finally {
      setCargandoBorrar(false)
    }
  }

  return (
    <div className="editar-borrar-container">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0">Editar / Borrar productos</h2>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleBorrar}
          disabled={seleccionados.length === 0 || !isOnline || cargandoBorrar}
        >
          {cargandoBorrar
            ? 'Borrando…'
            : `Borrar todos los seleccionados (${seleccionados.length})`}
        </button>
      </div>

      {!isOnline && (
        <div className="alert alert-warning py-1 small mb-3">
          Sin conexión — la edición y el borrado no están disponibles.
        </div>
      )}

      {errorBorrar && (
        <div className="alert alert-danger py-1 small mb-3">{errorBorrar}</div>
      )}

      {productos.length === 0 ? (
        <p className="text-muted">No hay productos.</p>
      ) : (
        <ul className="lista-editar-productos">
          {productos.map(p => (
            <li key={p.id} className="lista-editar-item">
              <div className="lista-editar-fila">
                <input
                  type="checkbox"
                  className="form-check-input flex-shrink-0"
                  checked={seleccionados.includes(p.id)}
                  onChange={() => toggleSeleccion(p.id)}
                  disabled={!isOnline}
                />
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className="lista-editar-thumb"
                  onError={e => { e.target.src = 'imagenes/INF.png' }}
                />
                <span className="lista-editar-nombre">{p.nombre}</span>

                {isOnline ? (
                  <a
                    href="#"
                    className="lista-editar-enlace"
                    onClick={e => {
                      e.preventDefault()
                      setEditando(prev => prev === p.id ? null : p.id)
                    }}
                  >
                    {editando === p.id ? 'Cerrar' : 'Editar'}
                  </a>
                ) : (
                  <span className="lista-editar-enlace lista-editar-enlace--disabled">
                    Editar
                  </span>
                )}
              </div>

              {editando === p.id && isOnline && (
                <FormularioEdicion
                  producto={p}
                  isOnline={isOnline}
                  onGuardar={onUpdateProducto}
                  onCerrar={() => setEditando(null)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
