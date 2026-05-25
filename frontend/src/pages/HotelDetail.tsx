import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BottomBar from '../components/BottomBar'
import Gallery from '../components/Gallery'
import HotelInfoBar from '../components/HotelInfoBar'
import { useAuth } from '../context/AuthContext'
import { getHotelById } from '../services/catalogoService'
import { getDisponibilidad, type HabitacionDisponible } from '../services/reservaService'
import './HotelDetail.css'

interface HotelDetalle {
  id_hotel: number
  nombre: string
  direccion: string | null
  lugar: { nombre: string; padre?: { nombre: string } | null } | null
}

function todayISO(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const idHotel = Number(id)

  const [hotel, setHotel] = useState<HotelDetalle | null>(null)
  const [loadingHotel, setLoadingHotel] = useState(true)
  const [fechaInicio, setFechaInicio] = useState(params.get('desde') ?? todayISO(7))
  const [fechaFin, setFechaFin] = useState(params.get('hasta') ?? todayISO(9))
  const [habitaciones, setHabitaciones] = useState<HabitacionDisponible[] | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!idHotel) return
    setLoadingHotel(true)
    getHotelById(idHotel)
      .then((data) => setHotel(data as HotelDetalle))
      .catch(() => setError('No se pudo cargar el hotel'))
      .finally(() => setLoadingHotel(false))
  }, [idHotel])

  useEffect(() => {
    if (idHotel && params.get('desde') && params.get('hasta')) {
      consultar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idHotel])

  async function consultar() {
    setError(null)
    setBuscando(true)
    try {
      const habs = await getDisponibilidad(idHotel, fechaInicio, fechaFin)
      setHabitaciones(habs)
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } }
      setError(err?.response?.data?.detail ?? 'Error al consultar disponibilidad')
      setHabitaciones(null)
    } finally {
      setBuscando(false)
    }
  }

  function irAReservar(numHab: number) {
    const target = `/hoteles/${idHotel}/reservar?num_hab=${numHab}&desde=${fechaInicio}&hasta=${fechaFin}`
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(target)}`)
      return
    }
    navigate(target)
  }

  if (loadingHotel) return <div className="detail-loading">Cargando hotel…</div>
  if (!hotel) return <div className="detail-loading detail-error">{error ?? 'Hotel no encontrado'}</div>

  return (
    <main className="hotel-detail">
      <HotelInfoBar
        nombre={hotel.nombre}
        direccion={hotel.direccion}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onFechaInicio={(v) => { setFechaInicio(v); setHabitaciones(null); setError(null); }}
        onFechaFin={(v) => { setFechaFin(v); setHabitaciones(null); setError(null); }}
        onConsultar={consultar}
        cargando={buscando}
      />

      <section id="galeria">
        <Gallery />
      </section>

      <section id="ubicacion" className="hotel-location">
        <div className="hotel-location__inner">
          <h2 className="hotel-location__title">Ubicación</h2>
          <p className="hotel-location__place">
            {hotel.lugar?.padre?.nombre ? `${hotel.lugar.padre.nombre} — ${hotel.lugar.nombre}` : hotel.lugar?.nombre ?? 'Ubicación no disponible'}
          </p>
          {hotel.direccion && <p className="hotel-location__address">{hotel.direccion}</p>}
        </div>
      </section>

      {error && <p className="detail-error">{error}</p>}

      {habitaciones !== null && (
        <section className="rooms" id="habitaciones">
          <div className="rooms__inner">
            <h2 className="rooms__title">
              {habitaciones.length} habitación{habitaciones.length === 1 ? '' : 'es'} disponible
              {habitaciones.length === 1 ? '' : 's'}
            </h2>
            {habitaciones.length === 0 ? (
              <p className="rooms__empty">No hay habitaciones disponibles para esas fechas.</p>
            ) : (
              <ul className="rooms__list">
                {habitaciones.map((h) => (
                  <li key={`${h.id_hotel}-${h.num_hab}`} className="room">
                    <div className="room__info">
                      <h3 className="room__name">Habitación {h.num_hab}</h3>
                      <p className="room__type">{h.tipo.nombre}</p>
                      <p className="room__capacity">
                        Capacidad: {h.tipo.cant_pers} {h.tipo.cant_pers === 1 ? 'persona' : 'personas'}
                      </p>
                    </div>
                    <div className="room__price-block">
                      <p className="room__price">{formatPrice(h.tipo.precio)}</p>
                      <p className="room__price-label">por noche</p>
                    </div>
                    <button onClick={() => irAReservar(h.num_hab)} className="btn btn--primary">
                      Reservar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <BottomBar />
    </main>
  )
}
