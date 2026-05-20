import { Router } from 'express'
import Usuario from '../modelos/Usuario.js'
import admin from '../firebase-admin.js'

const router = Router()

// GET /api/usuarios/sesion
// Comprueba si hay sesión activa e incrementa el contador de visitas.
router.get('/sesion', async (req, res) => {
  if (!req.session.email) {
    return res.json({ email: null })
  }
  try {
    const usuario = await Usuario.findOne({ email: req.session.email }, '-password')
    if (!usuario) {
      req.session.destroy(() => {})
      return res.json({ email: null })
    }
    req.session.visitCount = (req.session.visitCount || 1) + 1
    res.json({ ...usuario.toObject(), visitCount: req.session.visitCount })
  } catch {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// POST /api/usuarios/login
// Recibe el ID token de Firebase, lo verifica y crea la sesión Express.
router.post('/login', async (req, res) => {
  const { idToken } = req.body
  if (!idToken) {
    return res.status(400).json({ error: 'Token requerido' })
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    const usuario = await Usuario.findOne({ email: decoded.email }, '-password')
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado en la base de datos' })
    }
    req.session.email = decoded.email
    req.session.visitCount = 1
    res.json({ ...usuario.toObject(), visitCount: 1 })
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
})

// POST /api/usuarios/logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Error cerrando sesión' })
    res.clearCookie('connect.sid')
    res.json({ ok: true })
  })
})

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id, '-password')
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(usuario)
  } catch {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// PUT /api/usuarios/:id
router.put('/:id', async (req, res) => {
  const { nombre, apellidos, telefono, direccion } = req.body
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, apellidos, telefono, direccion },
      { new: true, runValidators: true, select: '-password' }
    )
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(usuario)
  } catch {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
