import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5108' })
const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

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
  unwrap<ChecklistItem[]>(api.get(`/api/trips/${tripId}/checklist`, { headers: h() }))

export const createChecklistItem = (tripId: number, item: string) =>
  unwrap<ChecklistItem>(api.post(`/api/trips/${tripId}/checklist`, { item, status: false, order: 0 }, { headers: h() }))

export const toggleChecklistItem = (tripId: number, id: number) =>
  unwrap<ChecklistItem>(api.patch(`/api/trips/${tripId}/checklist/${id}/toggle`, {}, { headers: h() }))

export const deleteChecklistItem = (tripId: number, id: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/checklist/${id}`, { headers: h() }))
