import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../api/client'
import { getPaymentMethods } from '../api/payments'

afterEach(() => vi.unstubAllGlobals())

describe('public payment methods', () => {
  it('returns the persisted public methods from the API', async () => {
    const methods = [{ id: 'pix', label: 'Pix' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(methods), { status: 200 })))
    await expect(getPaymentMethods()).resolves.toEqual(methods)
  })

  it('does not send a JSON content type for a bodyless logout request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 })))
    await apiRequest('/api/customers/auth/logout', { method: 'POST' })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/customers/auth/logout', expect.objectContaining({ credentials: 'include', headers: {} }))
  })

  it('replaces network failures with a customer-friendly message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(getPaymentMethods()).rejects.toThrow('Não foi possível carregar as formas de pagamento. Tente novamente.')
  })
})
