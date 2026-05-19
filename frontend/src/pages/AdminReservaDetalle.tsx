import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { actualizarReserva, getReserva } from '../services/adminService'
import type { ReservaOut } from '../services/reservaService'

function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

export default function AdminReservaDetalle() {
  const { id } = useParams<{ id: string }>()
  const idReserva = Number(id)
  const navigate = useNavigate()

  const [reserva, setReserva] = useState<ReservaOut | null>(null)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [numHab, setNumHab] = useState<number>(0)
  const [estado, setEstado] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    getReserva(idReserva)
      .then((r) => {
        setReserva(r)
        setFechaInicio(r.fecha_inicio)
        setFechaFin(r.fecha_fin)
        setNumHab(r.habitacion.num_hab)
        setEstado(r.estado)
      })
      .catch(() => setError('No se pudo cargar la reserva'))
      .finally(() => setLoading(false))
  }, [idReserva])

  async function guardar() {
    setError(null)
    setGuardando(true)
    try {
      const r = await actualizarReserva(idReserva, {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        num_hab: numHab,
        estado,
      })
      setReserva(r)
      alert('Reserva actualizada')
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } }
      setError(err?.response?.data?.detail ?? 'Error al actualizar')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando...</div>
  if (!reserva) return <div className="p-8 text-center text-red-600">{error ?? 'No encontrada'}</div>

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/admin/reservas" className="text-sm text-indigo-600 hover:underline">← Volver al listado</Link>
        <h1 className="text-3xl font-bold mt-2 text-gray-900">Reserva #{reserva.id_reserva}</h1>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Información</h2>
          <p><strong>Hotel:</strong> {reserva.hotel.nombre}</p>
          <p><strong>Cliente:</strong> {reserva.usuario.nombre_completo} ({reserva.usuario.correo})</p>
          <p><strong>Total:</strong> {formatPrice(reserva.total)}</p>
          <p className="text-sm text-gray-500 mt-2">
            Extras: {reserva.extras.length === 0 ? 'ninguno' : reserva.extras.map((ex) => `${ex.nombre} ×${ex.cantidad}`).join(', ')}
          </p>
          {reserva.pago && (
            <p className="text-sm text-gray-500">
              Pago: {reserva.pago.estado} — {reserva.pago.forma_pago ?? ''} ({formatPrice(reserva.pago.monto)})
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Editar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-gray-700">Check-in</span>
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="text-gray-700">Check-out</span>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="text-gray-700">N° de habitación</span>
              <input type="number" value={numHab} onChange={(e) => setNumHab(Number(e.target.value))} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="text-gray-700">Estado</span>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </label>
          </div>

          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

          <div className="mt-5 flex gap-3">
            <button onClick={guardar} disabled={guardando} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2 disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button onClick={() => navigate('/admin/reservas')} className="bg-gray-200 hover:bg-gray-300 rounded-lg px-5 py-2">
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
