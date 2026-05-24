import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearReservaAdmin, getClientes, type UsuarioAdmin } from '../services/adminService'
import { getExtras, getFormasPago, type Extra, type FormaPago } from '../services/catalogoService'
import { getHoteles, type Hotel } from '../services/hotelService'
import { getDisponibilidad, type HabitacionDisponible } from '../services/reservaService'
import './AdminNuevaReserva.css'

function todayISO(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

export default function AdminNuevaReserva() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<UsuarioAdmin[]>([])
  const [hoteles, setHoteles] = useState<Hotel[]>([])
  const [extras, setExtras] = useState<Extra[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [habitaciones, setHabitaciones] = useState<HabitacionDisponible[]>([])

  const [idUsuario, setIdUsuario] = useState<number | ''>('')
  const [idHotel, setIdHotel] = useState<number | ''>('')
  const [fechaInicio, setFechaInicio] = useState(todayISO(7))
  const [fechaFin, setFechaFin] = useState(todayISO(9))
  const [numHab, setNumHab] = useState<number | ''>('')
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<Record<number, number>>({})
  const [idFormaPago, setIdFormaPago] = useState<number | ''>('')
  const [buscandoHab, setBuscandoHab] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getClientes(), getHoteles(), getExtras(), getFormasPago()])
      .then(([cl, ht, ex, fp]) => {
        setClientes(cl)
        setHoteles(ht)
        setExtras(ex)
        setFormasPago(fp)
        if (fp.length > 0) setIdFormaPago(fp[0].id_forma_pago)
      })
      .catch(() => setError('No se pudieron cargar los datos iniciales'))
  }, [])

  async function buscarHabitaciones() {
    if (!idHotel || !fechaInicio || !fechaFin) return
    setBuscandoHab(true)
    setError(null)
    setNumHab('')
    try {
      const habs = await getDisponibilidad(Number(idHotel), fechaInicio, fechaFin)
      setHabitaciones(habs)
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } }
      setError(err?.response?.data?.detail ?? 'Error al buscar habitaciones')
      setHabitaciones([])
    } finally {
      setBuscandoHab(false)
    }
  }

  const habitacionElegida = useMemo(
    () => habitaciones.find((h) => h.num_hab === Number(numHab)),
    [habitaciones, numHab],
  )

  const noches = useMemo(() => {
    if (!fechaInicio || !fechaFin) return 0
    return Math.max(
      0,
      Math.round((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 86400000),
    )
  }, [fechaInicio, fechaFin])

  const subtotalHabitacion = habitacionElegida
    ? parseFloat(String(habitacionElegida.tipo.precio)) * noches
    : 0

  const subtotalExtras = useMemo(() => {
    let t = 0
    for (const ex of extras) {
      const cant = extrasSeleccionados[ex.id_extra] ?? 0
      if (cant > 0) t += parseFloat(String(ex.precio)) * cant
    }
    return t
  }, [extras, extrasSeleccionados])

  const total = subtotalHabitacion + subtotalExtras

  function toggleExtra(id: number) {
    setExtrasSeleccionados((prev) => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = 1
      return next
    })
  }

  async function crear() {
    if (!idUsuario || !idHotel || !numHab || !idFormaPago) {
      setError('Completa todos los campos requeridos')
      return
    }
    setError(null)
    setEnviando(true)
    try {
      const r = await crearReservaAdmin({
        id_usuario: Number(idUsuario),
        id_hotel: Number(idHotel),
        num_hab: Number(numHab),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        extras: Object.entries(extrasSeleccionados).map(([id, cantidad]) => ({
          id_extra: Number(id),
          cantidad,
        })),
        id_forma_pago: Number(idFormaPago),
      })
      navigate(`/admin/reservas/${r.id_reserva}`)
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } }
      setError(err?.response?.data?.detail ?? 'Error al crear la reserva')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="admin-page admin-new">
      <header className="admin-page__head">
        <div>
          <p className="admin-page__eyebrow">CREAR RESERVA</p>
          <h1 className="admin-page__title">Nueva reserva</h1>
          <p className="admin-page__sub">Registra una reserva en nombre de un cliente.</p>
        </div>
      </header>

      <div className="admin-new__grid">
        <div className="admin-new__form">
          <section className="admin-new__card">
            <header className="admin-new__step">
              <span className="step__num">01</span>
              <h2>Cliente</h2>
            </header>
            <label className="field">
              <span>Selecciona cliente</span>
              <select value={idUsuario} onChange={(e) => setIdUsuario(e.target.value ? Number(e.target.value) : '')}>
                <option value="">— Elige un cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id_usuario} value={c.id_usuario}>
                    {c.nombre_completo} ({c.correo})
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="admin-new__card">
            <header className="admin-new__step">
              <span className="step__num">02</span>
              <h2>Hotel y fechas</h2>
            </header>
            <div className="field-row">
              <label className="field">
                <span>Hotel</span>
                <select
                  value={idHotel}
                  onChange={(e) => {
                    setIdHotel(e.target.value ? Number(e.target.value) : '')
                    setHabitaciones([])
                    setNumHab('')
                  }}
                >
                  <option value="">— Elige un hotel —</option>
                  {hoteles.map((h) => (
                    <option key={h.id_hotel} value={h.id_hotel}>
                      {h.nombre} {h.lugar?.nombre ? `(${h.lugar.nombre})` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Check-in</span>
                <input
                  type="date"
                  value={fechaInicio}
                  min={todayISO()}
                  onChange={(e) => {
                    setFechaInicio(e.target.value)
                    setHabitaciones([])
                    setNumHab('')
                  }}
                />
              </label>
              <label className="field">
                <span>Check-out</span>
                <input
                  type="date"
                  value={fechaFin}
                  min={fechaInicio}
                  onChange={(e) => {
                    setFechaFin(e.target.value)
                    setHabitaciones([])
                    setNumHab('')
                  }}
                />
              </label>
              <button
                type="button"
                onClick={buscarHabitaciones}
                disabled={!idHotel || buscandoHab}
                className="btn btn--primary"
                style={{ alignSelf: 'flex-end' }}
              >
                {buscandoHab ? 'Buscando…' : 'Buscar disponibilidad'}
              </button>
            </div>
          </section>

          {habitaciones.length > 0 && (
            <section className="admin-new__card">
              <header className="admin-new__step">
                <span className="step__num">03</span>
                <h2>Habitación</h2>
              </header>
              <ul className="rooms-pick">
                {habitaciones.map((h) => (
                  <li
                    key={h.num_hab}
                    className={`room-pick ${numHab === h.num_hab ? 'room-pick--active' : ''}`}
                    onClick={() => setNumHab(h.num_hab)}
                  >
                    <div>
                      <strong>Habitación {h.num_hab}</strong>
                      <p>{h.tipo.nombre} · {h.tipo.cant_pers} {h.tipo.cant_pers === 1 ? 'persona' : 'personas'}</p>
                    </div>
                    <span className="room-pick__price">{formatPrice(h.tipo.precio)}/noche</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="admin-new__card">
            <header className="admin-new__step">
              <span className="step__num">04</span>
              <h2>Extras y pago</h2>
            </header>
            <p className="field-label">Extras</p>
            <ul className="extras-pick">
              {extras.map((ex) => {
                const checked = !!extrasSeleccionados[ex.id_extra]
                const cant = extrasSeleccionados[ex.id_extra] ?? 0
                return (
                  <li key={ex.id_extra} className={`extra-pick ${checked ? 'extra-pick--checked' : ''}`}>
                    <label>
                      <input type="checkbox" checked={checked} onChange={() => toggleExtra(ex.id_extra)} />
                      <span className="extra-pick__name">{ex.nombre}</span>
                      <span className="extra-pick__price">{formatPrice(ex.precio)}</span>
                    </label>
                    {checked && (
                      <div className="extra-pick__qty">
                        <button type="button" onClick={() => setExtrasSeleccionados((p) => ({ ...p, [ex.id_extra]: Math.max(1, cant - 1) }))}>−</button>
                        <span>{cant}</span>
                        <button type="button" onClick={() => setExtrasSeleccionados((p) => ({ ...p, [ex.id_extra]: cant + 1 }))}>+</button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            <label className="field" style={{ marginTop: 'var(--space-4)' }}>
              <span>Forma de pago</span>
              <select value={idFormaPago} onChange={(e) => setIdFormaPago(Number(e.target.value))}>
                {formasPago.map((fp) => (
                  <option key={fp.id_forma_pago} value={fp.id_forma_pago}>
                    {fp.nombre}
                  </option>
                ))}
              </select>
            </label>
          </section>
        </div>

        <aside className="admin-new__summary">
          <div className="admin-new__summary-card">
            <h3>Resumen</h3>
            <div className="sum-row">
              <span>Habitación</span>
              <span>{formatPrice(subtotalHabitacion)}</span>
            </div>
            <div className="sum-row sum-row--sub">
              <span>{noches} {noches === 1 ? 'noche' : 'noches'}</span>
            </div>
            <div className="sum-row">
              <span>Extras</span>
              <span>{formatPrice(subtotalExtras)}</span>
            </div>
            <div className="sum-divider" />
            <div className="sum-total">
              <span>Total</span>
              <span className="sum-total__value">{formatPrice(total)}</span>
            </div>

            {error && <p className="sum-error">{error}</p>}

            <button
              type="button"
              className="btn btn--primary"
              style={{ width: '100%', padding: 'var(--space-3)' }}
              onClick={crear}
              disabled={enviando || !idUsuario || !numHab || noches === 0}
            >
              {enviando ? 'Creando…' : 'Crear reserva'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
