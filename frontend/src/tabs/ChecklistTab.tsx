import { useState, useEffect, type FormEvent } from 'react'
import {
  getChecklist, createChecklistItem, toggleChecklistItem, deleteChecklistItem,
  type ChecklistItem,
} from '../services/checklistService'

export default function ChecklistTab({ tripId }: { tripId: number }) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newItem, setNewItem] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    getChecklist(tripId)
      .then(setItems)
      .catch(() => setError('No se pudo cargar el checklist'))
      .finally(() => setLoading(false))
  }, [tripId])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newItem.trim()) return
    setAdding(true)
    try {
      const item = await createChecklistItem(tripId, newItem.trim())
      setItems((prev) => [...prev, item])
      setNewItem('')
    } catch {
      setError('No se pudo agregar el ítem')
    } finally {
      setAdding(false)
    }
  }

  function handleToggle(id: number) {
    toggleChecklistItem(tripId, id)
      .then((updated) => setItems((prev) => prev.map((i) => i.id === id ? updated : i)))
      .catch(() => setError('No se pudo actualizar el ítem'))
  }

  function handleDelete(id: number) {
    deleteChecklistItem(tripId, id)
      .then(() => setItems((prev) => prev.filter((i) => i.id !== id)))
      .catch(() => setError('No se pudo eliminar el ítem'))
  }

  const done = items.filter((i) => i.status).length

  if (loading) return <p className="text-center py-12 text-foreground/40">Cargando...</p>

  return (
    <div className="max-w-lg mx-auto">

      {items.length > 0 && (
        <div className="mb-5">
          <div className="flex justify-between text-sm text-foreground/60 mb-1.5">
            <span>{done} de {items.length} completados</span>
            <span>{Math.round((done / items.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-300"
              style={{ width: `${(done / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">{error}</div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2 mb-5">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Agregar ítem al checklist..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-foreground/20 text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={adding || !newItem.trim()}
          className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {adding ? '...' : 'Agregar'}
        </button>
      </form>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📝</div>
          <p className="font-heading font-bold text-lg text-foreground mb-1">Checklist vacío</p>
          <p className="text-foreground/50 text-sm">Agregá los ítems esenciales para tu viaje</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-foreground/8 group">
              <button
                onClick={() => handleToggle(item.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  item.status ? 'bg-success border-success text-white' : 'border-foreground/30 hover:border-success'
                }`}
                aria-label={item.status ? 'Marcar como pendiente' : 'Marcar como hecho'}
              >
                {item.status && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${item.status ? 'line-through text-foreground/40' : 'text-foreground'}`}>
                {item.item}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-error transition-all text-lg leading-none"
                aria-label="Eliminar"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
