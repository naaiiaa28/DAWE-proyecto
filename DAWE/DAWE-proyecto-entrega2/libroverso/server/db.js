import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda'

export async function conectarDB() {
  await mongoose.connect(MONGODB_URI)
  console.log(`MongoDB conectado: ${MONGODB_URI}`)
}
