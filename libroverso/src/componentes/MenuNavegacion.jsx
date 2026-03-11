export default function MenuNavegacion({ cartCount, favCount, onOpenCarrito, onOpenFavoritos, isOnline }) {
  return (
    <nav>
      <ul>
        <li><a href="index.html">Inicio</a></li>
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
