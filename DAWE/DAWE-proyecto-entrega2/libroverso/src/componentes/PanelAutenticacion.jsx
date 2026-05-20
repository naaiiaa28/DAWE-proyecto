import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase.js'

export default function PanelAutenticacion({ onLogin, isOnline }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  const disabled = !isOnline || cargando

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (disabled) return
    setCargando(true)
    setError(null)
    try {
      const credencial = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credencial.user.getIdToken()
      const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const datos = await res.json()
      if (!res.ok) throw new Error(datos.error || 'Error al iniciar sesión')
      onLogin(datos)
    } catch (err) {
      const codigosCredenciales = [
        'auth/wrong-password',
        'auth/user-not-found',
        'auth/invalid-credential',
        'auth/invalid-email',
      ]
      const msg = codigosCredenciales.includes(err.code)
        ? 'Email o contraseña incorrectos.'
        : err.message || 'Error al iniciar sesión.'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <h2>Acceder</h2>
      {!isOnline && (
        <div className="alert alert-warning py-1 small mb-2">
          Sin conexión — el acceso no está disponible.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input
            type="email"
            className="form-control"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={disabled}>
          {cargando ? 'Accediendo…' : 'Acceder'}
        </button>
        {error && (
          <div className="alert alert-danger mt-2 mb-0">
            {error}
          </div>
        )}
      </form>
    </>
  )
}
