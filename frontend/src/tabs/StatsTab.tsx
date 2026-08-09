import { useState, useEffect } from 'react'
import { getExpenses, type Expense } from '../services/expenseService'

interface CategoryBreakdown {
  categoryId: number
  categoryName: string
  total: number
  percentage: number
}

interface CurrencyBreakdown {
  currencyId: number
  currencyCode: string
  currencySymbol: string
  total: number
}

const BAR_COLORS = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-success', 'bg-error']

function buildCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const totals = new Map<number, { name: string; total: number }>()
  for (const exp of expenses) {
    const current = totals.get(exp.categoryId) ?? { name: exp.categoryName, total: 0 }
    current.total += exp.amount
    totals.set(exp.categoryId, current)
  }
  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0)
  return [...totals.entries()]
    .map(([categoryId, { name, total }]) => ({
      categoryId,
      categoryName: name,
      total,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

function buildCurrencyBreakdown(expenses: Expense[]): CurrencyBreakdown[] {
  const totals = new Map<number, { code: string; symbol: string; total: number }>()
  for (const exp of expenses) {
    const current = totals.get(exp.currencyId) ?? { code: exp.currencyCode, symbol: exp.currencySymbol, total: 0 }
    current.total += exp.amount
    totals.set(exp.currencyId, current)
  }
  return [...totals.entries()]
    .map(([currencyId, { code, symbol, total }]) => ({
      currencyId,
      currencyCode: code,
      currencySymbol: symbol,
      total,
    }))
    .sort((a, b) => b.total - a.total)
}

export default function StatsTab({ tripId }: { tripId: number }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getExpenses(tripId)
      .then(setExpenses)
      .catch(() => setError('No se pudieron cargar las estadísticas'))
      .finally(() => setLoading(false))
  }, [tripId])

  if (loading) return <p className="text-center py-12 text-foreground/40">Cargando...</p>
  if (error) return <p className="text-center py-12 text-error">{error}</p>

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📊</div>
        <p className="font-heading font-bold text-lg text-foreground mb-1">Sin datos todavía</p>
        <p className="text-foreground/50 text-sm">Registrá gastos para ver estadísticas</p>
      </div>
    )
  }

  const categoryBreakdown = buildCategoryBreakdown(expenses)
  const currencyBreakdown = buildCurrencyBreakdown(expenses)
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const average = total / expenses.length

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-foreground/8 p-5">
        <p className="text-sm text-foreground/60">Total registrado</p>
        <p className="font-heading font-extrabold text-2xl text-foreground">{total.toFixed(2)}</p>
        <p className="text-xs text-foreground/40 mt-1">
          {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'} · promedio {average.toFixed(2)} por gasto
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-foreground/8 p-5">
        <h3 className="font-heading font-bold text-foreground mb-4">Por categoría</h3>
        <div className="flex flex-col gap-3">
          {categoryBreakdown.map((c, i) => (
            <div key={c.categoryId}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-foreground">{c.categoryName}</span>
                <span className="text-foreground/60">{c.total.toFixed(2)} ({c.percentage.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                  style={{ width: `${c.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {currencyBreakdown.length > 1 && (
        <div className="bg-white rounded-2xl border border-foreground/8 p-5">
          <h3 className="font-heading font-bold text-foreground mb-3">Por moneda</h3>
          <ul className="flex flex-col gap-2">
            {currencyBreakdown.map((c) => (
              <li key={c.currencyId} className="flex items-center justify-between text-sm">
                <span className="text-foreground/70">{c.currencyCode}</span>
                <span className="font-semibold text-foreground">{c.currencySymbol}{c.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-foreground/40 mt-3">
            Los totales no se convierten entre monedas todavía — cada moneda se suma por separado.
          </p>
        </div>
      )}
    </div>
  )
}
