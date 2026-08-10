import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest } from '../api/client'

export type Customer = { id: string; name: string; phone: string; email?: string }
type CustomerState = { status: 'loading' | 'authenticated' | 'anonymous' | 'error'; customer: Customer | null; refresh: () => Promise<void>; logout: () => Promise<void> }
const CustomerContext = createContext<CustomerState | null>(null)

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CustomerState['status']>('loading'); const [customer, setCustomer] = useState<Customer | null>(null)
  const refresh = async () => { try { const response = await apiRequest('/api/customers/auth/me'); if (response.status === 401) { setCustomer(null); setStatus('anonymous'); return }; if (!response.ok) throw new Error('session_failed'); setCustomer(await response.json()); setStatus('authenticated') } catch { setCustomer(null); setStatus('error') } }
  useEffect(() => { void refresh() }, [])
  const logout = async () => { await apiRequest('/api/customers/auth/logout', { method: 'POST' }); setCustomer(null); setStatus('anonymous') }
  return <CustomerContext.Provider value={useMemo(() => ({ status, customer, refresh, logout }), [status, customer])}>{children}</CustomerContext.Provider>
}
export function useCustomerSession() { const value = useContext(CustomerContext); if (!value) throw new Error('useCustomerSession must be used inside CustomerProvider'); return value }
