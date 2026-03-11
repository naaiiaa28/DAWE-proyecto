import { useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'

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

  const disabled = !isOnline

  const showMsg = (texto, tipo = 'success') => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3000)
  }

  const handleFile = (file) => {
    if (!file) return
    setImagenFile(file)
    const url = URL.createObjectURL(file)
    setImagenUrl(url)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (disabled) return

    if (!nombre.trim()) return showMsg('El nombre es obligatorio.', 'danger')
    if (!precio || isNaN(Number(precio)) || Number(precio) < 0) return showMsg('El precio no es válido.', 'danger')
    if (!descripcion.trim()) return showMsg('La descripción es obligatoria.', 'danger')

    const data = {
      tipo,
      nombre: nombre.trim(),
      precio: Number(precio),
      descripcion: descripcion.trim(),
      extra: extra.trim(),
      imagen: imagenUrl || null,
    }

    onAddProduct(data)
    showMsg('¡Libro añadido correctamente!')

    // Reset form
    setTipo('')
    setNombre('')
    setPrecio('')
    setDescripcion('')
    setExtra('')
    setImagenFile(null)
    setImagenUrl('')
  }

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

        {/* Drag & Drop with react-drag-drop-files */}
        <div className={`drop-zone-wrapper mb-2 ${disabled ? 'drop-zone-disabled' : ''}`}>
          {disabled ? (
            <div className="drop-zone drop-zone-offline">
              <span className="drop-zone-text">Arrastra aquí la imagen del libro</span>
            </div>
          ) : (
            <FileUploader
              handleChange={handleFile}
              name="imagen-libro"
              types={FILE_TYPES}
              disabled={disabled}
              hoverTitle="Suelta la imagen"
              classes="drop-zone-uploader"
              dropMessageStyle={{ display: 'none' }}
            >
              <div className={`drop-zone ${dragging ? 'dragging' : ''}`}
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDrop={() => setDragging(false)}
              >
                <span className="drop-zone-text">
                  {dragging
                    ? 'Suelta la imagen'
                    : imagenFile
                      ? imagenFile.name
                      : 'Arrastra aquí la imagen del libro'}
                </span>
              </div>
            </FileUploader>
          )}
        </div>

        <button type="submit" className="btn btn-success w-100 mt-2" disabled={disabled}>
          Añadir libro
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
