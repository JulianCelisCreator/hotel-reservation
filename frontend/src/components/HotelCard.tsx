import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Hotel } from '../services/hotelService'
import './HotelCard.css'

interface Props {
  hotel: Hotel
  fechaInicio?: string
  fechaFin?: string
}

const HOTEL_IMAGES: Record<number, string[]> = {
  1: [
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80',
  ],
  2: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80',
  ],
  3: [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&q=80',
    'https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&q=80',
  ],
  4: [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80',
  ],
  5: [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&q=80',
  ],
}

const FALLBACK = ['https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&q=80']

export default function HotelCard({ hotel, fechaInicio, fechaFin }: Props) {
  const imgs = HOTEL_IMAGES[hotel.id_hotel] ?? FALLBACK
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || imgs.length <= 1) return
    const interval = setInterval(() => setIdx((i) => (i + 1) % imgs.length), 3800)
    return () => clearInterval(interval)
  }, [paused, imgs.length])

  function prev(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIdx((i) => (i - 1 + imgs.length) % imgs.length)
  }

  function next(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIdx((i) => (i + 1) % imgs.length)
  }

  function goTo(i: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIdx(i)
  }

  const queryString = fechaInicio && fechaFin ? `?desde=${fechaInicio}&hasta=${fechaFin}` : ''

  return (
    <Link
      to={`/hoteles/${hotel.id_hotel}${queryString}`}
      className="hotel-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hotel-card__slider">
        {imgs.map((src, i) => (
          <div
            key={src}
            className={`hotel-card__slide ${i === idx ? 'hotel-card__slide--active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden={i !== idx}
          />
        ))}

        {imgs.length > 1 && (
          <>
            <button
              type="button"
              className="hotel-card__arrow hotel-card__arrow--prev"
              onClick={prev}
              aria-label="Imagen anterior"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="hotel-card__arrow hotel-card__arrow--next"
              onClick={next}
              aria-label="Siguiente imagen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <div className="hotel-card__dots">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => goTo(i, e)}
                  className={`hotel-card__dot ${i === idx ? 'hotel-card__dot--active' : ''}`}
                  aria-label={`Imagen ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="hotel-card__body">
        <h3 className="hotel-card__name">{hotel.nombre}</h3>
        <p className="hotel-card__location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {hotel.lugar?.nombre ?? 'Ubicación no disponible'}
        </p>
        {hotel.direccion && <p className="hotel-card__address">{hotel.direccion}</p>}
        <div className="hotel-card__footer">
          <span className="hotel-card__cta">Ver detalles →</span>
        </div>
      </div>
    </Link>
  )
}
