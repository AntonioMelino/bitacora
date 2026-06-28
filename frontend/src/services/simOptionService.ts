import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5108' })
const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

async function unwrap<T>(p: Promise<{ data: { success: boolean; data: T; message: string } }>): Promise<T> {
  const { data } = await p
  if (!data.success) throw new Error(data.message ?? 'Error del servidor')
  return data.data
}

export interface SimOption {
  id: number
  tripId: number
  company: string
  type: string
  coverage: string
  notes: string
  decided: boolean
}

export interface CreateSimOptionRequest {
  company: string
  type: string
  coverage: string
  notes: string
}

export const getSimOptions = (tripId: number) =>
  unwrap<SimOption[]>(api.get(`/api/trips/${tripId}/sim-options`, { headers: h() }))

export const createSimOption = (tripId: number, body: CreateSimOptionRequest) =>
  unwrap<SimOption>(api.post(`/api/trips/${tripId}/sim-options`, { ...body, decided: false }, { headers: h() }))

export const toggleDecided = (tripId: number, id: number) =>
  unwrap<SimOption>(api.patch(`/api/trips/${tripId}/sim-options/${id}/decided`, {}, { headers: h() }))

export const deleteSimOption = (tripId: number, id: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/sim-options/${id}`, { headers: h() }))
