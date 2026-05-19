import { useEffect, useState } from 'react'
import HotelCard from '../components/HotelCard'
import type { Hotel } from '../services/hotelService'
import { buscarHoteles, getHoteles } from '../services/hotelService'
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

      <section className="home-listing" id="hoteles">
        <div className="home-listing__head">
          <h2 className="home-listing__title">Nuestros hoteles</h2>
          <p className="home-listing__sub">
            {loading ? 'Cargando…' : `${hoteles.length} resultado${hoteles.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {error && <p className="home-listing__error">{error}</p>}

        {!loading && !error && hoteles.length === 0 && (
          <p className="home-listing__empty">No se encontraron hoteles para tu búsqueda.</p>
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
