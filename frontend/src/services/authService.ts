import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5072'

const api = axios.create({ baseURL: API_URL })

export interface AuthResponse {
  token: string
  email: string
  userId: string
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<{ success: boolean; data: AuthResponse; message: string }>(
    '/api/auth/login',
    { email, password }
  )
  if (!data.success) throw new Error(data.message ?? 'Error al iniciar sesión')
  return data.data
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<{ success: boolean; data: AuthResponse; message: string }>(
    '/api/auth/register',
    { email, password }
  )
  if (!data.success) throw new Error(data.message ?? 'Error al registrarse')
  return data.data
}
