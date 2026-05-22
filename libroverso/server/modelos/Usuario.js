import mongoose from 'mongoose'

const usuarioSchema = new mongoose.Schema({
  nombre:    { type: String, required: true },
  apellidos: { type: String, default: '' },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  telefono:  { type: String, default: '' },
  direccion: { type: String, default: '' },
  rol:       { type: String, default: null },
})

export default mongoose.model('Usuario', usuarioSchema)
