import client from '../api/client'

export interface Extra {
  id_extra: number
  nombre: string
  precio: string | number
}

export interface FormaPago {
  id_forma_pago: number
  nombre: string
}

export async function getExtras(): Promise<Extra[]> {
  const { data } = await client.get<Extra[]>('/extras')
  return data
}

export async function getFormasPago(): Promise<FormaPago[]> {
  const { data } = await client.get<FormaPago[]>('/formas-pago')
  return data
}

export async function getHotelById(id: number) {
  const { data } = await client.get(`/hoteles/${id}`)
  return data
}
