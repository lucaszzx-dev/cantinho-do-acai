import { apiRequest } from './client'

export type PublicPaymentMethod = { id: 'pix' | 'cash' | 'debit' | 'credit'; label: string; instruction?: string; pixKey?: string }

export async function getPaymentMethods() {
  const response = await apiRequest('/api/payments')
  if (!response.ok) throw new Error('Não foi possível carregar as formas de pagamento.')
  return response.json() as Promise<PublicPaymentMethod[]>
}
