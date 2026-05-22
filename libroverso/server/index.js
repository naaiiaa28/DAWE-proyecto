import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import http from 'http'
import https from 'https'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import routerUsuarios from './rutas/usuarios.js'
import routerProductos from './rutas/productos.js'
import { conectarDB } from './db.js'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '..', 'dist')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda'

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
  secret: process.env.SESSION_SECRET || 'libroverso_secret_dev',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    collectionName: 'sesiones',
    ttl: 60 * 60 * 8,
  }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8,
  },
}))

// ── Rutas API ─────────────────────────────────────────────────────────────────
app.use('/api/usuarios', routerUsuarios)
app.use('/api/productos', routerProductos)

// ── Estáticos ─────────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.static(distPath, { dotfiles: 'allow' }))

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// ── Arranque ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000

conectarDB()
  .then(() => {
    http.createServer(app).listen(PORT, () => {
      console.log(`HTTP escuchando en :${PORT}`)
    })

    const certKey = '/etc/letsencrypt/live/libroverso.me/privkey.pem'
    const certCrt = '/etc/letsencrypt/live/libroverso.me/fullchain.pem'

    if (fs.existsSync(certKey) && fs.existsSync(certCrt)) {
      https
        .createServer({ key: fs.readFileSync(certKey), cert: fs.readFileSync(certCrt) }, app)
        .listen(443, () => console.log('HTTPS escuchando en :443'))
    }
  })
  .catch(err => {
    console.error('Error al conectar con MongoDB:', err.message)
    process.exit(1)
  })
