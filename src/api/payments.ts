import { apiRequest } from './client'
export type PublicPaymentMethod = { id: 'pix' | 'cash' | 'debit' | 'credit'; label: string; instruction?: string; pixKey?: string }
export async function getPaymentMethods() { try { const response = await apiRequest('/api/payments'); if (!response.ok) throw new Error('payment_unavailable'); return response.json() as Promise<PublicPaymentMethod[]> } catch { throw new Error('Não foi possível carregar as formas de pagamento. Tente novamente.') } }
