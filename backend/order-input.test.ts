import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ createOrder: vi.fn() }))
vi.mock('./orders.js', async (importOriginal) => ({ ...await importOriginal<typeof import('./orders.js')>(), createOrder: mocks.createOrder }))

import { buildApp } from './app.js'
import type { CatalogRepository } from './catalog/repository.js'

const repo: CatalogRepository = { getStore: async () => undefined, getCategories: async () => [], getProducts: async () => [], getProductBySlug: async () => undefined }

describe('order creation input', () => {
  it('forwards the selected variant and additions but never a client-supplied price', async () => {
    mocks.createOrder.mockResolvedValue({ number: 123, publicAccessToken: 'public-token', status: 'pending' })
    const app = buildApp(repo); await app.ready()

    const response = await app.inject({ method: 'POST', url: '/api/orders', payload: { idempotencyKey: 'd2b31a29-f2f8-4cd8-a1db-ef8192d05501', customerName: 'Cliente Teste', phone: '11999990000', address: 'Rua Teste', addressNumber: '1', neighborhood: 'Centro', paymentMethod: 'cash', items: [{ productId: 'acai-tradicional', variantId: '300ml', quantity: 1, selections: { adicionais: ['bis'] }, unitPrice: 1, totalCents: 1 }] } })

    expect(response.statusCode).toBe(201)
    expect(mocks.createOrder).toHaveBeenCalledWith(expect.objectContaining({ items: [{ productId: 'acai-tradicional', variantId: '300ml', quantity: 1, selections: { adicionais: ['bis'] } }], idempotencyKey: 'd2b31a29-f2f8-4cd8-a1db-ef8192d05501' }))
    expect(mocks.createOrder.mock.calls[0][0].items[0]).not.toHaveProperty('unitPrice')
    await app.close()
  })
})
