import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClientes, type UsuarioAdmin } from '../services/adminService'
import './AdminTable.css'

export default function AdminUsuarios() {
  const [clientes, setClientes] = useState<UsuarioAdmin[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getClientes()
      .then(setClientes)
      .catch(() => setError('No se pudieron cargar los clientes'))
      .finally(() => setLoading(false))
  }, [])

  const filtrados = useMemo(() => {
    if (!query.trim()) return clientes
    const q = query.toLowerCase()
    return clientes.filter(
      (c) =>
        c.nombre_completo.toLowerCase().includes(q) ||
        c.correo.toLowerCase().includes(q) ||
        c.usuario.toLowerCase().includes(q),
    )
  }, [clientes, query])

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="admin-page__eyebrow">CLIENTES</p>
          <h1 className="admin-page__title">Clientes</h1>
          <p className="admin-page__sub">{clientes.length} cliente{clientes.length === 1 ? '' : 's'} registrado{clientes.length === 1 ? '' : 's'}.</p>
        </div>
      </header>

      <div className="admin-search">
        <input
          type="search"
          placeholder="Buscar por nombre, correo o usuario…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <p className="admin-page__msg">Cargando…</p>}
      {error && <p className="admin-page__msg admin-page__msg--error">{error}</p>}

      {!loading && !error && (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Usuario</th>
                  <th>Registro</th>
                  <th>Reservas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-empty">Sin resultados.</td>
                  </tr>
                ) : (
                  filtrados.map((c) => (
                    <tr key={c.id_usuario}>
                      <td><strong>{c.nombre_completo}</strong></td>
                      <td>{c.correo}</td>
                      <td>@{c.usuario}</td>
                      <td>{c.fecha_registro}</td>
                      <td>{c.num_reservas}</td>
                      <td>
                        <Link to={`/admin/usuarios/${c.id_usuario}`} className="admin-table__action">
                          Ver reservas
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
