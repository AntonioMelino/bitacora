import { api } from './api'

async function unwrap<T>(p: Promise<{ data: { success: boolean; data: T; message: string } }>): Promise<T> {
  const { data } = await p
  if (!data.success) throw new Error(data.message ?? 'Error del servidor')
  return data.data
}

export interface ChecklistItem {
  id: number
  tripId: number
  item: string
  status: boolean
  order: number
  createdAt: string
}

export const getChecklist = (tripId: number) =>
  unwrap<ChecklistItem[]>(api.get(`/api/trips/${tripId}/checklist`))

export const createChecklistItem = (tripId: number, item: string) =>
  unwrap<ChecklistItem>(api.post(`/api/trips/${tripId}/checklist`, { item, status: false, order: 0 }))

export const toggleChecklistItem = (tripId: number, id: number) =>
  unwrap<ChecklistItem>(api.patch(`/api/trips/${tripId}/checklist/${id}/toggle`, {}))

export const deleteChecklistItem = (tripId: number, id: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/checklist/${id}`))
