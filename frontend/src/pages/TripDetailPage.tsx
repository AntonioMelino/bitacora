import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTripById, type Trip } from '../services/tripService'

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

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🚧</div>
      <p className="font-heading font-bold text-xl text-foreground mb-1">{label}</p>
      <p className="text-foreground/50 text-sm">Esta sección estará disponible pronto</p>
    </div>
  )
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('checklist')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    getTripById(Number(id))
      .then(setTrip)
      .catch(() => setError('No se pudo cargar el viaje'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const tabs = trip ? [...BASE_TABS, ...(trip.isInternational ? [SIM_TAB] : [])] : BASE_TABS

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
              <h1 className="font-heading font-extrabold text-xl text-foreground">{trip.name}</h1>
              <p className="text-xs text-foreground/50 mt-0.5">
                📅 {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                {trip.isInternational && <span className="ml-2">🌍 Internacional</span>}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-foreground/8 sticky top-[73px] z-10 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/50 hover:text-foreground'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {activeTab === 'checklist'      && <ComingSoon label="Checklist" />}
        {activeTab === 'expenses'       && <ComingSoon label="Gastos" />}
        {activeTab === 'itinerary'      && <ComingSoon label="Itinerario" />}
        {activeTab === 'accommodations' && <ComingSoon label="Alojamientos" />}
        {activeTab === 'cities'         && <ComingSoon label="Ciudades y lugares" />}
        {activeTab === 'sim'            && <ComingSoon label="SIM / eSIM" />}
      </main>
    </div>
  )
}
