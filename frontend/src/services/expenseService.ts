import { api } from './api'

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
  unwrap<Expense[]>(api.get(`/api/trips/${tripId}/expenses`))

export const createExpense = (tripId: number, body: CreateExpenseRequest) =>
  unwrap<Expense>(api.post(`/api/trips/${tripId}/expenses`, body))

export const deleteExpense = (tripId: number, id: number) =>
  unwrap<void>(api.delete(`/api/trips/${tripId}/expenses/${id}`))

export const getCategories = () =>
  unwrap<LookupItem[]>(api.get('/api/expense-categories'))

export const getPaymentMethods = () =>
  unwrap<LookupItem[]>(api.get('/api/payment-methods'))

export const getCurrencies = () =>
  unwrap<Currency[]>(api.get('/api/currencies'))
