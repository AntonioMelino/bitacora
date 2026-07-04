import { useState, useEffect, type FormEvent } from 'react'
import {
  getAccommodations, createAccommodation, deleteAccommodation,
  type Accommodation, type CreateAccommodationRequest,
} from '../services/accommodationService'
import { alignEndDate } from '../utils/dates'

const EMPTY: CreateAccommodationRequest = { name: '', address: '', city: '', checkIn: '', checkOut: '', observations: '' }
const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AccommodationsTab({ tripId }: { tripId: number }) {
  const [items, setItems] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateAccommodationRequest>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAccommodations(tripId)
      .then(setItems)
      .catch(() => setError('No se pudieron cargar los alojamientos'))
      .finally(() => setLoading(false))
  }, [tripId])

  function setField<K extends keyof CreateAccommodationRequest>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const item = await createAccommodation(tripId, form)
      setItems((p) => [...p, item])
      setForm(EMPTY); setShowForm(false); setError('')
    } catch { setError('No se pudo guardar el alojamiento') }
    finally { setSaving(false) }
  }

  if (loading) return <p className="text-center py-12 text-foreground/40">Cargando...</p>

  return (
    <div className="max-w-2xl mx-auto">
      {error && <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">{error}</div>}

      <div className="flex justify-end mb-5">
        <button onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
          {showForm ? 'Cancelar' : '+ Agregar alojamiento'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-foreground/8 p-5 mb-5 flex flex-col gap-3">
          <h3 className="font-heading font-bold text-foreground">Nuevo alojamiento</h3>
          <input required placeholder="Nombre *" value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputCls} />
          <input placeholder="Dirección" value={form.address} onChange={(e) => setField('address', e.target.value)} className={inputCls} />
          <input placeholder="Ciudad" value={form.city} onChange={(e) => setField('city', e.target.value)} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/60 mb-1 block">Check-in *</label>
              <input required type="date" value={form.checkIn} onChange={(e) => {
                const checkIn = e.target.value
                setForm((p) => ({ ...p, checkIn, checkOut: alignEndDate(checkIn, p.checkOut) }))
              }} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-foreground/60 mb-1 block">Check-out *</label>
              <input required type="date" value={form.checkOut} onChange={(e) => setField('checkOut', e.target.value)} className={inputCls} />
            </div>
          </div>
          <textarea placeholder="Observaciones" value={form.observations} rows={2}
            onChange={(e) => setField('observations', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar alojamiento'}
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🏨</div>
          <p className="font-heading font-bold text-lg text-foreground mb-1">Sin alojamientos</p>
          <p className="text-foreground/50 text-sm">Agregá los lugares donde vas a hospedarte</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="bg-white rounded-2xl border border-foreground/8 p-4 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-heading font-bold text-foreground">{item.name}</p>
                  {item.city && <p className="text-sm text-foreground/60 mt-0.5">📍 {item.city}</p>}
                  {item.address && <p className="text-sm text-foreground/50">{item.address}</p>}
                  <p className="text-sm text-foreground/60 mt-1">🗓️ {formatDate(item.checkIn)} → {formatDate(item.checkOut)}</p>
                  {item.observations && <p className="text-xs text-foreground/50 mt-1 italic">{item.observations}</p>}
                </div>
                <button onClick={() => deleteAccommodation(tripId, item.id).then(() => setItems((p) => p.filter((i) => i.id !== item.id))).catch(() => setError('No se pudo eliminar'))}
                  className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-error transition-all text-xl leading-none shrink-0">×</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
