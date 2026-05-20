import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadsDir = path.join(__dirname, 'uploads', 'imagenes')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, nombre)
  },
})

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    cb(null, permitidos.includes(file.mimetype))
  },
  limits: { fileSize: 5 * 1024 * 1024 },
})
