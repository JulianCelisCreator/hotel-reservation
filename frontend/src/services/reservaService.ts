import client from '../api/client'

export interface TipoHabResumen {
  id_tip_hab: number
  nombre: string
  cant_pers: number
  precio: string | number
}

export interface HabitacionDisponible {
  id_hotel: number
  num_hab: number
  tipo: TipoHabResumen
}

export interface ExtraReservaIn {
  id_extra: number
  cantidad: number
}

export interface ReservaCreate {
  id_hotel: number
  num_hab: number
  fecha_inicio: string
  fecha_fin: string
  extras: ExtraReservaIn[]
  id_forma_pago: number
}

export interface Calificacion {
  id_calificacion: number
  calificacion: number
  comentario: string | null
}

export interface ReservaOut {
  id_reserva: number
  fecha_inicio: string
  fecha_fin: string
  total: string | number
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'finalizada'
  usuario: { id_usuario: number; nombre_completo: string; correo: string }
  hotel: { id_hotel: number; nombre: string }
  habitacion: {
    id_hotel: number
    num_hab: number
    tipo: TipoHabResumen | null
  }
  extras: { id_extra: number; nombre: string; precio: string | number; cantidad: number }[]
  pago: {
    id_pago: number
    fecha: string
    monto: string | number
    estado: string
    forma_pago: string | null
  } | null
  calificacion: Calificacion | null
}

export async function getDisponibilidad(
  id_hotel: number,
  fecha_inicio: string,
  fecha_fin: string,
): Promise<HabitacionDisponible[]> {
  const { data } = await client.get<HabitacionDisponible[]>('/reservas/disponibilidad', {
    params: { id_hotel, fecha_inicio, fecha_fin },
  })
  return data
}

export async function crearReserva(payload: ReservaCreate): Promise<ReservaOut> {
  const { data } = await client.post<ReservaOut>('/reservas/', payload)
  return data
}

export async function getMisReservas(): Promise<ReservaOut[]> {
  const { data } = await client.get<ReservaOut[]>('/reservas/mias')
  return data
}

export async function cancelarMiReserva(id: number): Promise<ReservaOut> {
  const { data } = await client.patch<ReservaOut>(`/reservas/${id}/cancelar`)
  return data
}

export async function calificarReserva(
  id: number,
  payload: { calificacion: number; comentario?: string },
): Promise<ReservaOut> {
  const { data } = await client.post<ReservaOut>(`/reservas/${id}/calificacion`, payload)
  return data
}
