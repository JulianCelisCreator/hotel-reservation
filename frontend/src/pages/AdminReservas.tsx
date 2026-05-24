import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelarReservaAdmin, getReservas, type ReservaFiltros } from '../services/adminService'
import { getHoteles, type Hotel } from '../services/hotelService'
import type { ReservaOut } from '../services/reservaService'

function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

function estadoColor(estado: string) {
  if (estado === 'confirmada') return 'bg-green-100 text-green-700'
  if (estado === 'finalizada') return 'bg-blue-100 text-blue-700'
  if (estado === 'cancelada') return 'bg-red-100 text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState<ReservaOut[]>([])
  const [hoteles, setHoteles] = useState<Hotel[]>([])
  const [filtros, setFiltros] = useState<ReservaFiltros>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function recargar(f: ReservaFiltros = filtros) {
    setLoading(true)
    setError(null)
    try {
      const data = await getReservas(f)
      setReservas(data)
    } catch {
      setError('No se pudieron cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getHoteles().then(setHoteles).catch(() => {})
    recargar({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function aplicarFiltros() {
    recargar(filtros)
  }

  function limpiar() {
    setFiltros({})
    recargar({})
  }

  async function cancelar(id: number) {
    if (!confirm('¿Cancelar reserva #' + id + '?')) return
    try {
      const actualizada = await cancelarReservaAdmin(id)
      setReservas((prev) => prev.map((r) => (r.id_reserva === id ? actualizada : r)))
    } catch {
      alert('Error al cancelar')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Administración de reservas</h1>

        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="text-sm">
              <span className="text-gray-700">Hotel</span>
              <select
                value={filtros.id_hotel ?? ''}
                onChange={(e) => setFiltros({ ...filtros, id_hotel: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1 w-full border rounded-lg px-2 py-2"
              >
                <option value="">Todos</option>
                {hoteles.map((h) => (
                  <option key={h.id_hotel} value={h.id_hotel}>{h.nombre}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-gray-700">Desde</span>
              <input
                type="date"
                value={filtros.fecha_desde ?? ''}
                onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value || undefined })}
                className="mt-1 w-full border rounded-lg px-2 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-700">Hasta</span>
              <input
                type="date"
                value={filtros.fecha_hasta ?? ''}
                onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value || undefined })}
                className="mt-1 w-full border rounded-lg px-2 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-700">Estado</span>
              <select
                value={filtros.estado ?? ''}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value || undefined })}
                className="mt-1 w-full border rounded-lg px-2 py-2"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </label>
            <div className="flex items-end gap-2">
              <button onClick={aplicarFiltros} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2">
                Aplicar
              </button>
              <button onClick={limpiar} className="bg-gray-200 hover:bg-gray-300 rounded-lg px-4 py-2">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {loading ? (
          <p className="text-center py-8">Cargando...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Hotel</th>
                  <th className="text-left p-3">Hab.</th>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Check-in</th>
                  <th className="text-left p-3">Check-out</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-center p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-gray-500 p-6">No hay reservas</td></tr>
                )}
                {reservas.map((r) => (
                  <tr key={r.id_reserva} className="border-t">
                    <td className="p-3 font-mono">{r.id_reserva}</td>
                    <td className="p-3">{r.hotel.nombre}</td>
                    <td className="p-3">{r.habitacion.num_hab}</td>
                    <td className="p-3">
                      <div>{r.usuario.nombre_completo}</div>
                      <div className="text-xs text-gray-500">{r.usuario.correo}</div>
                    </td>
                    <td className="p-3">{r.fecha_inicio}</td>
                    <td className="p-3">{r.fecha_fin}</td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${estadoColor(r.estado)}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="p-3 text-right">{formatPrice(r.total)}</td>
                    <td className="p-3 text-center">
                      <Link to={`/admin/reservas/${r.id_reserva}`} className="text-indigo-600 hover:underline mr-3">
                        Editar
                      </Link>
                      {r.estado !== 'cancelada' && (
                        <button onClick={() => cancelar(r.id_reserva)} className="text-red-600 hover:underline">
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
