import { useState, useEffect } from 'react'

export default function MiCuenta({ usuario, isOnline, onUpdateUsuario }) {
  const [nombre, setNombre] = useState(usuario.nombre || '')
  const [apellidos, setApellidos] = useState(usuario.apellidos || '')
  const [telefono, setTelefono] = useState(usuario.telefono || '')
  const [direccion, setDireccion] = useState(usuario.direccion || '')
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)

  const disabled = !isOnline || cargando

  useEffect(() => {
    setNombre(usuario.nombre || '')
    setApellidos(usuario.apellidos || '')
    setTelefono(usuario.telefono || '')
    setDireccion(usuario.direccion || '')
  }, [usuario])

  const showMsg = (texto, tipo = 'success') => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (disabled) return
    if (!nombre.trim()) {
      showMsg('El nombre no puede estar vacío.', 'danger')
      return
    }
    setCargando(true)
    try {
      const res = await fetch(`/api/usuarios/${usuario._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:    nombre.trim(),
          apellidos: apellidos.trim(),
          telefono:  telefono.trim(),
          direccion: direccion.trim(),
        }),
      })
      const datos = await res.json()
      if (!res.ok) throw new Error(datos.error || 'Error al guardar')
      onUpdateUsuario(datos)
      showMsg('Datos actualizados correctamente.')
    } catch (err) {
      showMsg(err.message || 'Error al guardar los datos.', 'danger')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mi-cuenta-container">
      <h2>Mi cuenta</h2>
      {!isOnline && (
        <div className="alert alert-warning py-1 small mb-3">
          Sin conexión — la edición no está disponible.
        </div>
      )}
      <form onSubmit={handleSubmit} className="mi-cuenta-form">
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            value={usuario.email}
            disabled
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Apellidos</label>
          <input
            type="text"
            className="form-control"
            value={apellidos}
            onChange={e => setApellidos(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input
            type="tel"
            className="form-control"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Dirección</label>
          <input
            type="text"
            className="form-control"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            disabled={disabled}
          />
        </div>
        <button type="submit" className="btn btn-success" disabled={disabled}>
          {cargando ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {mensaje && (
          <div className={`alert alert-${mensaje.tipo} mt-3 mb-0`}>
            {mensaje.texto}
          </div>
        )}
      </form>
    </div>
  )
}
