import { useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import { useRef } from 'react'


const TIPOS_LIBRO = [
  { value: '', label: 'Tipo de libro' },
  { value: 'novela', label: 'Novela' },
  { value: 'ciencia', label: 'Ciencia ficción' },
  { value: 'ensayo', label: 'Ensayo' },
  { value: 'infantil', label: 'Infantil' },
  { value: 'comic', label: 'Comic' },
]

const PLACEHOLDER_EXTRA = {
  novela: 'Autor',
  ciencia: 'Campo de estudio',
  ensayo: 'Editorial',
  infantil: 'Edad recomendada',
  comic: 'Ilustrador',
}

const FILE_TYPES = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF']

export default function FormularioNuevosProductos({ onAddProduct, isOnline }) {
  const [tipo, setTipo] = useState('')
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [extra, setExtra] = useState('')
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenUrl, setImagenUrl] = useState('')
  const [mensaje, setMensaje] = useState(null) // { tipo: 'success'|'danger', texto }
  const [dragging, setDragging] = useState(false)
  const [imagenOrigen, setImagenOrigen] = useState(null) // 'file' | 'drop' | null
  const [enviando, setEnviando] = useState(false)
  const fileInputRef = useRef(null)

  const disabled = !isOnline || enviando

  const showMsg = (texto, tipo = 'success') => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3000)
  }

  const handleFile = (file) => {
  if (!file) return
    setImagenFile(file)
    setImagenUrl(URL.createObjectURL(file))
    setImagenOrigen('drop')
  }

  const handleFileInput = (e) => {
  const file = e.target.files[0]
  if (!file) return
    setImagenFile(file)
    setImagenUrl(URL.createObjectURL(file))
    setImagenOrigen('file')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (disabled) return

    if (!nombre.trim()) return showMsg('El nombre es obligatorio.', 'danger')
    if (!precio || isNaN(Number(precio)) || Number(precio) < 0) return showMsg('El precio no es válido.', 'danger')
    if (!tipo) return showMsg('Debes seleccionar un tipo de libro.', 'danger')
    if (tipo && !extra.trim())
      return showMsg(`El campo "${PLACEHOLDER_EXTRA[tipo]}" es obligatorio.`, 'danger')

    const data = {
      tipo,
      nombre: nombre.trim(),
      precio: Number(precio),
      descripcion: descripcion.trim(),
      extra: extra.trim(),
      imagenFile: imagenFile || null,
    }

    setEnviando(true)
    const result = await onAddProduct(data)
    setEnviando(false)
    if (result && !result.ok) {
      return showMsg(result.error || 'Error al añadir el producto.', 'danger')
    }
    showMsg('¡Libro añadido correctamente!')

    // Reset form
    setTipo('')
    setNombre('')
    setPrecio('')
    setDescripcion('')
    setExtra('')
    setImagenFile(null)
    setImagenUrl('')
    setImagenOrigen(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const fileInputDisabled = disabled || imagenOrigen === 'drop'
  const dropZoneDisabled = disabled || imagenOrigen === 'file'

  return (
    <>
      <h2>Añadir libro</h2>
      <form id="form-libro" onSubmit={handleSubmit}>

        <div className="mb-2">
          <select
            id="tipo-libro"
            className="form-select"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            disabled={disabled}
          >
            {TIPOS_LIBRO.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {tipo && (
          <div className="mb-2">
            <input
              type="text"
              className="form-control"
              placeholder={PLACEHOLDER_EXTRA[tipo] || 'Campo extra'}
              value={extra}
              onChange={e => setExtra(e.target.value)}
              disabled={disabled}
            />
          </div>
        )}

        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre del libro"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Precio (€)"
            step="0.01"
            value={precio}
            onChange={e => setPrecio(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="mb-2">
          <textarea
            className="form-control"
            rows="3"
            placeholder="Descripción del libro"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="mb-2">
          <input
            type="file"
            id="imagen-libro"
            className="form-control"
            accept="image/jpg,image/jpeg,image/png,image/webp,image/gif"
            ref={fileInputRef}
            onChange={handleFileInput}
            disabled={fileInputDisabled}
          />
        </div>

        {/* Drag & Drop with react-drag-drop-files */}
        <div className={`drop-zone-wrapper mb-2 ${dropZoneDisabled ? 'drop-zone-disabled' : ''}`}>
          {dropZoneDisabled ? (
            <div className="drop-zone drop-zone-offline" />
          ) : (
            <FileUploader
              handleChange={handleFile}
              name="imagen-libro"
              types={FILE_TYPES}
              disabled={disabled}
              classes="drop-zone-uploader"
              dropMessageStyle={{ display: 'none' }}
              onDraggingStateChange={(dragging) => setDragging(dragging)}
            >
              <div className={`drop-zone ${dragging ? 'dragging' : ''}`}>
                {(dragging || imagenFile) && (
                  <span className="drop-zone-text">
                    {dragging ? 'Suelta la imagen' : imagenFile.name}
                  </span>
                )}
              </div>
            </FileUploader>
          )}
        </div>

        <button type="submit" className="btn btn-success w-100 mt-2" disabled={disabled}>
          {enviando ? 'Guardando…' : 'Añadir libro'}
        </button>

        {mensaje && (
          <div className={`alert alert-${mensaje.tipo} mt-2 mb-0`}>
            {mensaje.texto}
          </div>
        )}

      </form>
    </>
  )
}
