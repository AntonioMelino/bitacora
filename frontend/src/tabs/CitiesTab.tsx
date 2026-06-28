import { useState, useEffect, type FormEvent } from 'react'
import {
  getCities, createCity, deleteCity, createPlace, toggleVisited, deletePlace,
  type City, type PlaceToVisit,
} from '../services/cityService'

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

function PlaceItem({ place, tripId, cityId, onToggle, onDelete }: {
  place: PlaceToVisit; tripId: number; cityId: number
  onToggle: (p: PlaceToVisit) => void; onDelete: (id: number) => void
}) {
  return (
    <li className="flex items-start gap-2 group py-1.5">
      <button onClick={() => toggleVisited(tripId, cityId, place.id).then(onToggle)}
        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
          place.visited ? 'bg-success border-success text-white' : 'border-foreground/30 hover:border-success'
        }`}>
        {place.visited && (
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 10 10">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${place.visited ? 'line-through text-foreground/40' : 'text-foreground'}`}>{place.name}</span>
        {place.notes && <p className="text-xs text-foreground/50">{place.notes}</p>}
        {place.mapsLink && (
          <a href={place.mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:underline">Ver en Maps</a>
        )}
      </div>
      <button onClick={() => onDelete(place.id)}
        className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-error transition-all text-xl leading-none shrink-0">×</button>
    </li>
  )
}

function AddPlaceForm({ onAdd }: { onAdd: (n: string, m: string, notes: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [mapsLink, setMapsLink] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try { await onAdd(name, mapsLink, notes); setName(''); setMapsLink(''); setNotes('') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 pl-4 border-l-2 border-foreground/10">
      <input required placeholder="Nombre del lugar *" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      <input placeholder="Link de Google Maps" value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} className={inputCls} />
      <input placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
      <button type="submit" disabled={saving || !name.trim()}
        className="self-start px-4 py-2 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary/80 disabled:opacity-50 transition-colors">
        {saving ? '...' : 'Agregar lugar'}
      </button>
    </form>
  )
}

export default function CitiesTab({ tripId }: { tripId: number }) {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newCity, setNewCity] = useState('')
  const [adding, setAdding] = useState(false)
  const [openPlaceForm, setOpenPlaceForm] = useState<number | null>(null)

  useEffect(() => {
    getCities(tripId).then(setCities).catch(() => setError('No se pudieron cargar las ciudades')).finally(() => setLoading(false))
  }, [tripId])

  async function handleAddCity(e: FormEvent) {
    e.preventDefault()
    if (!newCity.trim()) return
    setAdding(true)
    try {
      const city = await createCity(tripId, newCity.trim())
      setCities((p) => [...p, { ...city, places: [] }])
      setNewCity('')
    } catch { setError('No se pudo agregar la ciudad') }
    finally { setAdding(false) }
  }

  async function handleAddPlace(cityId: number, name: string, mapsLink: string, notes: string) {
    const place = await createPlace(tripId, cityId, { name, mapsLink, notes })
    setCities((p) => p.map((c) => c.id === cityId ? { ...c, places: [...c.places, place] } : c))
    setOpenPlaceForm(null)
  }

  if (loading) return <p className="text-center py-12 text-foreground/40">Cargando...</p>

  return (
    <div className="max-w-2xl mx-auto">
      {error && <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">{error}</div>}

      <form onSubmit={handleAddCity} className="flex gap-2 mb-6">
        <input placeholder="Agregar ciudad..." value={newCity} onChange={(e) => setNewCity(e.target.value)} className={inputCls} />
        <button type="submit" disabled={adding || !newCity.trim()}
          className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors">
          {adding ? '...' : 'Agregar'}
        </button>
      </form>

      {cities.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📍</div>
          <p className="font-heading font-bold text-lg text-foreground mb-1">Sin ciudades</p>
          <p className="text-foreground/50 text-sm">Agregá las ciudades que vas a visitar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {cities.map((city) => (
            <div key={city.id} className="bg-white rounded-2xl border border-foreground/8 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-bold text-foreground">📍 {city.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setOpenPlaceForm(openPlaceForm === city.id ? null : city.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary font-semibold hover:bg-secondary/20 transition-colors">
                    + Lugar
                  </button>
                  <button onClick={() => deleteCity(tripId, city.id).then(() => setCities((p) => p.filter((c) => c.id !== city.id))).catch(() => setError('No se pudo eliminar'))}
                    className="text-foreground/30 hover:text-error transition-colors text-xl leading-none">×</button>
                </div>
              </div>

              {city.places.length > 0 && (
                <ul className="flex flex-col divide-y divide-foreground/5">
                  {city.places.map((place) => (
                    <PlaceItem key={place.id} place={place} tripId={tripId} cityId={city.id}
                      onToggle={(updated) => setCities((p) => p.map((c) => c.id === city.id ? { ...c, places: c.places.map((pl) => pl.id === updated.id ? updated : pl) } : c))}
                      onDelete={(placeId) => deletePlace(tripId, city.id, placeId).then(() => setCities((p) => p.map((c) => c.id === city.id ? { ...c, places: c.places.filter((pl) => pl.id !== placeId) } : c))).catch(() => setError('No se pudo eliminar'))} />
                  ))}
                </ul>
              )}

              {openPlaceForm === city.id && (
                <AddPlaceForm onAdd={(n, m, notes) => handleAddPlace(city.id, n, m, notes)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
