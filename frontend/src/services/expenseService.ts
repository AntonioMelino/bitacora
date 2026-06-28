import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5108' })
const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

async function unwrap<T>(p: Promise<{ data: { success: boolean; data: T; message: string } }>): Promise<T> {
  const { data } = await p
  if (!data.success) throw new Error(data.message ?? 'Error del servidor')
  return data.data
}

export interface Expense {
  id: number
  tripId: number
  description: string
  city: string
  paymentDate: string
  amount: number
  exchangeRate: number
  observations: string
  categoryId: number
  categoryName: string
  paymentMethodId: number
  paymentMethodName: string
  currencyId: number
  currencyCode: string
  currencySymbol: string
}

export interface CreateExpenseRequest {
  description: string
  city: string
  paymentDate: string
  amount: number
  exchangeRate: number
  observations: string
  categoryId: number
  paymentMethodId: number
  currencyId: number
}

export interface LookupItem { id: number; name: string }
export interface Currency { id: number; code: string; name: string; symbol: string }

export const getExpenses = (tripId: number) =>
  unwrap<Expense[]>(api.get(`/api/trips/${tripId}/expenses`, { headers: h() }))

export const createExpense = (tripId: number, body: CreateExpenseRequest) =>
  unwrap<Expense>(api.post(`/api/trips/${tripId}/expenses`, body, { headers: h() }))

export const deleteExpense = (tripId: number, id: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/expenses/${id}`, { headers: h() }))

export const getCategories = () =>
  unwrap<LookupItem[]>(api.get('/api/expense-categories', { headers: h() }))

export const getPaymentMethods = () =>
  unwrap<LookupItem[]>(api.get('/api/payment-methods', { headers: h() }))

export const getCurrencies = () =>
  unwrap<Currency[]>(api.get('/api/currencies', { headers: h() }))
