const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
export interface CustomerSession { id: string; name: string; phone: string }
export async function saveCustomerSession(name: string, phone: string): Promise<CustomerSession> {
  const response = await fetch(`${baseUrl}/api/customers/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, phone }) })
  if (!response.ok) throw new Error('Não foi possível salvar sua identificação.')
  return response.json() as Promise<CustomerSession>
}
