import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getReservasCliente } from '../services/adminService'
import type { ReservaOut } from '../services/reservaService'
import './AdminTable.css'

function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

export default function AdminUsuarioDetalle() {
  const { id } = useParams<{ id: string }>()
  const idUsuario = Number(id)
  const [reservas, setReservas] = useState<ReservaOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getReservasCliente(idUsuario)
      .then(setReservas)
      .catch(() => setError('No se pudieron cargar las reservas'))
      .finally(() => setLoading(false))
  }, [idUsuario])

  const cliente = reservas[0]?.usuario

  return (
    <div className="admin-page">
      <Link to="/admin/usuarios" className="admin-page__back">← Volver a clientes</Link>
      <header className="admin-page__head">
        <div>
          <p className="admin-page__eyebrow">DETALLE DE CLIENTE</p>
          <h1 className="admin-page__title">
            {cliente ? cliente.nombre_completo : `Cliente #${idUsuario}`}
          </h1>
          <p className="admin-page__sub">
            {cliente ? cliente.correo : 'Historial de reservas'} · {reservas.length} reserva
            {reservas.length === 1 ? '' : 's'}
          </p>
        </div>
      </header>

      {loading && <p className="admin-page__msg">Cargando…</p>}
      {error && <p className="admin-page__msg admin-page__msg--error">{error}</p>}

      {!loading && !error && (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Hotel</th>
                  <th>Habitación</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reservas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="admin-empty">Este cliente aún no tiene reservas.</td>
                  </tr>
                ) : (
                  reservas.map((r) => (
                    <tr key={r.id_reserva}>
                      <td>{r.id_reserva}</td>
                      <td>{r.hotel.nombre}</td>
                      <td>{r.habitacion.num_hab}</td>
                      <td>{r.fecha_inicio}</td>
                      <td>{r.fecha_fin}</td>
                      <td>
                        <span className={`estado-pill estado-pill--${r.estado}`}>{r.estado}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatPrice(r.total)}</td>
                      <td>
                        <Link to={`/admin/reservas/${r.id_reserva}`} className="admin-table__action">
                          Detalle
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
