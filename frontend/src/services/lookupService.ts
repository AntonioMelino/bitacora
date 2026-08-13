import { api } from './api'

async function unwrap<T>(p: Promise<{ data: { success: boolean; data: T; message: string } }>): Promise<T> {
  const { data } = await p
  if (!data.success) throw new Error(data.message ?? 'Error del servidor')
  return data.data
}

export interface LookupItem { id: number; name: string }
export interface Currency { id: number; code: string; name: string; symbol: string }

// --- Expense categories ---
export const getCategories = () =>
  unwrap<LookupItem[]>(api.get('/api/expense-categories'))

export const createCategory = (name: string) =>
  unwrap<LookupItem>(api.post('/api/expense-categories', { name }))

export const deleteCategory = (id: number) =>
  unwrap<void>(api.delete(`/api/expense-categories/${id}`))

// --- Payment methods ---
export const getPaymentMethods = () =>
  unwrap<LookupItem[]>(api.get('/api/payment-methods'))

export const createPaymentMethod = (name: string) =>
  unwrap<LookupItem>(api.post('/api/payment-methods', { name }))

export const deletePaymentMethod = (id: number) =>
  unwrap<void>(api.delete(`/api/payment-methods/${id}`))

// --- Currencies ---
export const getCurrencies = () =>
  unwrap<Currency[]>(api.get('/api/currencies'))

export const createCurrency = (code: string, name: string, symbol: string) =>
  unwrap<Currency>(api.post('/api/currencies', { code, name, symbol }))

export const deleteCurrency = (id: number) =>
  unwrap<void>(api.delete(`/api/currencies/${id}`))
