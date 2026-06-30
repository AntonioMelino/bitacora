import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  getExpenses, createExpense, deleteExpense, getCategories, getPaymentMethods, getCurrencies,
  type Expense, type CreateExpenseRequest, type LookupItem, type Currency,
} from '../services/expenseService'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const EMPTY: CreateExpenseRequest = {
  description: '', city: '', paymentDate: '', amount: 0,
  exchangeRate: 1, observations: '', categoryId: 0, paymentMethodId: 0, currencyId: 0,
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

export default function ExpensesTab({ tripId }: { tripId: number }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<LookupItem[]>([])
  const [methods, setMethods] = useState<LookupItem[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateExpenseRequest>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getExpenses(tripId), getCategories(), getPaymentMethods(), getCurrencies()])
      .then(([exp, cats, meths, curs]) => {
        setExpenses(exp); setCategories(cats); setMethods(meths); setCurrencies(curs)
      })
      .catch(() => setError('No se pudieron cargar los gastos'))
      .finally(() => setLoading(false))
  }, [tripId])

  function setField<K extends keyof CreateExpenseRequest>(k: K, v: CreateExpenseRequest[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.categoryId || !form.paymentMethodId || !form.currencyId) {
      setError('Completá categoría, método de pago y moneda'); return
    }
    setSaving(true)
    try {
      const exp = await createExpense(tripId, form)
      setExpenses((p) => [exp, ...p])
      setForm(EMPTY); setShowForm(false); setError('')
    } catch { setError('No se pudo guardar el gasto') }
    finally { setSaving(false) }
  }

  function handleDelete(id: number) {
    deleteExpense(tripId, id)
      .then(() => setExpenses((p) => p.filter((e) => e.id !== id)))
      .catch(() => setError('No se pudo eliminar'))
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  if (loading) return <p className="text-center py-12 text-foreground/40">Cargando...</p>

  return (
    <div className="max-w-2xl mx-auto">
      {error && <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">{error}</div>}

      {(categories.length === 0 || methods.length === 0 || currencies.length === 0) && (
        <div className="mb-5 p-4 rounded-xl bg-accent/20 border border-accent/40 text-sm text-foreground">
          <p className="font-semibold mb-1">⚠️ Configuración incompleta</p>
          <p className="text-foreground/70 mb-2">
            Para registrar gastos necesitás al menos una categoría, un método de pago y una moneda.
          </p>
          <Link to="/settings" className="font-semibold text-secondary hover:underline">
            Ir a Configuración →
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        {expenses.length > 0 && (
          <p className="text-sm text-foreground/60">Total: <span className="font-bold text-foreground">{total.toFixed(2)}</span></p>
        )}
        <button onClick={() => setShowForm((v) => !v)}
          className="ml-auto px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
          {showForm ? 'Cancelar' : '+ Agregar gasto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-foreground/8 p-5 mb-5 flex flex-col gap-3">
          <h3 className="font-heading font-bold text-foreground">Nuevo gasto</h3>
          <input required placeholder="Descripción *" value={form.description}
            onChange={(e) => setField('description', e.target.value)} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Ciudad" value={form.city}
              onChange={(e) => setField('city', e.target.value)} className={inputCls} />
            <input required type="date" value={form.paymentDate}
              onChange={(e) => setField('paymentDate', e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" step="0.01" min="0" placeholder="Monto *"
              value={form.amount || ''} onChange={(e) => setField('amount', parseFloat(e.target.value) || 0)} className={inputCls} />
            <select required value={form.currencyId || ''} onChange={(e) => setField('currencyId', Number(e.target.value))} className={inputCls}>
              <option value="">Moneda *</option>
              {currencies.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select required value={form.categoryId || ''} onChange={(e) => setField('categoryId', Number(e.target.value))} className={inputCls}>
              <option value="">Categoría *</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select required value={form.paymentMethodId || ''} onChange={(e) => setField('paymentMethodId', Number(e.target.value))} className={inputCls}>
              <option value="">Método de pago *</option>
              {methods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <textarea placeholder="Observaciones" value={form.observations} rows={2}
            onChange={(e) => setField('observations', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar gasto'}
          </button>
        </form>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">💸</div>
          <p className="font-heading font-bold text-lg text-foreground mb-1">Sin gastos registrados</p>
          <p className="text-foreground/50 text-sm">Registrá tu primer gasto del viaje</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {expenses.map((exp) => (
            <li key={exp.id} className="bg-white rounded-xl border border-foreground/8 px-4 py-3 flex items-center gap-3 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-sm">{exp.description}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{exp.categoryName}</span>
                </div>
                <div className="text-xs text-foreground/50 mt-0.5 flex gap-2 flex-wrap">
                  {exp.city && <span>📍 {exp.city}</span>}
                  <span>📅 {formatDate(exp.paymentDate)}</span>
                  <span>💳 {exp.paymentMethodName}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-foreground">{exp.currencySymbol}{exp.amount.toFixed(2)}</p>
                <p className="text-xs text-foreground/40">{exp.currencyCode}</p>
              </div>
              <button onClick={() => handleDelete(exp.id)}
                className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-error transition-all text-xl leading-none shrink-0">×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
