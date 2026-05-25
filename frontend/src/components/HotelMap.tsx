import { useEffect, useRef, useState } from 'react'
import type { Hotel } from '../services/hotelService'
import './HotelMap.css'

interface Props {
  hoteles: Hotel[]
}

type LoadStatus = 'loading' | 'ready' | 'error' | 'missing-key'

function loadGoogleMapsScript(apiKey: string) {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps) {
      resolve()
      return
    }

    const existing = document.getElementById('google-maps-script') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Google Maps script load failed')))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Maps script load failed'))
    document.body.appendChild(script)
  })
}

export default function HotelMap({ hoteles }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [message, setMessage] = useState('Cargando mapa...')

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setStatus('missing-key')
      setMessage('Falta la clave de Google Maps en VITE_GOOGLE_MAPS_API_KEY.')
      return
    }

    if (!hoteles.length) {
      setStatus('error')
      setMessage('No hay hoteles para mostrar en el mapa.')
      return
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        const google = (window as any).google
        if (!google?.maps) {
          throw new Error('Google Maps no se pudo inicializar')
        }

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 4.710989, lng: -74.072090 },
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
        })

        const geocoder = new google.maps.Geocoder()
        const bounds = new google.maps.LatLngBounds()
        let found = 0

        hoteles.forEach((hotel) => {
          const query = hotel.direccion
            ? `${hotel.nombre}, ${hotel.direccion}, ${hotel.lugar?.nombre ?? ''}`
            : `${hotel.nombre}, ${hotel.lugar?.nombre ?? ''}`

          geocoder.geocode({ address: query }, (results: any, status: string) => {
            if (status === 'OK' && results?.[0]?.geometry?.location) {
              const location = results[0].geometry.location
              new google.maps.Marker({
                position: location,
                map,
                title: hotel.nombre,
              })
              bounds.extend(location)
              found += 1
              if (found === 1) {
                map.setCenter(location)
              }
              if (hoteles.length === found) {
                map.fitBounds(bounds)
              }
            }
          })
        })

        setStatus('ready')
      })
      .catch(() => {
        setStatus('error')
        setMessage('No se pudo cargar el mapa de Google Maps. Verifica la llave y la conexión.')
      })
  }, [hoteles])

  return (
    <div className="hotel-map">
      {status === 'loading' && <div className="hotel-map__loading">{message}</div>}
      {status === 'error' && <div className="hotel-map__error">{message}</div>}
      {status === 'missing-key' && <div className="hotel-map__error">{message}</div>}
      <div className="hotel-map__frame" ref={mapRef} />
    </div>
  )
}
