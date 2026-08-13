import { api } from './api'

export interface AuthResponse {
  token: string
  refreshToken: string
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

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) {
    try {
      await api.post('/api/auth/logout', { refreshToken })
    } catch {
      // Best-effort: proceed with clearing local session even if the server call fails
    }
  }
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
}
