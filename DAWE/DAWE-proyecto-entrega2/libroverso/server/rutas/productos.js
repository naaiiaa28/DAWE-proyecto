import { Router } from 'express'
import Producto from '../modelos/Producto.js'
import { upload } from '../upload.js'

const router = Router()

// GET /api/productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find()
    res.json(productos)
  } catch {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id)
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(producto)
  } catch {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// POST /api/productos
router.post('/', upload.single('imagen'), async (req, res) => {
  const { tipo, nombre, precio, descripcion, extra } = req.body
  const imagen = req.file ? `/uploads/imagenes/${req.file.filename}` : ''
  try {
    const producto = new Producto({
      tipo,
      nombre,
      precio: Number(precio),
      descripcion,
      extra,
      imagen,
    })
    await producto.save()
    res.status(201).json(producto)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// PUT /api/productos/:id
router.put('/:id', upload.single('imagen'), async (req, res) => {
  const { nombre, precio, descripcion, extra } = req.body
  const actualizacion = { nombre, precio: Number(precio), descripcion, extra }
  if (req.file) actualizacion.imagen = `/uploads/imagenes/${req.file.filename}`
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      actualizacion,
      { new: true, runValidators: true }
    )
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(producto)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// DELETE /api/productos  (borrado múltiple)
router.delete('/', async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de ids' })
  }
  try {
    await Producto.deleteMany({ _id: { $in: ids } })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// DELETE /api/productos/:id
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id)
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
