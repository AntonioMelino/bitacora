import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/renderWithProviders'
import ExpensesTab from './ExpensesTab'
import {
  getExpenses, createExpense, deleteExpense, getCategories, getPaymentMethods, getCurrencies,
  type Expense, type LookupItem, type Currency,
} from '../services/expenseService'

vi.mock('../services/expenseService')

const mockedGetExpenses = vi.mocked(getExpenses)
const mockedCreateExpense = vi.mocked(createExpense)
const mockedDeleteExpense = vi.mocked(deleteExpense)
const mockedGetCategories = vi.mocked(getCategories)
const mockedGetPaymentMethods = vi.mocked(getPaymentMethods)
const mockedGetCurrencies = vi.mocked(getCurrencies)

const category: LookupItem = { id: 1, name: 'Comida' }
const method: LookupItem = { id: 1, name: 'Efectivo' }
const currency: Currency = { id: 1, code: 'USD', name: 'Dollar', symbol: '$' }

function buildExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 1,
    tripId: 10,
    description: 'Cena',
    city: 'Roma',
    paymentDate: '2026-03-10',
    amount: 50,
    exchangeRate: 1,
    observations: '',
    categoryId: category.id,
    categoryName: category.name,
    paymentMethodId: method.id,
    paymentMethodName: method.name,
    currencyId: currency.id,
    currencyCode: currency.code,
    currencySymbol: currency.symbol,
    ...overrides,
  }
}

function mockLookups(overrides: { categories?: LookupItem[]; methods?: LookupItem[]; currencies?: Currency[] } = {}) {
  mockedGetCategories.mockResolvedValue(overrides.categories ?? [category])
  mockedGetPaymentMethods.mockResolvedValue(overrides.methods ?? [method])
  mockedGetCurrencies.mockResolvedValue(overrides.currencies ?? [currency])
}

beforeEach(() => {
  vi.resetAllMocks()
  mockLookups()
  mockedGetExpenses.mockResolvedValue([])
})

describe('loading and errors', () => {
  it('shows a loading state before the data resolves', () => {
    mockedGetExpenses.mockReturnValue(new Promise(() => {}))
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('shows an error message when loading fails', async () => {
    mockedGetExpenses.mockRejectedValue(new Error('network error'))
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    expect(await screen.findByText('No se pudieron cargar los gastos')).toBeInTheDocument()
  })
})

describe('empty state', () => {
  it('shows the empty state when there are no expenses', async () => {
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    expect(await screen.findByText('Sin gastos registrados')).toBeInTheDocument()
  })
})

describe('lookup configuration warning', () => {
  it('shows the warning and settings link when a lookup list is empty', async () => {
    mockLookups({ categories: [] })
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    expect(await screen.findByText('⚠️ Configuración incompleta')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ir a Configuración/ })).toBeInTheDocument()
  })

  it('does not show the warning when all three lookup lists have data', async () => {
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    await screen.findByText('Sin gastos registrados')
    expect(screen.queryByText('⚠️ Configuración incompleta')).not.toBeInTheDocument()
  })
})

describe('budget bar', () => {
  it('shows only the plain total when no budget is set', async () => {
    mockedGetExpenses.mockResolvedValue([buildExpense({ amount: 50 })])
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    expect(await screen.findByText('Total:')).toBeInTheDocument()
    expect(screen.queryByText(/Gastado:/)).not.toBeInTheDocument()
  })

  it('shows the progress bar and percentage when a budget is set', async () => {
    mockedGetExpenses.mockResolvedValue([buildExpense({ amount: 50 })])
    renderWithProviders(<ExpensesTab tripId={10} budget={200} />)
    expect(await screen.findByText(/Gastado:/)).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('shows the overspend message when total exceeds budget', async () => {
    mockedGetExpenses.mockResolvedValue([buildExpense({ amount: 150 })])
    renderWithProviders(<ExpensesTab tripId={10} budget={100} />)
    expect(await screen.findByText('Te pasaste del presupuesto por 50.00')).toBeInTheDocument()
  })

  it('documents current behavior with a zero budget: division produces Infinity%', async () => {
    mockedGetExpenses.mockResolvedValue([buildExpense({ amount: 50 })])
    renderWithProviders(<ExpensesTab tripId={10} budget={0} />)
    expect(await screen.findByText('Infinity%')).toBeInTheDocument()
  })
})

describe('search and filters', () => {
  const rome = buildExpense({ id: 1, description: 'Cena', city: 'Roma', categoryId: 1, categoryName: 'Comida', currencyId: 1, currencyCode: 'USD' })
  const paris = buildExpense({ id: 2, description: 'Museo', city: 'Paris', categoryId: 2, categoryName: 'Ocio', currencyId: 2, currencyCode: 'EUR' })

  beforeEach(() => {
    mockedGetExpenses.mockResolvedValue([rome, paris])
    mockLookups({
      categories: [category, { id: 2, name: 'Ocio' }],
      currencies: [currency, { id: 2, code: 'EUR', name: 'Euro', symbol: '€' }],
    })
  })

  it('filters by description or city, case-insensitively', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    await screen.findByText('Cena')

    await user.type(screen.getByPlaceholderText('Buscar por descripción o ciudad...'), 'ROMA')

    expect(screen.getByText('Cena')).toBeInTheDocument()
    expect(screen.queryByText('Museo')).not.toBeInTheDocument()
  })

  it('shows a no-results message when the filter matches nothing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    await screen.findByText('Cena')

    await user.type(screen.getByPlaceholderText('Buscar por descripción o ciudad...'), 'nada-coincide')

    expect(await screen.findByText('Ningún gasto coincide con el filtro')).toBeInTheDocument()
  })

  it('keeps the total summing every expense, not just the filtered subset', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    await screen.findByText('Cena')

    await user.type(screen.getByPlaceholderText('Buscar por descripción o ciudad...'), 'ROMA')

    expect(screen.getByText((rome.amount + paris.amount).toFixed(2))).toBeInTheDocument()
  })
})

