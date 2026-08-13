import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5108'

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No hay refresh token disponible')

  const { data } = await axios.post<{
    success: boolean
    data: { token: string; refreshToken: string }
    message: string
  }>(`${API_URL}/api/auth/refresh`, { refreshToken })

  if (!data.success) throw new Error(data.message ?? 'No se pudo renovar la sesión')

  localStorage.setItem('token', data.data.token)
  localStorage.setItem('refreshToken', data.data.refreshToken)
  return data.data.token
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/')

    if (!shouldAttemptRefresh) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise
      originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
      return api(originalRequest)
    } catch (refreshError) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  }
)
