import { useState, useEffect, type FormEvent } from 'react'
import {
  getSimOptions, createSimOption, toggleDecided, deleteSimOption,
  type SimOption, type CreateSimOptionRequest,
} from '../services/simOptionService'

const EMPTY: CreateSimOptionRequest = { company: '', type: 'SIM', coverage: '', notes: '' }
const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

export default function SimTab({ tripId }: { tripId: number }) {
  const [options, setOptions] = useState<SimOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateSimOptionRequest>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSimOptions(tripId)
      .then(setOptions)
      .catch(() => setError('No se pudieron cargar las opciones SIM'))
      .finally(() => setLoading(false))
  }, [tripId])

  function setField<K extends keyof CreateSimOptionRequest>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const opt = await createSimOption(tripId, form)
      setOptions((p) => [...p, opt])
      setForm(EMPTY); setShowForm(false); setError('')
    } catch { setError('No se pudo guardar la opción') }
    finally { setSaving(false) }
  }

  function handleToggle(id: number) {
    toggleDecided(tripId, id)
      .then((updated) => setOptions((p) => p.map((o) => o.id === id ? updated : o)))
      .catch(() => setError('No se pudo actualizar'))
  }

  function handleDelete(id: number) {
    deleteSimOption(tripId, id)
      .then(() => setOptions((p) => p.filter((o) => o.id !== id)))
      .catch(() => setError('No se pudo eliminar'))
  }

  if (loading) return <p className="text-center py-12 text-foreground/40">Cargando...</p>

  return (
    <div className="max-w-2xl mx-auto">
      {error && <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">{error}</div>}

      <div className="flex justify-end mb-5">
        <button onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
          {showForm ? 'Cancelar' : '+ Agregar opción SIM'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-foreground/8 p-5 mb-5 flex flex-col gap-3">
          <h3 className="font-heading font-bold text-foreground">Nueva opción SIM/eSIM</h3>
          <input required placeholder="Empresa / operadora *" value={form.company}
            onChange={(e) => setField('company', e.target.value)} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setField('type', e.target.value)} className={inputCls}>
              <option value="SIM">SIM física</option>
              <option value="eSIM">eSIM</option>
            </select>
            <input placeholder="Cobertura / países" value={form.coverage}
              onChange={(e) => setField('coverage', e.target.value)} className={inputCls} />
          </div>
          <textarea placeholder="Notas (precio, datos, validez...)" value={form.notes} rows={2}
            onChange={(e) => setField('notes', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar opción'}
          </button>
        </form>
      )}

      {options.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📱</div>
          <p className="font-heading font-bold text-lg text-foreground mb-1">Sin opciones SIM</p>
          <p className="text-foreground/50 text-sm">Comparé opciones de chip para tu viaje internacional</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <div key={opt.id} className={`bg-white rounded-2xl border p-4 group transition-colors ${
              opt.decided ? 'border-success/40 bg-success/5' : 'border-foreground/8'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading font-bold text-foreground">{opt.company}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold">{opt.type}</span>
                    {opt.decided && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">Elegida</span>
                    )}
                  </div>
                  {opt.coverage && <p className="text-sm text-foreground/60 mt-0.5">Cobertura: {opt.coverage}</p>}
                  {opt.notes && <p className="text-sm text-foreground/50 mt-1">{opt.notes}</p>}
                </div>
                <button onClick={() => handleDelete(opt.id)}
                  className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-error transition-all text-xl leading-none shrink-0">×</button>
              </div>
              <button onClick={() => handleToggle(opt.id)}
                className={`mt-3 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  opt.decided
                    ? 'bg-success/15 text-success hover:bg-success/25'
                    : 'bg-foreground/8 text-foreground/60 hover:bg-foreground/15'
                }`}>
                {opt.decided ? 'Marcar como no elegida' : 'Marcar como elegida'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
