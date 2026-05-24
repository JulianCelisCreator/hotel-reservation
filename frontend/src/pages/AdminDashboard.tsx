import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats, type AdminStats } from '../services/adminService'
import './AdminDashboard.css'

const CARDS: { key: keyof AdminStats; label: string; modifier: string }[] = [
  { key: 'total', label: 'Total de reservas', modifier: 'total' },
  { key: 'confirmada', label: 'Confirmadas', modifier: 'confirmadas' },
  { key: 'finalizada', label: 'Finalizadas', modifier: 'finalizadas' },
  { key: 'pendiente', label: 'Pendientes', modifier: 'pendientes' },
  { key: 'cancelada', label: 'Canceladas', modifier: 'canceladas' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError('No se pudieron cargar las estadísticas'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard">
      <header className="dashboard__head">
        <p className="dashboard__eyebrow">PANEL DE CONTROL</p>
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__sub">Resumen de la actividad de reservas.</p>
      </header>

      {loading && <p className="dashboard__loading">Cargando…</p>}
      {error && <p className="dashboard__error">{error}</p>}

      {stats && (
        <>
          <section className="stats-grid">
            {CARDS.map((c) => (
              <div key={c.key} className={`stat-card stat-card--${c.modifier}`}>
                <p className="stat-card__label">{c.label}</p>
                <p className="stat-card__value">{stats[c.key]}</p>
              </div>
            ))}
          </section>

          <section className="dashboard__actions">
            <h2 className="dashboard__section-title">Acciones rápidas</h2>
            <div className="quick-actions">
              <Link to="/admin/reservas/nueva" className="quick-action">
                <span className="quick-action__icon">+</span>
                <span>
                  <strong>Nueva reserva</strong>
                  <p>Crea una reserva para un cliente</p>
                </span>
              </Link>
              <Link to="/admin/reservas" className="quick-action">
                <span className="quick-action__icon">≡</span>
                <span>
                  <strong>Gestionar reservas</strong>
                  <p>Ver, editar y cancelar reservas</p>
                </span>
              </Link>
              <Link to="/admin/usuarios" className="quick-action">
                <span className="quick-action__icon">👤</span>
                <span>
                  <strong>Clientes</strong>
                  <p>Consulta el historial de cada cliente</p>
                </span>
              </Link>
              <Link to="/admin/hoteles" className="quick-action">
                <span className="quick-action__icon">⌂</span>
                <span>
                  <strong>Hoteles</strong>
                  <p>Catálogo de hoteles y sus reservas</p>
                </span>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
