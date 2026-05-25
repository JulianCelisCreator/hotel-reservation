import { useEffect, useState } from 'react'
import HotelCard from '../components/HotelCard'
import { Link } from 'react-router-dom'
import type { Hotel } from '../services/hotelService'
import { buscarHoteles, getHoteles } from '../services/hotelService'
import HotelMap from '../components/HotelMap'
import './Home.css'

function todayISO(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export default function Home() {
  const [hoteles, setHoteles] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ciudad, setCiudad] = useState('')
  const [fechaInicio, setFechaInicio] = useState(todayISO(7))
  const [fechaFin, setFechaFin] = useState(todayISO(9))

  useEffect(() => {
    getHoteles()
      .then(setHoteles)
      .catch(() => setError('No se pudieron cargar los hoteles'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (fechaFin <= fechaInicio) {
      setError('La fecha de salida debe ser posterior a la de entrada')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await buscarHoteles(ciudad || undefined)
      setHoteles(result)
    } catch {
      setError('Error al buscar hoteles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="home">
      <section className="home-hero">
        <div className="home-hero__overlay" />
        <div className="home-hero__inner">
          <p className="home-hero__eyebrow">UD · HOTELES</p>
          <h1 className="home-hero__title">Encuentre su próximo descanso</h1>
          <p className="home-hero__subtitle">
            Cinco hoteles en Colombia. Una experiencia editorial de hospedaje.
          </p>

          <form className="home-search" onSubmit={handleSearch}>
            <div className="home-search__field home-search__field--city">
              <label className="home-search__label">Destino</label>
              <input
                type="text"
                placeholder="Ciudad (Bogotá, Medellín…)"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="home-search__input"
              />
            </div>

            <div className="home-search__field">
              <label className="home-search__label">Entrada</label>
              <input
                type="date"
                value={fechaInicio}
                min={todayISO()}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="home-search__input"
              />
            </div>

            <div className="home-search__field">
              <label className="home-search__label">Salida</label>
              <input
                type="date"
                value={fechaFin}
                min={fechaInicio}
                onChange={(e) => setFechaFin(e.target.value)}
                className="home-search__input"
              />
            </div>

            <button type="submit" className="btn btn--primary home-search__btn">
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="home-offers" id="ofertas">
        <div className="home-offers__inner">
          <div className="home-offers__head">
            <h2 className="home-offers__title">Ofertas</h2>
            <p className="home-offers__subtitle">Aprovecha las mejores tarifas y promociones en nuestros hoteles destacados.</p>
          </div>
          <div className="home-offers__grid">
            {hoteles.slice(0, 3).map((hotel) => (
              <article key={hotel.id_hotel} className="offer-card">
                <h3>{hotel.nombre}</h3>
                <p>{hotel.direccion ?? hotel.lugar?.nombre ?? 'Ubicación disponible'}</p>
                <p className="offer-card__detail">Reserva ahora y recibe descuentos especiales en habitación estándar.</p>
                <Link to={`/hoteles/${hotel.id_hotel}`} className="btn btn--outline">
                  Ver hotel
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-info" id="info">
        <div className="home-info__inner">
          <div className="home-info__head">
            <h2 className="home-info__title">Información de Hotel</h2>
            <p className="home-info__subtitle">Selecciona uno de los 5 hoteles para ver detalles y disponibilidad.</p>
          </div>

          {error && <p className="home-info__error">{error}</p>}
          {!loading && hoteles.length === 0 && (
            <p className="home-info__empty">No se encontraron hoteles para mostrar.</p>
          )}

          {!loading && hoteles.length > 0 && (
            <div className="home-info__grid">
              {hoteles.slice(0, 5).map((hotel) => (
                <article key={hotel.id_hotel} className="hotel-card-small">
                  <div>
                    <h3>{hotel.nombre}</h3>
                    <p>{hotel.lugar?.nombre ?? 'Ubicación no disponible'}</p>
                    <p>{hotel.direccion ?? 'Dirección no disponible'}</p>
                  </div>
                  <Link to={`/hoteles/${hotel.id_hotel}`} className="btn btn--primary hotel-card-small__btn">
                    Ver detalles
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="home-map" id="ubicacion">
        <div className="home-map__inner">
          <div className="home-map__head">
            <h2 className="home-map__title">Ubicación</h2>
            <p className="home-map__subtitle">Mapa interactivo con la ubicación de todos nuestros hoteles.</p>
          </div>
          <HotelMap hoteles={hoteles} />
        </div>
      </section>

      <section className="home-info" id="hoteles">
        <div className="home-listing__head">
          <h2 className="home-listing__title">Nuestros hoteles</h2>
          <p className="home-listing__sub">
            {loading ? 'Cargando…' : `${hoteles.length} resultado${hoteles.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {!loading && hoteles.length > 0 && (
          <div className="home-listing__table-wrapper">
            <table className="hotels-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Ubicación</th>
                  <th>Dirección</th>
                </tr>
              </thead>
              <tbody>
                {hoteles.map((h) => (
                  <tr key={h.id_hotel}>
                    <td>{h.id_hotel}</td>
                    <td>
                      <Link to={`/hoteles/${h.id_hotel}`}>{h.nombre}</Link>
                    </td>
                    <td>{h.lugar?.nombre ?? '-'}</td>
                    <td>{h.direccion ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && hoteles.length > 0 && (
          <div className="home-listing__grid">
            {hoteles.map((hotel) => (
              <HotelCard
                key={hotel.id_hotel}
                hotel={hotel}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
