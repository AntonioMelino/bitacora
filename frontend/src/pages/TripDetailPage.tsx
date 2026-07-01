import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTripById, updateTrip, type Trip, type UpdateTripRequest } from '../services/tripService'
import { exportTrip } from '../services/exportService'
import ChecklistTab from '../tabs/ChecklistTab'
import ExpensesTab from '../tabs/ExpensesTab'
import AccommodationsTab from '../tabs/AccommodationsTab'
import CitiesTab from '../tabs/CitiesTab'
import SimTab from '../tabs/SimTab'
import ItineraryTab from '../tabs/ItineraryTab'

type TabId = 'checklist' | 'expenses' | 'itinerary' | 'accommodations' | 'cities' | 'sim'

interface Tab { id: TabId; label: string; emoji: string }

const BASE_TABS: Tab[] = [
  { id: 'checklist',      label: 'Checklist',    emoji: '✅' },
  { id: 'expenses',       label: 'Gastos',        emoji: '💸' },
  { id: 'itinerary',      label: 'Itinerario',    emoji: '🗺️' },
  { id: 'accommodations', label: 'Alojamientos',  emoji: '🏨' },
  { id: 'cities',         label: 'Ciudades',      emoji: '📍' },
]
const SIM_TAB: Tab = { id: 'sim', label: 'SIM/eSIM', emoji: '📱' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function toDateInputValue(iso: string) {
  return iso.slice(0, 10)
}

function EditTripModal({ trip, onClose, onUpdated }: { trip: Trip; onClose: () => void; onUpdated: (t: Trip) => void }) {
  const [form, setForm] = useState<UpdateTripRequest>({
    name: trip.name,
    description: trip.description,
    startDate: toDateInputValue(trip.startDate),
    endDate: toDateInputValue(trip.endDate),
    isInternational: trip.isInternational,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: keyof UpdateTripRequest, value: string | boolean) {
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
      const updated = await updateTrip(trip.id, form)
      onUpdated(updated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el viaje')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-xl text-foreground">Editar viaje</h2>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground text-2xl leading-none">×</button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre del viaje *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: Europa 2026"
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Países, ciudades, motivo del viaje..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha inicio *</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-foreground/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha fin *</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-foreground/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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
              <div className="w-11 h-6 rounded-full bg-foreground/20 peer-checked:bg-secondary transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-medium text-foreground">¿Es un viaje internacional? 🌍</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-3 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabId | null>(null)
  const [exporting, setExporting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    getTripById(Number(id))
      .then(setTrip)
      .catch(() => setError('No se pudo cargar el viaje'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const tabs = trip ? [...BASE_TABS, ...(trip.isInternational ? [SIM_TAB] : [])] : BASE_TABS

  async function handleExport() {
    if (!trip) return
    setExporting(true)
    try {
      await exportTrip(trip.id)
    } catch {
      setError('No se pudo exportar el viaje')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/40">Cargando viaje...</p>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-error">{error || 'Viaje no encontrado'}</p>
        <Link to="/dashboard" className="text-primary font-semibold hover:underline">← Volver</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-foreground/8 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto">
          <Link to="/dashboard" className="text-foreground/50 hover:text-foreground text-sm font-medium transition-colors">
            ← Mis viajes
          </Link>
          <div className="flex items-start justify-between gap-2 mt-1">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-xl text-foreground">{trip.name}</h1>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-foreground/40 hover:text-primary transition-colors"
                  aria-label="Editar viaje"
                >
                  ✏️
                </button>
              </div>
              <p className="text-xs text-foreground/50 mt-0.5">
                📅 {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                {trip.isInternational && <span className="ml-2">🌍 Internacional</span>}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="shrink-0 flex items-center gap-1.5 bg-secondary text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-secondary/90 disabled:opacity-50 transition-colors"
            >
              {exporting ? '⏳ Exportando...' : '📊 Exportar Excel'}
            </button>
          </div>
        </div>
      </header>

      {activeTab === null ? (
        /* Menu grid */
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="aspect-square bg-white rounded-2xl shadow-sm border border-foreground/8 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-primary/30 transition-shadow"
              >
                <span className="text-4xl">{tab.emoji}</span>
                <span className="font-heading font-bold text-sm text-foreground">{tab.label}</span>
              </button>
            ))}
          </div>
        </main>
      ) : (
        <>
          {/* Back to menu bar */}
          <div className="bg-white border-b border-foreground/8 sticky top-[73px] z-10">
            <div className="max-w-5xl mx-auto px-4 py-3">
              <button
                onClick={() => setActiveTab(null)}
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground/60 hover:text-primary transition-colors"
              >
                ← Volver al menú
              </button>
            </div>
          </div>

          {/* Tab content */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
            {activeTab === 'checklist'      && <ChecklistTab tripId={trip.id} />}
            {activeTab === 'expenses'       && <ExpensesTab tripId={trip.id} />}
            {activeTab === 'itinerary'      && <ItineraryTab tripId={trip.id} />}
            {activeTab === 'accommodations' && <AccommodationsTab tripId={trip.id} />}
            {activeTab === 'cities'         && <CitiesTab tripId={trip.id} />}
            {activeTab === 'sim'            && <SimTab tripId={trip.id} />}
          </main>
        </>
      )}

      {showEditModal && (
        <EditTripModal
          trip={trip}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updated) => { setTrip(updated); setShowEditModal(false) }}
        />
      )}
    </div>
  )
}
