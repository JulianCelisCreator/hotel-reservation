import type { Hotel } from '../services/hotelService'

interface Props {
  hotel: Hotel
}

export default function HotelCard({ hotel }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
        <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{hotel.nombre}</h3>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {hotel.lugar?.nombre ?? 'Ubicación no disponible'}
        </p>
        {hotel.direccion && (
          <p className="text-xs text-gray-400 mt-1 truncate">{hotel.direccion}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-indigo-600 font-semibold text-sm">Ver disponibilidad</span>
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  )
}
