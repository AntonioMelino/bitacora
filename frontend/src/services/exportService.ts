import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5108'

function authHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

const api = axios.create({ baseURL: API_URL })

export async function exportTrip(tripId: number): Promise<void> {
  const response = await api.get(`/api/trips/${tripId}/export`, {
    headers: authHeaders(),
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
