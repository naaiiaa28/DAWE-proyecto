import mongoose from 'mongoose'

const productoSchema = new mongoose.Schema({
  tipo:        { type: String, required: true, enum: ['novela', 'ciencia', 'ensayo', 'infantil', 'comic'] },
  nombre:      { type: String, required: true },
  precio:      { type: Number, required: true, min: 0 },
  descripcion: { type: String, default: '' },
  extra:       { type: String, default: '' },
  imagen:      { type: String, default: '' },
})

export default mongoose.model('Producto', productoSchema)
