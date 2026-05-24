import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  calificarReserva,
  cancelarMiReserva,
  getMisReservas,
  type ReservaOut,
} from '../services/reservaService'
import './MisReservas.css'

function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

function estadoClass(estado: string) {
  switch (estado) {
    case 'confirmada':
      return 'badge badge--green'
    case 'finalizada':
      return 'badge badge--blue'
    case 'cancelada':
      return 'badge badge--red'
    default:
      return 'badge badge--yellow'
  }
}

interface RatingModalProps {
  reservaId: number
  hotelNombre: string
  onClose: () => void
  onSaved: (r: ReservaOut) => void
}

function RatingModal({ reservaId, hotelNombre, onClose, onSaved }: RatingModalProps) {
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (stars < 1 || stars > 5) {
      setError('Selecciona entre 1 y 5 estrellas')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const r = await calificarReserva(reservaId, {
        calificacion: stars,
        comentario: comentario.trim() || undefined,
      })
      onSaved(r)
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } }
      setError(err?.response?.data?.detail ?? 'No se pudo guardar la calificación')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <p className="modal__eyebrow">CALIFICAR ESTADÍA</p>
        <h2 className="modal__title">{hotelNombre}</h2>
        <p className="modal__sub">Cuéntenos cómo fue su experiencia</p>

        <div className="stars">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hover || stars)
            return (
              <button
                key={n}
                type="button"
                className={`star ${filled ? 'star--filled' : ''}`}
                onClick={() => setStars(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} estrellas`}
              >
                <svg viewBox="0 0 24 24" width="32" height="32" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2" />
                </svg>
              </button>
            )
          })}
        </div>
        <p className="stars-label">
          {stars > 0 ? `${stars} de 5 estrellas` : 'Selecciona una calificación'}
        </p>

        <label className="modal__field">
          <span className="modal__field-label">Comentario (opcional)</span>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={4}
            placeholder="Comparta lo que más le gustó de su estadía…"
            className="modal__textarea"
          />
        </label>

        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="btn btn--outline" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={submit}
            disabled={enviando || stars === 0}
          >
            {enviando ? 'Enviando…' : 'Enviar calificación'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StaticStars({ rating }: { rating: number }) {
  return (
    <div className="static-stars" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill={n <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2" />
        </svg>
      ))}
    </div>
  )
}

export default function MisReservas() {
  const [params] = useSearchParams()
  const reciente = Number(params.get('reciente')) || null
  const [reservas, setReservas] = useState<ReservaOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelandoId, setCancelandoId] = useState<number | null>(null)
  const [calificandoReserva, setCalificandoReserva] = useState<ReservaOut | null>(null)

  useEffect(() => {
    getMisReservas()
      .then(setReservas)
      .catch(() => setError('No se pudieron cargar tus reservas'))
      .finally(() => setLoading(false))
  }, [])

  async function cancelar(id: number) {
    if (!confirm('¿Cancelar esta reserva? Esta acción no se puede deshacer.')) return
    setCancelandoId(id)
    try {
      const actualizada = await cancelarMiReserva(id)
      setReservas((prev) => prev.map((r) => (r.id_reserva === id ? actualizada : r)))
    } catch {
      alert('No se pudo cancelar la reserva')
    } finally {
      setCancelandoId(null)
    }
  }

  function onCalificada(r: ReservaOut) {
    setReservas((prev) => prev.map((x) => (x.id_reserva === r.id_reserva ? r : x)))
    setCalificandoReserva(null)
  }

  if (loading) return <div className="reservas-loading">Cargando reservas…</div>

  return (
    <main className="reservas-page">
      <section className="reservas-hero">
        <div className="reservas-hero__inner">
          <p className="reservas-hero__eyebrow">SU HISTORIAL</p>
          <h1 className="reservas-hero__title">Mis reservas</h1>
        </div>
      </section>

      <section className="reservas-body">
        {error && <p className="reservas-error">{error}</p>}
        {reciente && (
          <div className="reservas-flash">
            ✓ Reserva #{reciente} confirmada exitosamente.
          </div>
        )}

        {reservas.length === 0 ? (
          <p className="reservas-empty">Aún no tienes reservas. ¡Explora nuestros hoteles!</p>
        ) : (
          <ul className="reservas-list">
            {reservas.map((r) => (
              <li key={r.id_reserva} className="reserva-card">
                <div className="reserva-card__head">
                  <div>
                    <div className="reserva-card__title-row">
                      <h3 className="reserva-card__hotel">{r.hotel.nombre}</h3>
                      <span className={estadoClass(r.estado)}>{r.estado.toUpperCase()}</span>
                    </div>
                    <p className="reserva-card__meta">
                      Habitación {r.habitacion.num_hab} · {r.habitacion.tipo?.nombre ?? 'N/A'}
                    </p>
                    <p className="reserva-card__meta">
                      Del {r.fecha_inicio} al {r.fecha_fin}
                    </p>
                    {r.extras.length > 0 && (
                      <p className="reserva-card__extras">
                        Extras: {r.extras.map((ex) => `${ex.nombre} ×${ex.cantidad}`).join(' · ')}
                      </p>
                    )}
                    {r.pago && (
                      <p className="reserva-card__pago">
                        Pago: <strong>{r.pago.estado}</strong> · {r.pago.forma_pago ?? ''}
                      </p>
                    )}
                  </div>
                  <div className="reserva-card__price-block">
                    <p className="reserva-card__price">{formatPrice(r.total)}</p>
                  </div>
                </div>

                {r.estado === 'finalizada' && r.calificacion && (
                  <div className="reserva-card__rating">
                    <span className="reserva-card__rating-label">Su calificación:</span>
                    <StaticStars rating={r.calificacion.calificacion} />
                    {r.calificacion.comentario && (
                      <p className="reserva-card__comment">"{r.calificacion.comentario}"</p>
                    )}
                  </div>
                )}

                <div className="reserva-card__actions">
                  {r.estado === 'finalizada' && !r.calificacion && (
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => setCalificandoReserva(r)}
                    >
                      Calificar estadía
                    </button>
                  )}
                  {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
                    <button
                      type="button"
                      className="btn btn--outline btn--danger"
                      onClick={() => cancelar(r.id_reserva)}
                      disabled={cancelandoId === r.id_reserva}
                    >
                      {cancelandoId === r.id_reserva ? 'Cancelando…' : 'Cancelar reserva'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {calificandoReserva && (
        <RatingModal
          reservaId={calificandoReserva.id_reserva}
          hotelNombre={calificandoReserva.hotel.nombre}
          onClose={() => setCalificandoReserva(null)}
          onSaved={onCalificada}
        />
      )}
    </main>
  )
}
