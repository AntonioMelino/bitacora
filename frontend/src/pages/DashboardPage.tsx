import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTrips, createTrip, deleteTrip, type Trip, type CreateTripRequest } from '../services/tripService'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function TripCard({ trip, onDelete }: { trip: Trip; onDelete: (id: number) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A1A2E]/8 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-[Nunito,sans-serif] font-bold text-xl text-[#1A1A2E]">{trip.name}</h2>
          {trip.description && (
            <p className="text-sm text-[#1A1A2E]/60 mt-0.5 line-clamp-2">{trip.description}</p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
            trip.isInternational
              ? 'bg-[#1B4FD8]/10 text-[#1B4FD8]'
              : 'bg-[#22C55E]/10 text-[#16a34a]'
          }`}
        >
          {trip.isInternational ? '🌍 Internacional' : '🏠 Nacional'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-[#1A1A2E]/55">
        <span>📅</span>
        <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => alert('Detalle del viaje — próximamente')}
          className="flex-1 py-2 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors"
        >
          Ver viaje
        </button>
        {confirmDelete ? (
          <div className="flex gap-1">
            <button
              onClick={() => onDelete(trip.id)}
              className="px-3 py-2 rounded-xl bg-[#EF4444] text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-2 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E]/60 text-sm hover:bg-[#1A1A2E]/5 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-2 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E]/50 text-sm hover:bg-[#EF4444]/10 hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-colors"
            aria-label="Eliminar viaje"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  )
}

function NewTripModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: Trip) => void }) {
  const [form, setForm] = useState<CreateTripRequest>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isInternational: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: keyof CreateTripRequest, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.startDate || !form.endDate) { setError('Las fechas son obligatorias'); return }
    if (form.endDate < form.startDate) { setError('La fecha de fin debe ser posterior a la de inicio'); return }
    setLoading(true)
    try {
      const trip = await createTrip(form)
      onCreated(trip)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el viaje')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-[Nunito,sans-serif] font-bold text-xl text-[#1A1A2E]">Nuevo viaje</h2>
          <button onClick={onClose} className="text-[#1A1A2E]/40 hover:text-[#1A1A2E] text-2xl leading-none">×</button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Nombre del viaje *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: Europa 2026"
              className="w-full px-4 py-3 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E] placeholder:text-[#1A1A2E]/35 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Países, ciudades, motivo del viaje..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E] placeholder:text-[#1A1A2E]/35 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Fecha inicio *</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Fecha fin *</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.isInternational}
                onChange={(e) => set('isInternational', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 rounded-full bg-[#1A1A2E]/20 peer-checked:bg-[#1B4FD8] transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-medium text-[#1A1A2E]">¿Es un viaje internacional? 🌍</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-3 rounded-xl bg-[#FF6B35] text-white font-bold text-base hover:bg-[#e55a27] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando...' : 'Crear viaje'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    getTrips()
      .then(setTrips)
      .catch(() => setError('No se pudieron cargar los viajes'))
      .finally(() => setLoading(false))
  }, [navigate])

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  function handleCreated(trip: Trip) {
    setTrips((prev) => [trip, ...prev])
    setShowModal(false)
  }

  function handleDelete(id: number) {
    deleteTrip(id)
      .then(() => setTrips((prev) => prev.filter((t) => t.id !== id)))
      .catch(() => alert('No se pudo eliminar el viaje'))
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/8 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-[Nunito,sans-serif] font-bold text-2xl text-[#FF6B35]">Bitácora ✈️</span>
          <button
            onClick={handleLogout}
            className="text-sm text-[#1A1A2E]/50 hover:text-[#EF4444] transition-colors font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-[Nunito,sans-serif] font-extrabold text-3xl text-[#1A1A2E]">Mis viajes</h1>
          <button
            onClick={() => setShowModal(true)}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a27] transition-colors"
          >
            <span className="text-lg">+</span> Nuevo viaje
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 text-[#1A1A2E]/40">Cargando viajes...</div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm">
            {error}
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="font-[Nunito,sans-serif] font-bold text-xl text-[#1A1A2E] mb-2">
              Todavía no tenés viajes
            </h2>
            <p className="text-[#1A1A2E]/50 mb-6">Creá tu primer viaje y empezá a organizarlo.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a27] transition-colors"
            >
              Crear mi primer viaje
            </button>
          </div>
        )}

        {!loading && trips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {/* FAB mobile */}
      <button
        onClick={() => setShowModal(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#FF6B35] text-white text-3xl shadow-lg hover:bg-[#e55a27] transition-colors flex items-center justify-center z-10"
        aria-label="Nuevo viaje"
      >
        +
      </button>

      {showModal && (
        <NewTripModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}
