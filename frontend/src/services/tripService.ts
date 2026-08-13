import { api } from './api'

export interface Trip {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  isInternational: boolean
  budget: number | null
  createdAt: string
}

export interface CreateTripRequest {
  name: string
  description: string
  startDate: string
  endDate: string
  isInternational: boolean
  budget: number | null
}

export type UpdateTripRequest = CreateTripRequest

async function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T; message: string } }>): Promise<T> {
  const { data } = await promise
  if (!data.success) throw new Error(data.message ?? 'Error del servidor')
  return data.data
}

export function getTrips(): Promise<Trip[]> {
  return unwrap(api.get('/api/trips'))
}

export function getTripById(id: number): Promise<Trip> {
  return unwrap(api.get(`/api/trips/${id}`))
}

export function createTrip(body: CreateTripRequest): Promise<Trip> {
  return unwrap(api.post('/api/trips', body))
}

export function updateTrip(id: number, body: UpdateTripRequest): Promise<Trip> {
  return unwrap(api.put(`/api/trips/${id}`, body))
}

export function deleteTrip(id: number): Promise<void> {
  return unwrap(api.delete(`/api/trips/${id}`))
}
