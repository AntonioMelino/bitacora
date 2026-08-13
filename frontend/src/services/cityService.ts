import { api } from './api'

async function unwrap<T>(p: Promise<{ data: { success: boolean; data: T; message: string } }>): Promise<T> {
  const { data } = await p
  if (!data.success) throw new Error(data.message ?? 'Error del servidor')
  return data.data
}

export interface PlaceToVisit {
  id: number
  cityId: number
  name: string
  mapsLink: string
  notes: string
  visited: boolean
}

export interface City {
  id: number
  tripId: number
  name: string
  order: number
  places: PlaceToVisit[]
}

export const getCities = (tripId: number) =>
  unwrap<City[]>(api.get(`/api/trips/${tripId}/cities`))

export const createCity = (tripId: number, name: string) =>
  unwrap<City>(api.post(`/api/trips/${tripId}/cities`, { name, order: 0 }))

export const deleteCity = (tripId: number, id: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/cities/${id}`))

export const createPlace = (tripId: number, cityId: number, body: { name: string; mapsLink: string; notes: string }) =>
  unwrap<PlaceToVisit>(api.post(`/api/trips/${tripId}/cities/${cityId}/places`, { ...body, visited: false }))

export const toggleVisited = (tripId: number, cityId: number, placeId: number) =>
  unwrap<PlaceToVisit>(api.patch(`/api/trips/${tripId}/cities/${cityId}/places/${placeId}/visited`, {}))

export const deletePlace = (tripId: number, cityId: number, placeId: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/cities/${cityId}/places/${placeId}`))
