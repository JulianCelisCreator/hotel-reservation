import client from '../api/client'

export interface TokenResponse {
  access_token: string
  token_type: string
}

export async function login(correo: string, password: string): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/auth/login', { correo, password })
  return data
}

export async function register(payload: {
  nombre_completo: string
  correo: string
  usuario: string
  password: string
  fecha_nacimiento: string
}): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/auth/register', payload)
  return data
}
