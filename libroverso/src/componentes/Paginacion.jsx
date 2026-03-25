export default function Paginacion({ paginaActual, totalPaginas, onCambiarPagina }) {

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1)

  return (
    <nav className="mt-4">
      <ul className="pagination justify-content-center">

        {/* ANTERIOR */}
        {paginaActual > 1 && (
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => onCambiarPagina(paginaActual - 1)}
            >
              Anterior
            </button>
          </li>
        )}

        {/* NÚMEROS DE PÁGINA */}
        {paginas.map(p => (
          <li key={p} className={`page-item ${p === paginaActual ? 'active' : ''}`}>
            <button
              className="page-link"
              onClick={() => onCambiarPagina(p)}
            >
              {p}
            </button>
          </li>
        ))}

        {/* SIGUIENTE */}
        {paginaActual < totalPaginas && (
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => onCambiarPagina(paginaActual + 1)}
            >
              Siguiente
            </button>
          </li>
        )}

      </ul>
    </nav>
  )
}
