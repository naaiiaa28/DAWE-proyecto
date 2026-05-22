export default function MenuNavegacion({
  cartCount,
  favCount,
  onOpenCarrito,
  onOpenFavoritos,
  isOnline,
  esAdmin,
  usuarioLogueado,
  seccionActiva,
  onNavegar,
}) {
  const linkClass = (seccion) =>
    seccionActiva === seccion ? 'nav-link-activo' : ''

  return (
    <nav>
      <ul>
        <li>
          <a
            href="#"
            className={linkClass('escaparate')}
            onClick={e => { e.preventDefault(); onNavegar('escaparate') }}
          >
            Inicio
          </a>
        </li>
        <li>
          <a
            href="#"
            className={linkClass('mi-cuenta')}
            onClick={e => { e.preventDefault(); onNavegar('mi-cuenta') }}
          >
            Mi cuenta
          </a>
        </li>
        {esAdmin && (
          <li>
            <a
              href="#"
              className={linkClass('anadir-producto')}
              onClick={e => { e.preventDefault(); onNavegar('anadir-producto') }}
            >
              Añadir un producto
            </a>
          </li>
        )}
        {esAdmin && (
          <li>
            <a
              href="#"
              className={linkClass('editar-borrar')}
              onClick={e => { e.preventDefault(); onNavegar('editar-borrar') }}
            >
              Editar/Borrar productos
            </a>
          </li>
        )}
        <li>
          <a href="#" onClick={e => { e.preventDefault(); onOpenFavoritos() }}>
            Favoritos <span className="badge bg-warning text-dark">{favCount}</span>
          </a>
        </li>
        <li>
          <a href="#" onClick={e => { e.preventDefault(); onOpenCarrito() }}>
            Carrito <span className="badge bg-success">{cartCount}</span>
          </a>
        </li>
      </ul>

      {!isOnline && (
        <div className="offline-badge">
          Estás offline
        </div>
      )}
    </nav>
  )
}