describe('creating an expense', () => {
  it('shows an error and does not call the service when required lookups are missing', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    await screen.findByText('Sin gastos registrados')

    await user.click(screen.getByRole('button', { name: '+ Agregar gasto' }))
    await user.type(screen.getByPlaceholderText('Descripción *'), 'Nuevo gasto')
    await user.type(screen.getByPlaceholderText('Monto *'), '10')
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    await user.type(dateInput, '2026-03-10')

    // The category/method/currency selects are also HTML `required`, which blocks
    // a real click-driven submit before React ever runs. Dispatching submit
    // directly exercises the app-level guard in handleSubmit instead.
    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    expect(await screen.findByText('Completá categoría, método de pago y moneda')).toBeInTheDocument()
    expect(mockedCreateExpense).not.toHaveBeenCalled()
  })

  it('creates the expense and prepends it to the list on the happy path', async () => {
    const user = userEvent.setup()
    const created = buildExpense({ id: 99, description: 'Almuerzo' })
    mockedCreateExpense.mockResolvedValue(created)
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    await screen.findByText('Sin gastos registrados')

    await user.click(screen.getByRole('button', { name: '+ Agregar gasto' }))
    await user.type(screen.getByPlaceholderText('Descripción *'), 'Almuerzo')
    await user.type(screen.getByPlaceholderText('Monto *'), '10')
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    await user.type(dateInput, '2026-03-10')
    await user.selectOptions(screen.getByDisplayValue('Moneda *'), String(currency.id))
    await user.selectOptions(screen.getByDisplayValue('Categoría *'), String(category.id))
    await user.selectOptions(screen.getByDisplayValue('Método de pago *'), String(method.id))
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }))

    expect(await screen.findByText('Almuerzo')).toBeInTheDocument()
    expect(mockedCreateExpense).toHaveBeenCalledTimes(1)
  })
})

describe('delete with undo', () => {
  // React 19's scheduler falls back to a bare `setTimeout` under jsdom (no
  // native MessageChannel path), so faking timers freezes React's own commit
  // loop, not just the app's 5s undo window (verified with a minimal
  // reproduction: a plain useState counter click hangs identically). Real
  // timers are used instead; only the "window elapses" case needs to wait
  // out the real 5s, so its own test timeout is extended accordingly.

  it('removes the expense immediately without calling deleteExpense yet', async () => {
    const user = userEvent.setup()
    mockedGetExpenses.mockResolvedValue([buildExpense()])
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    await screen.findByText('Cena')

    await user.click(screen.getByText('×'))

    expect(screen.queryByText('Cena')).not.toBeInTheDocument()
    expect(mockedDeleteExpense).not.toHaveBeenCalled()
  })

  it('calls deleteExpense once the undo window elapses', async () => {
    const user = userEvent.setup()
    mockedGetExpenses.mockResolvedValue([buildExpense()])
    mockedDeleteExpense.mockResolvedValue(undefined)
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    await screen.findByText('Cena')

    await user.click(screen.getByText('×'))

    await waitFor(() => expect(mockedDeleteExpense).toHaveBeenCalledWith(10, 1), { timeout: 6000 })
  }, 7000)

  it('restores the expense at its original position on Deshacer, without deleting', async () => {
    const user = userEvent.setup()
    const first = buildExpense({ id: 1, description: 'Cena' })
    const second = buildExpense({ id: 2, description: 'Museo' })
    mockedGetExpenses.mockResolvedValue([first, second])
    renderWithProviders(<ExpensesTab tripId={10} budget={null} />)
    await screen.findByText('Cena')

    const deleteButtons = screen.getAllByText('×')
    await user.click(deleteButtons[0])
    expect(screen.queryByText('Cena')).not.toBeInTheDocument()

    await user.click(screen.getByText('Deshacer'))

    const items = screen.getAllByText(/Cena|Museo/)
    expect(items[0]).toHaveTextContent('Cena')
    expect(mockedDeleteExpense).not.toHaveBeenCalled()
  })
})
