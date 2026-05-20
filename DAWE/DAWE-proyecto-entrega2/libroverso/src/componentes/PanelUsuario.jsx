export default function PanelUsuario({ usuario, visitCount, onLogout }) {
  return (
    <>
      <h2>Mi sesión</h2>
      <p className="panel-usuario-bienvenida">
        Bienvenido/a, <strong>{usuario.nombre}</strong>
      </p>
      <div className="panel-usuario-datos">
        <div className="panel-usuario-fila">
          <span className="panel-usuario-label">Rol</span>
          <span className="panel-usuario-valor">{usuario.rol || 'Sin rol'}</span>
        </div>
        <div className="panel-usuario-fila">
          <span className="panel-usuario-label">Visitas</span>
          <span className="panel-usuario-valor">{visitCount}</span>
        </div>
      </div>
      <button className="btn btn-outline-danger w-100 mt-3" onClick={onLogout}>
        Cerrar sesión
      </button>
    </>
  )
}
