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

export interface AdminStats {
  total: number
  pendiente: number
  confirmada: number
  finalizada: number
  cancelada: number
}

export async function getStats(): Promise<AdminStats> {
  const { data } = await client.get<AdminStats>('/admin/stats')
  return data
}

export interface UsuarioAdmin {
  id_usuario: number
  nombre_completo: string
  correo: string
  usuario: string
  fecha_registro: string
  num_reservas: number
}

export async function getClientes(): Promise<UsuarioAdmin[]> {
  const { data } = await client.get<UsuarioAdmin[]>('/admin/usuarios')
  return data
}

export async function getReservasCliente(idUsuario: number): Promise<ReservaOut[]> {
  const { data } = await client.get<ReservaOut[]>(`/admin/usuarios/${idUsuario}/reservas`)
  return data
}

export interface ReservaAdminCreate {
  id_usuario: number
  id_hotel: number
  num_hab: number
  fecha_inicio: string
  fecha_fin: string
  extras: { id_extra: number; cantidad: number }[]
  id_forma_pago: number
}

export async function crearReservaAdmin(payload: ReservaAdminCreate): Promise<ReservaOut> {
  const { data } = await client.post<ReservaOut>('/admin/reservas', payload)
  return data
}
