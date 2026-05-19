import client from '../api/client'
import type { ReservaOut } from './reservaService'

export interface ReservaFiltros {
  id_hotel?: number
  fecha_desde?: string
  fecha_hasta?: string
  estado?: string
}

export interface ReservaUpdate {
  fecha_inicio?: string
  fecha_fin?: string
  estado?: string
  num_hab?: number
}

export async function getReservas(filtros: ReservaFiltros = {}): Promise<ReservaOut[]> {
  const params: Record<string, string | number> = {}
  if (filtros.id_hotel) params.id_hotel = filtros.id_hotel
  if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde
  if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta
  if (filtros.estado) params.estado = filtros.estado
  const { data } = await client.get<ReservaOut[]>('/admin/reservas', { params })
  return data
}

export async function getReserva(id: number): Promise<ReservaOut> {
  const { data } = await client.get<ReservaOut>(`/admin/reservas/${id}`)
  return data
}

export async function actualizarReserva(id: number, payload: ReservaUpdate): Promise<ReservaOut> {
  const { data } = await client.put<ReservaOut>(`/admin/reservas/${id}`, payload)
  return data
}

export async function cancelarReservaAdmin(id: number): Promise<ReservaOut> {
  const { data } = await client.patch<ReservaOut>(`/admin/reservas/${id}/cancelar`)
  return data
}
