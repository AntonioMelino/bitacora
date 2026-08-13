import { api } from './api'

async function unwrap<T>(p: Promise<{ data: { success: boolean; data: T; message: string } }>): Promise<T> {
  const { data } = await p
  if (!data.success) throw new Error(data.message ?? 'Error del servidor')
  return data.data
}

export interface ItineraryItem {
  id: number
  tripId: number
  date: string
  dayNumber: number
  city: string
  accommodation: string | null
  activities: string | null
  transport: string | null
  flight: string | null
  observations: string | null
  link: string | null
  createdAt: string
}

export interface CreateItineraryItemRequest {
  date: string
  dayNumber: number
  city: string
  accommodation: string
  activities: string
  transport: string
  flight: string
  observations: string
  link: string
}

export const getItinerary = (tripId: number) =>
  unwrap<ItineraryItem[]>(api.get(`/api/trips/${tripId}/itinerary`))

export const createItineraryItem = (tripId: number, body: CreateItineraryItemRequest) =>
  unwrap<ItineraryItem>(api.post(`/api/trips/${tripId}/itinerary`, body))

export const deleteItineraryItem = (tripId: number, id: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/itinerary/${id}`))
