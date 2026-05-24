import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHoteles, type Hotel } from '../services/hotelService'
import './AdminTable.css'

export default function AdminHoteles() {
  const [hoteles, setHoteles] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getHoteles()
      .then(setHoteles)
      .catch(() => setError('No se pudieron cargar los hoteles'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="admin-page__eyebrow">CATÁLOGO</p>
          <h1 className="admin-page__title">Hoteles</h1>
          <p className="admin-page__sub">Vista de hoteles activos. Click para ver sus reservas.</p>
        </div>
      </header>

      {loading && <p className="admin-page__msg">Cargando…</p>}
      {error && <p className="admin-page__msg admin-page__msg--error">{error}</p>}

      {!loading && !error && (
        <div className="hotels-grid">
          {hoteles.map((h) => (
            <article key={h.id_hotel} className="hotel-tile">
              <header>
                <h3 className="hotel-tile__name">{h.nombre}</h3>
                <p className="hotel-tile__location">{h.lugar?.nombre ?? '—'}</p>
              </header>
              {h.direccion && <p className="hotel-tile__address">{h.direccion}</p>}
              <div className="hotel-tile__actions">
                <Link to={`/admin/reservas?id_hotel=${h.id_hotel}`} className="hotel-tile__link">
                  Ver reservas →
                </Link>
                <Link to={`/hoteles/${h.id_hotel}`} className="hotel-tile__link hotel-tile__link--ghost" target="_blank">
                  Ver en sitio público
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
