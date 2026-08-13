import { api } from './api'

export async function exportTrip(tripId: number): Promise<void> {
  const response = await api.get(`/api/trips/${tripId}/export`, {
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(response.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `viaje-${tripId}-completo.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
