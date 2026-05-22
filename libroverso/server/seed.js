import mongoose from 'mongoose'
import Producto from './modelos/Producto.js'
import Usuario from './modelos/Usuario.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda'

const productos = [
  { tipo: 'novela',   nombre: 'Cien años de soledad',              precio: 18.50, descripcion: 'Obra maestra de García Márquez sobre la familia Buendía',    imagen: 'imagenes/cien-anos-de-soledad.jpg',        extra: 'Gabriel García Márquez' },
  { tipo: 'novela',   nombre: '1984',                              precio: 15.99, descripcion: 'Distopía clásica de George Orwell',                           imagen: 'imagenes/1984.jpg',                        extra: 'George Orwell' },
  { tipo: 'novela',   nombre: 'El Quijote',                        precio: 22.00, descripcion: 'La obra cumbre de Cervantes',                                 imagen: 'imagenes/El-Quijote.jpg',                  extra: 'Miguel de Cervantes' },
  { tipo: 'ciencia',  nombre: 'Dune',                              precio: 24.99, descripcion: 'Épica espacial de Frank Herbert',                             imagen: 'imagenes/Dune.jpg',                        extra: 'Frank Herbert' },
  { tipo: 'ciencia',  nombre: 'Fundación',                         precio: 19.50, descripcion: 'Primera entrega de la saga de Asimov',                        imagen: 'imagenes/Fundacion.jpg',                   extra: 'Isaac Asimov' },
  { tipo: 'ciencia',  nombre: 'Neuromante',                        precio: 17.99, descripcion: 'Cyberpunk clásico de William Gibson',                         imagen: 'imagenes/Neuromante.jpg',                  extra: 'William Gibson' },
  { tipo: 'ensayo',   nombre: 'Sapiens',                           precio: 21.90, descripcion: 'De animales a dioses: Una breve historia de la humanidad',    imagen: 'imagenes/Sapiens.jpg',                     extra: 'Editorial Debate' },
  { tipo: 'ensayo',   nombre: 'El mundo y sus demonios',           precio: 16.50, descripcion: 'Carl Sagan sobre el pensamiento crítico',                     imagen: 'imagenes/El-mundo-y-sus-demonios.jpg',     extra: 'Planeta' },
  { tipo: 'ensayo',   nombre: 'Pensar rápido, pensar despacio',    precio: 19.99, descripcion: 'Daniel Kahneman sobre la toma de decisiones',                 imagen: 'imagenes/Pensar-rapido-pensar-despacio.jpg', extra: 'Debate' },
  { tipo: 'infantil', nombre: 'El Principito',                     precio: 12.50, descripcion: 'Clásico de Antoine de Saint-Exupéry',                         imagen: 'imagenes/El-Principito.jpg',               extra: '8+ años' },
  { tipo: 'infantil', nombre: 'Matilda',                           precio: 14.99, descripcion: 'Historia de Roald Dahl sobre una niña prodigio',              imagen: 'imagenes/Matilda.jpg',                     extra: '7+ años' },
  { tipo: 'infantil', nombre: 'Harry Potter y la Piedra Filosofal',precio: 16.95, descripcion: 'Primera aventura del joven mago',                             imagen: 'imagenes/harry.jpg',                       extra: '9+ años' },
  { tipo: 'comic',    nombre: 'Watchmen',                          precio: 29.99, descripcion: 'Obra maestra del cómic de Alan Moore',                        imagen: 'imagenes/Watchmen.jpg',                    extra: 'Dave Gibbons' },
  { tipo: 'comic',    nombre: 'Maus',                              precio: 24.50, descripcion: 'Novela gráfica ganadora del Pulitzer',                        imagen: 'imagenes/Maus.jpg',                        extra: 'Art Spiegelman' },
  { tipo: 'comic',    nombre: 'V de Vendetta',                     precio: 26.00, descripcion: 'Thriller político de Alan Moore',                             imagen: 'imagenes/V-d-eVendetta.jpg',               extra: 'David Lloyd' },
]

const usuarios = [
  {
    nombre: 'Adrián',
    apellidos: 'García López',
    email: 'admin@libroverso.com',
    telefono: '612345678',
    direccion: 'Calle Mayor 1, Madrid',
    rol: 'admin',
  },
  {
    nombre: 'Laura',
    apellidos: 'Martínez Sánchez',
    email: 'usuario@libroverso.com',
    telefono: '698765432',
    direccion: 'Calle Luna 5, Barcelona',
    rol: null,
  },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Conectado a MongoDB')

  const countProductos = await Producto.countDocuments()
  if (countProductos > 0) {
    console.log(`Ya hay ${countProductos} productos en la BD. No se insertan duplicados.`)
  } else {
    await Producto.insertMany(productos)
    console.log(`${productos.length} productos insertados correctamente.`)
  }

  const countUsuarios = await Usuario.countDocuments()
  if (countUsuarios > 0) {
    console.log(`Ya hay ${countUsuarios} usuarios en la BD. No se insertan duplicados.`)
  } else {
    await Usuario.insertMany(usuarios)
    console.log(`${usuarios.length} usuarios insertados correctamente.`)
  }

  await mongoose.disconnect()
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
