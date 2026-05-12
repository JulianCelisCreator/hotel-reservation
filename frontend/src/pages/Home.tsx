import { useEffect, useState } from 'react'
import HotelCard from '../components/HotelCard'
import SearchBar from '../components/SearchBar'
import type { Hotel } from '../services/hotelService'
import { getHoteles, buscarHoteles } from '../services/hotelService'

export default function Home() {
  const [hoteles, setHoteles] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getHoteles()
      .then(setHoteles)
      .catch(() => setError('No se pudieron cargar los hoteles'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSearch(ciudad: string) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Encuentra tu hotel perfecto
          </h1>
          <p className="text-indigo-200 text-xl mb-12">
            Las mejores tarifas en miles de destinos alrededor del mundo
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Hotel grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Hoteles disponibles</h2>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-1/3 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-gray-500">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && hoteles.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p>No se encontraron hoteles para tu búsqueda.</p>
          </div>
        )}

        {!loading && !error && hoteles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hoteles.map((hotel) => (
              <HotelCard key={hotel.id_hotel} hotel={hotel} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
