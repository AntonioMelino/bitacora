import { api } from './api'

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
  unwrap<Accommodation[]>(api.get(`/api/trips/${tripId}/accommodations`))

export const createAccommodation = (tripId: number, body: CreateAccommodationRequest) =>
  unwrap<Accommodation>(api.post(`/api/trips/${tripId}/accommodations`, body))

export const deleteAccommodation = (tripId: number, id: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/accommodations/${id}`))
