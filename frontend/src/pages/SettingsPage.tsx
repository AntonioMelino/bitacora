import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  getCategories, createCategory, deleteCategory,
  getPaymentMethods, createPaymentMethod, deletePaymentMethod,
  getCurrencies, createCurrency, deleteCurrency,
  type LookupItem, type Currency,
} from '../services/lookupService'

const inputCls = 'flex-1 px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

function LookupSection({
  title, emoji, items, onAdd, onDelete, addPlaceholder,
}: {
  title: string
  emoji: string
  items: LookupItem[]
  onAdd: (name: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  addPlaceholder: string
}) {
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setAdding(true); setError('')
    try { await onAdd(input.trim()); setInput('') }
    catch { setError('No se pudo agregar') }
    finally { setAdding(false) }
  }

  return (
    <section className="bg-white rounded-2xl border border-foreground/8 p-5">
      <h2 className="font-heading font-bold text-lg text-foreground mb-4">{emoji} {title}</h2>

      {error && <p className="mb-3 text-sm text-error">{error}</p>}

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={addPlaceholder} className={inputCls}
        />
        <button
          type="submit" disabled={adding || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {adding ? '...' : 'Agregar'}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-foreground/40 text-center py-3">Sin elementos</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-background group">
              <span className="text-sm text-foreground">{item.name}</span>
              <button
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-error transition-all text-lg leading-none"
                aria-label="Eliminar"
              >×</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CurrencySection({
  currencies, onAdd, onDelete,
}: {
  currencies: Currency[]
  onAdd: (code: string, name: string, symbol: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!code.trim() || !name.trim() || !symbol.trim()) return
    setAdding(true); setError('')
    try {
      await onAdd(code.trim().toUpperCase(), name.trim(), symbol.trim())
      setCode(''); setName(''); setSymbol('')
    }
    catch { setError('No se pudo agregar') }
    finally { setAdding(false) }
  }

  return (
    <section className="bg-white rounded-2xl border border-foreground/8 p-5">
      <h2 className="font-heading font-bold text-lg text-foreground mb-4">💱 Monedas</h2>

      {error && <p className="mb-3 text-sm text-error">{error}</p>}

      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <input
            value={code} onChange={(e) => setCode(e.target.value)}
            placeholder="Código (USD)" maxLength={5}
            className="w-28 px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary uppercase"
          />
          <input
            value={symbol} onChange={(e) => setSymbol(e.target.value)}
            placeholder="Símbolo ($)" maxLength={5}
            className="w-24 px-3 py-2.5 rounded-xl border border-foreground/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (Dólar)" className={inputCls}
          />
        </div>
        <button
          type="submit" disabled={adding || !code.trim() || !name.trim() || !symbol.trim()}
          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {adding ? 'Agregando...' : 'Agregar moneda'}
        </button>
      </form>

      {currencies.length === 0 ? (
        <p className="text-sm text-foreground/40 text-center py-3">Sin monedas</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {currencies.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-background group">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground w-12">{c.code}</span>
                <span className="text-sm text-foreground/50">{c.symbol}</span>
                <span className="text-sm text-foreground">{c.name}</span>
              </div>
              <button
                onClick={() => onDelete(c.id)}
                className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-error transition-all text-lg leading-none"
                aria-label="Eliminar"
              >×</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<LookupItem[]>([])
  const [methods, setMethods] = useState<LookupItem[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    Promise.all([getCategories(), getPaymentMethods(), getCurrencies()])
      .then(([cats, meths, curs]) => { setCategories(cats); setMethods(meths); setCurrencies(curs) })
      .catch(() => setError('No se pudo cargar la configuración'))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/40">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-foreground/8 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <Link to="/dashboard" className="text-foreground/50 hover:text-foreground text-sm font-medium transition-colors">
            ← Mis viajes
          </Link>
          <h1 className="font-heading font-extrabold text-xl text-foreground mt-1">⚙️ Configuración</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        {error && <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">{error}</div>}

        <LookupSection
          title="Categorías de gastos" emoji="🏷️"
          items={categories}
          addPlaceholder="Ej: Comida, Transporte, Alojamiento..."
          onAdd={async (name) => {
            const item = await createCategory(name)
            setCategories((p) => [...p, item])
          }}
          onDelete={async (id) => {
            await deleteCategory(id)
            setCategories((p) => p.filter((i) => i.id !== id))
          }}
        />

        <LookupSection
          title="Métodos de pago" emoji="💳"
          items={methods}
          addPlaceholder="Ej: Efectivo, Tarjeta de crédito..."
          onAdd={async (name) => {
            const item = await createPaymentMethod(name)
            setMethods((p) => [...p, item])
          }}
          onDelete={async (id) => {
            await deletePaymentMethod(id)
            setMethods((p) => p.filter((i) => i.id !== id))
          }}
        />

        <CurrencySection
          currencies={currencies}
          onAdd={async (code, name, symbol) => {
            const c = await createCurrency(code, name, symbol)
            setCurrencies((p) => [...p, c])
          }}
          onDelete={async (id) => {
            await deleteCurrency(id)
            setCurrencies((p) => p.filter((c) => c.id !== id))
          }}
        />
      </main>
    </div>
  )
}
