import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5108'

function authHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

const api = axios.create({ baseURL: API_URL })

export interface Trip {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  isInternational: boolean
  createdAt: string
}

export interface CreateTripRequest {
  name: string
  description: string
  startDate: string
  endDate: string
  isInternational: boolean
}

async function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T; message: string } }>): Promise<T> {
  const { data } = await promise
  if (!data.success) throw new Error(data.message ?? 'Error del servidor')
  return data.data
}

export function getTrips(): Promise<Trip[]> {
  return unwrap(api.get('/api/trips', { headers: authHeaders() }))
}

export function getTripById(id: number): Promise<Trip> {
  return unwrap(api.get(`/api/trips/${id}`, { headers: authHeaders() }))
}

export function createTrip(body: CreateTripRequest): Promise<Trip> {
  return unwrap(api.post('/api/trips', body, { headers: authHeaders() }))
}

export function deleteTrip(id: number): Promise<void> {
  return unwrap(api.delete(`/api/trips/${id}`, { headers: authHeaders() }))
}
