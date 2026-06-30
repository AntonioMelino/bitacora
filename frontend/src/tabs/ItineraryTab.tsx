import { useState, useEffect, type FormEvent } from 'react'
import {
  getItinerary, createItineraryItem, deleteItineraryItem,
  type ItineraryItem, type CreateItineraryItemRequest,
} from '../services/itineraryService'

const EMPTY: CreateItineraryItemRequest = {
  date: '', dayNumber: 1, city: '',
  accommodation: '', activities: '', transport: '', flight: '', observations: '', link: '',
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
const textareaCls = `${inputCls} resize-none`

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })
}

export default function ItineraryTab({ tripId }: { tripId: number }) {
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateItineraryItemRequest>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getItinerary(tripId)
      .then((data) => setItems([...data].sort((a, b) => a.dayNumber - b.dayNumber)))
      .catch(() => setError('No se pudo cargar el itinerario'))
      .finally(() => setLoading(false))
  }, [tripId])

  function setField<K extends keyof CreateItineraryItemRequest>(k: K, v: string | number) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const item = await createItineraryItem(tripId, form)
      setItems((p) => [...p, item].sort((a, b) => a.dayNumber - b.dayNumber))
      setForm(EMPTY); setShowForm(false); setError('')
    } catch { setError('No se pudo guardar el día') }
    finally { setSaving(false) }
  }

  function handleDelete(id: number) {
    deleteItineraryItem(tripId, id)
      .then(() => setItems((p) => p.filter((i) => i.id !== id)))
      .catch(() => setError('No se pudo eliminar el día'))
  }

  if (loading) return <p className="text-center py-12 text-foreground/40">Cargando...</p>

  return (
    <div className="max-w-2xl mx-auto">
      {error && <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">{error}</div>}

      <div className="flex justify-end mb-5">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Agregar día'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-foreground/8 p-5 mb-5 flex flex-col gap-3">
          <h3 className="font-heading font-bold text-foreground">Nuevo día</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/60 mb-1 block">Día N° *</label>
              <input
                required type="number" min={1} value={form.dayNumber}
                onChange={(e) => setField('dayNumber', Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-foreground/60 mb-1 block">Fecha *</label>
              <input
                required type="date" value={form.date}
                onChange={(e) => setField('date', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <input
            required placeholder="Ciudad *" value={form.city}
            onChange={(e) => setField('city', e.target.value)}
            className={inputCls}
          />
          <input
            placeholder="Alojamiento" value={form.accommodation}
            onChange={(e) => setField('accommodation', e.target.value)}
            className={inputCls}
          />
          <textarea
            placeholder="Actividades" value={form.activities} rows={2}
            onChange={(e) => setField('activities', e.target.value)}
            className={textareaCls}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Transporte" value={form.transport}
              onChange={(e) => setField('transport', e.target.value)}
              className={inputCls}
            />
            <input
              placeholder="Vuelo" value={form.flight}
              onChange={(e) => setField('flight', e.target.value)}
              className={inputCls}
            />
          </div>
          <textarea
            placeholder="Observaciones" value={form.observations} rows={2}
            onChange={(e) => setField('observations', e.target.value)}
            className={textareaCls}
          />
          <input
            placeholder="Link (reserva, guía, etc.)" value={form.link}
            onChange={(e) => setField('link', e.target.value)}
            className={inputCls}
          />

          <button
            type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar día'}
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🗺️</div>
          <p className="font-heading font-bold text-lg text-foreground mb-1">Itinerario vacío</p>
          <p className="text-foreground/50 text-sm">Agregá los días de tu viaje para planificar cada jornada</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="bg-white rounded-2xl border border-foreground/8 overflow-hidden group">
              <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b border-foreground/8">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="font-heading font-extrabold text-white text-sm">{item.dayNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-foreground capitalize">{formatDate(item.date)}</p>
                  <p className="text-sm text-foreground/60">📍 {item.city}</p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-error transition-all text-xl leading-none shrink-0"
                  aria-label="Eliminar día"
                >×</button>
              </div>

              <div className="px-4 py-3 flex flex-col gap-2">
                {item.accommodation && <Row icon="🏨" label="Alojamiento" value={item.accommodation} />}
                {item.activities && <Row icon="🎯" label="Actividades" value={item.activities} />}
                {item.transport && <Row icon="🚌" label="Transporte" value={item.transport} />}
                {item.flight && <Row icon="✈️" label="Vuelo" value={item.flight} />}
                {item.observations && <Row icon="📝" label="Observaciones" value={item.observations} />}
                {item.link && (
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-5 shrink-0">🔗</span>
                    <a
                      href={item.link} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-secondary hover:underline break-all"
                    >
                      {item.link}
                    </a>
                  </div>
                )}
                {!item.accommodation && !item.activities && !item.transport && !item.flight && !item.observations && !item.link && (
                  <p className="text-xs text-foreground/40 italic">Sin detalles agregados</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base leading-5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="text-xs text-foreground/50 uppercase tracking-wide">{label} </span>
        <span className="text-sm text-foreground whitespace-pre-line">{value}</span>
      </div>
    </div>
  )
}
