import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5108' })
const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

async function unwrap<T>(p: Promise<{ data: { success: boolean; data: T; message: string } }>): Promise<T> {
  const { data } = await p
  if (!data.success) throw new Error(data.message ?? 'Error del servidor')
  return data.data
}

export interface Accommodation {
  id: number
  tripId: number
  name: string
  address: string
  city: string
  checkIn: string
  checkOut: string
  observations: string
}

export interface CreateAccommodationRequest {
  name: string
  address: string
  city: string
  checkIn: string
  checkOut: string
  observations: string
}

export const getAccommodations = (tripId: number) =>
  unwrap<Accommodation[]>(api.get(`/api/trips/${tripId}/accommodations`, { headers: h() }))

export const createAccommodation = (tripId: number, body: CreateAccommodationRequest) =>
  unwrap<Accommodation>(api.post(`/api/trips/${tripId}/accommodations`, body, { headers: h() }))

export const deleteAccommodation = (tripId: number, id: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/accommodations/${id}`, { headers: h() }))
