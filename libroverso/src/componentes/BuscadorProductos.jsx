export default function BuscadorProductos({ busqueda, onBusqueda }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 id="titulo-productos">
        {busqueda.trim() ? `Buscando por: ${busqueda}` : 'Todos los productos'}
      </h2>
      <input
        type="text"
        className="form-control w-50"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={e => onBusqueda(e.target.value)}
      />
    </div>
  )
}
