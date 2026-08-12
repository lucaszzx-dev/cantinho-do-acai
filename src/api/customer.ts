import { apiRequest } from './client'
export interface CustomerSession { id: string; name: string; phone: string }
export async function saveCustomerSession(name: string, phone: string): Promise<CustomerSession> {
  const response = await apiRequest('/api/customers/session', { method: 'POST', body: JSON.stringify({ name, phone }) })
  if (!response.ok) throw new Error('Não foi possível salvar sua identificação.')
  return response.json() as Promise<CustomerSession>
}
export async function updateCustomerProfile(input: { name: string; phone: string; address: { address: string; number: string; complement?: string; neighborhood: string } }) {
  const response = await apiRequest('/api/customers/me', { method: 'PATCH', body: JSON.stringify(input) })
  if (!response.ok) throw new Error('Não foi possível salvar seus dados.')
  return response.json()
}
