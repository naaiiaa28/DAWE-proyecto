export default function Paginacion({ paginaActual, totalPaginas, mostrando, total, onCambiarPagina }) {
  if (totalPaginas <= 1) {
    return (
      <p id="contador-productos" className="text-muted mb-2">
        Mostrando {mostrando} de {total} productos
      </p>
    )
  }

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1)

  return (
    <>
      <p id="contador-productos" className="text-muted mb-2">
        Mostrando {mostrando} de {total} productos
      </p>
      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => onCambiarPagina(paginaActual - 1)}>
              &laquo;
            </button>
          </li>
          {paginas.map(p => (
            <li key={p} className={`page-item ${p === paginaActual ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onCambiarPagina(p)}>{p}</button>
            </li>
          ))}
          <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => onCambiarPagina(paginaActual + 1)}>
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
