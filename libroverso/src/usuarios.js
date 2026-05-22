const usuarios = [
  {
    id: 1,
    nombre: 'Adrián',
    apellidos: 'García López',
    email: 'admin@libroverso.com',
    password: 'admin123',
    rol: 'admin',
    telefono: '612345678',
    direccion: 'Calle Mayor 1, Madrid',
  },
  {
    id: 2,
    nombre: 'Laura',
    apellidos: 'Martínez Sánchez',
    email: 'laura@libroverso.com',
    password: 'user123',
    rol: null,
    telefono: '698765432',
    direccion: 'Calle Luna 5, Barcelona',
  },
]

export function autenticar(email, password) {
  const u = usuarios.find(u => u.email === email && u.password === password)
  if (!u) return null
  const { password: _, ...user } = u
  return user
}
