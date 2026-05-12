import client from '../api/client'

export interface Lugar {
  id_lugar: number
  nombre: string
}

export interface Hotel {
  id_hotel: number
  nombre: string
  direccion: string | null
  lugar: Lugar | null
}

export async function getHoteles(): Promise<Hotel[]> {
  const { data } = await client.get<Hotel[]>('/hoteles/')
  return data
}

export async function buscarHoteles(ciudad?: string): Promise<Hotel[]> {
  const { data } = await client.get<Hotel[]>('/hoteles/buscar', {
    params: ciudad ? { ciudad } : {},
  })
  return data
}
