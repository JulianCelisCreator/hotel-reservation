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
    '/images/hotels/tequendama/foto1.jpg',
    '/images/hotels/tequendama/foto2.jpg',
    '/images/hotels/tequendama/foto3.jpg',
    '/images/hotels/tequendama/foto4.jpg',
    '/images/hotels/tequendama/foto5.jpg',
  ],
  2: [
    '/images/hotels/dann-carlton/foto1.jpg',
    '/images/hotels/dann-carlton/foto2.jpg',
    '/images/hotels/dann-carlton/foto3.jpg',
    '/images/hotels/dann-carlton/foto4.jpg',
    '/images/hotels/dann-carlton/foto5.jpg',
  ],
  3: [
    '/images/hotels/intercontinental/foto1.jpg',
    '/images/hotels/intercontinental/foto2.avif',
    '/images/hotels/intercontinental/foto3.avif',
    '/images/hotels/intercontinental/foto4.avif',
    '/images/hotels/intercontinental/foto5.webp',
  ],
  4: [
    '/images/hotels/santa-clara/foto1.jpg',
    '/images/hotels/santa-clara/foto2.jpg',
    '/images/hotels/santa-clara/foto3.jpg',
    '/images/hotels/santa-clara/foto4.jpg',
    '/images/hotels/santa-clara/foto5.avif',
  ],
  5: [
    '/images/hotels/chicamocha/foto1.jpg',
    '/images/hotels/chicamocha/foto2.webp',
    '/images/hotels/chicamocha/foto3.avif',
    '/images/hotels/chicamocha/foto4.jpg',
    '/images/hotels/chicamocha/foto5.jpg',
  ],
}

const FALLBACK = ['https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&q=80']

const HOTEL_CITIES: Record<number, string> = {
  1: 'Bogotá D.C.',
  2: 'Medellín',
  3: 'Cali',
  4: 'Cartagena de Indias',
  5: 'Bucaramanga',
}

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
        {hotel.direccion && (
          <p className="hotel-card__address">
            {hotel.direccion}
            {HOTEL_CITIES[hotel.id_hotel] && (
              <span className="hotel-card__city"> · {HOTEL_CITIES[hotel.id_hotel]}</span>
            )}
          </p>
        )}
        <div className="hotel-card__footer">
          <span className="hotel-card__cta">Ver detalles →</span>
        </div>
      </div>
    </Link>
  )
}
