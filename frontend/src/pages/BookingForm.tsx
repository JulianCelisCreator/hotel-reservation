import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getExtras, getFormasPago, getHotelById, type Extra, type FormaPago } from '../services/catalogoService'
import { crearReserva, getDisponibilidad, type HabitacionDisponible } from '../services/reservaService'
import './BookingForm.css'

function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

interface ExtraSeleccionado {
  id_extra: number
  cantidad: number
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatDateLong(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} de ${MONTHS[m - 1]} de ${y}`
}

export default function BookingForm() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const idHotel = Number(id)
  const numHab = Number(params.get('num_hab'))
  const desde = params.get('desde') ?? ''
  const hasta = params.get('hasta') ?? ''

  const [hotelNombre, setHotelNombre] = useState<string>('')
  const [habitacion, setHabitacion] = useState<HabitacionDisponible | null>(null)
  const [extras, setExtras] = useState<Extra[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [seleccionados, setSeleccionados] = useState<Record<number, number>>({})
  const [idFormaPago, setIdFormaPago] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([getHotelById(idHotel), getDisponibilidad(idHotel, desde, hasta), getExtras(), getFormasPago()])
      .then(([hotel, habs, ex, fp]) => {
        setHotelNombre((hotel as { nombre: string }).nombre)
        const hab = habs.find((h) => h.num_hab === numHab) ?? null
        setHabitacion(hab)
        setExtras(ex)
        setFormasPago(fp)
        if (fp.length > 0) setIdFormaPago(fp[0].id_forma_pago)
      })
      .catch(() => setError('No se pudieron cargar los datos'))
      .finally(() => setLoading(false))
  }, [idHotel, numHab, desde, hasta])

  const noches = useMemo(() => {
    if (!desde || !hasta) return 0
    const d1 = new Date(desde)
    const d2 = new Date(hasta)
    return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
  }, [desde, hasta])

  const subtotalHabitacion = useMemo(() => {
    if (!habitacion) return 0
    return parseFloat(String(habitacion.tipo.precio)) * noches
  }, [habitacion, noches])

  const subtotalExtras = useMemo(() => {
    let t = 0
    for (const ex of extras) {
      const cant = seleccionados[ex.id_extra] ?? 0
      if (cant > 0) t += parseFloat(String(ex.precio)) * cant
    }
    return t
  }, [extras, seleccionados])

  const total = subtotalHabitacion + subtotalExtras

  function toggleExtra(id: number) {
    setSeleccionados((prev) => {
      const next = { ...prev }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = 1
      }
      return next
    })
  }

  function setCantidad(id: number, cantidad: number) {
    if (cantidad < 1) return
    setSeleccionados((prev) => ({ ...prev, [id]: cantidad }))
  }

  async function confirmar() {
    if (!habitacion || !idFormaPago) return
    setError(null)
    setEnviando(true)
    try {
      const extrasPayload: ExtraSeleccionado[] = Object.entries(seleccionados).map(([id, cantidad]) => ({
        id_extra: Number(id),
        cantidad,
      }))
      const reserva = await crearReserva({
        id_hotel: idHotel,
        num_hab: numHab,
        fecha_inicio: desde,
        fecha_fin: hasta,
        extras: extrasPayload,
        id_forma_pago: idFormaPago,
      })
      navigate(`/mis-reservas?reciente=${reserva.id_reserva}`)
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } }
      setError(err?.response?.data?.detail ?? 'Error al crear la reserva')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return <div className="booking-loading">Preparando su reserva…</div>
  }

  if (!habitacion) {
    return (
      <div className="booking-loading booking-loading--error">
        <p>{error ?? 'No se encontró la habitación seleccionada.'}</p>
        <Link to={`/hoteles/${idHotel}`} className="booking-back-link">
          ← Volver al hotel
        </Link>
      </div>
    )
  }

  const extrasSeleccionados = extras.filter((ex) => seleccionados[ex.id_extra])

  return (
    <main className="booking">
      <section className="booking-hero">
        <div className="booking-hero__inner">
          <Link to={`/hoteles/${idHotel}`} className="booking-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver al hotel
          </Link>
          <p className="booking-hero__eyebrow">RESERVA</p>
          <h1 className="booking-hero__title">{hotelNombre}</h1>
          <p className="booking-hero__sub">
            Habitación {habitacion.num_hab} · {habitacion.tipo.nombre} · {noches} {noches === 1 ? 'noche' : 'noches'}
          </p>
        </div>
      </section>

      <section className="booking-body">
        <div className="booking-grid">
          {/* Columna izquierda — formularios */}
          <div className="booking-main">
            {/* Estadía */}
            <article className="booking-card">
              <header className="booking-card__head">
                <span className="booking-card__step">01</span>
                <h2 className="booking-card__title">Su estadía</h2>
              </header>
              <div className="booking-stay">
                <div className="booking-stay__col">
                  <span className="booking-stay__label">Check-in</span>
                  <span className="booking-stay__date">{formatDateLong(desde)}</span>
                </div>
                <div className="booking-stay__arrow" aria-hidden="true">→</div>
                <div className="booking-stay__col">
                  <span className="booking-stay__label">Check-out</span>
                  <span className="booking-stay__date">{formatDateLong(hasta)}</span>
                </div>
                <div className="booking-stay__col booking-stay__col--end">
                  <span className="booking-stay__label">Noches</span>
                  <span className="booking-stay__date booking-stay__date--accent">{noches}</span>
                </div>
              </div>
              <div className="booking-room">
                <div>
                  <p className="booking-room__type">{habitacion.tipo.nombre}</p>
                  <p className="booking-room__cap">
                    Habitación {habitacion.num_hab} · Capacidad {habitacion.tipo.cant_pers}{' '}
                    {habitacion.tipo.cant_pers === 1 ? 'persona' : 'personas'}
                  </p>
                </div>
                <div className="booking-room__price">
                  <span className="booking-room__price-value">{formatPrice(habitacion.tipo.precio)}</span>
                  <span className="booking-room__price-label">por noche</span>
                </div>
              </div>
            </article>

            {/* Extras */}
            <article className="booking-card">
              <header className="booking-card__head">
                <span className="booking-card__step">02</span>
                <h2 className="booking-card__title">Servicios adicionales</h2>
              </header>
              {extras.length === 0 ? (
                <p className="booking-empty">No hay servicios disponibles.</p>
              ) : (
                <ul className="extras-list">
                  {extras.map((ex) => {
                    const checked = !!seleccionados[ex.id_extra]
                    const cantidad = seleccionados[ex.id_extra] ?? 0
                    return (
                      <li
                        key={ex.id_extra}
                        className={`extra ${checked ? 'extra--checked' : ''}`}
                      >
                        <label className="extra__main">
                          <span className="extra__checkbox" aria-hidden="true">
                            {checked && (
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="5 12 10 17 19 7" />
                              </svg>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleExtra(ex.id_extra)}
                            className="extra__input"
                          />
                          <div className="extra__text">
                            <span className="extra__name">{ex.nombre}</span>
                            <span className="extra__price">{formatPrice(ex.precio)}</span>
                          </div>
                        </label>
                        {checked && (
                          <div className="extra__qty">
                            <button
                              type="button"
                              onClick={() => setCantidad(ex.id_extra, Math.max(1, cantidad - 1))}
                              aria-label="Disminuir"
                            >
                              −
                            </button>
                            <span>{cantidad}</span>
                            <button
                              type="button"
                              onClick={() => setCantidad(ex.id_extra, cantidad + 1)}
                              aria-label="Aumentar"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </article>

            {/* Pago */}
            <article className="booking-card">
              <header className="booking-card__head">
                <span className="booking-card__step">03</span>
                <h2 className="booking-card__title">Forma de pago</h2>
              </header>
              <div className="payment-grid">
                {formasPago.map((fp) => {
                  const active = idFormaPago === fp.id_forma_pago
                  return (
                    <button
                      key={fp.id_forma_pago}
                      type="button"
                      onClick={() => setIdFormaPago(fp.id_forma_pago)}
                      className={`payment ${active ? 'payment--active' : ''}`}
                    >
                      <span className="payment__icon" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="2" y="6" width="20" height="14" rx="2" />
                          <line x1="2" y1="11" x2="22" y2="11" />
                        </svg>
                      </span>
                      <span className="payment__name">{fp.nombre}</span>
                      {active && <span className="payment__check">✓</span>}
                    </button>
                  )
                })}
              </div>
              <p className="payment-note">
                Esta es una transacción simulada — no se realizará un cobro real.
              </p>
            </article>
          </div>

          {/* Columna derecha — resumen sticky */}
          <aside className="booking-summary">
            <div className="booking-summary__card">
              <h3 className="booking-summary__title">Resumen</h3>

              <div className="booking-summary__row">
                <div>
                  <p className="booking-summary__label">Habitación</p>
                  <p className="booking-summary__sub">
                    {formatPrice(habitacion.tipo.precio)} × {noches}{' '}
                    {noches === 1 ? 'noche' : 'noches'}
                  </p>
                </div>
                <span className="booking-summary__value">{formatPrice(subtotalHabitacion)}</span>
              </div>

              {extrasSeleccionados.length > 0 && (
                <>
                  <div className="booking-summary__divider" />
                  {extrasSeleccionados.map((ex) => {
                    const cant = seleccionados[ex.id_extra]
                    return (
                      <div key={ex.id_extra} className="booking-summary__row booking-summary__row--small">
                        <div>
                          <p className="booking-summary__label-small">{ex.nombre}</p>
                          <p className="booking-summary__sub">
                            {formatPrice(ex.precio)} × {cant}
                          </p>
                        </div>
                        <span className="booking-summary__value-small">
                          {formatPrice(parseFloat(String(ex.precio)) * cant)}
                        </span>
                      </div>
                    )
                  })}
                </>
              )}

              <div className="booking-summary__divider" />

              <div className="booking-summary__total">
                <span>Total</span>
                <span className="booking-summary__total-value">{formatPrice(total)}</span>
              </div>

              {error && <p className="booking-error">{error}</p>}

              <button
                type="button"
                onClick={confirmar}
                disabled={enviando || noches === 0 || !idFormaPago}
                className="btn btn--primary booking-confirm"
              >
                {enviando ? 'Procesando…' : 'Confirmar y pagar'}
              </button>

              <p className="booking-summary__fineprint">
                Al confirmar acepta las condiciones de reserva y políticas del hotel.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
