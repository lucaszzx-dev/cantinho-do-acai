import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from './app.js'
import type { CatalogRepository } from './catalog/repository.js'
import { PRODUCTS } from '../src/data/products'
import { normalizePhone } from './customers.js'
import { adminAuditTarget, shouldWriteAdminAudit, writeAdminAudit } from './audit.js'

const product = { id: 'acai', slug: 'acai', name: 'Açaí', category: 'monte-seu-acai', available: true, price: 17.9, fromPrice: true, variants: [{ id: '300ml', name: '300ml', price: 17.9 }], optionGroups: [{ id: 'extras', label: 'Extras', type: 'multi', required: false, options: [{ id: 'bis', name: 'Bis', price: 3 }] }] }
const repo: CatalogRepository = { getStore: async () => ({ name: 'Cantinho' }), getCategories: async () => [{ id: 'monte-seu-acai', name: 'Monte Seu Açaí' }], getProducts: async () => [product], getProductBySlug: async (slug) => slug === 'acai' ? product : undefined }

describe('catalog API', () => {
  const app = buildApp(repo)
  beforeEach(async () => app.ready())
  it('returns health', async () => expect((await app.inject('/health')).json()).toEqual({ status: 'ok' }))
  it('sets restrictive security headers', async () => { const response = await app.inject('/health'); expect(response.headers['content-security-policy']).toContain("default-src 'none'"); expect(response.headers['x-frame-options']).toBe('DENY'); expect(response.headers['x-content-type-options']).toBe('nosniff'); expect(response.headers['referrer-policy']).toBe('no-referrer'); expect(response.headers['permissions-policy']).toContain('camera=()') })
  it('returns categories and products with variants/options', async () => { expect((await app.inject('/api/categories')).statusCode).toBe(200); const body = (await app.inject('/api/products')).json(); expect(body[0].variants[0].id).toBe('300ml'); expect(body[0].optionGroups[0].options[0].id).toBe('bis') })
  it('returns a product by slug and 404 otherwise', async () => { expect((await app.inject('/api/products/acai')).statusCode).toBe(200); expect((await app.inject('/api/products/missing')).statusCode).toBe(404) })
  it('protects the administrative order queue', async () => { expect((await app.inject('/api/admin/orders')).statusCode).toBe(401) })
  it('protects administrative payment configuration', async () => {
    expect((await app.inject('/api/admin/payments')).statusCode).toBe(401)
    expect((await app.inject({ method: 'PUT', url: '/api/admin/payments', payload: [] })).statusCode).toBe(401)
  })
  it('rejects a mutating request with an unexpected origin', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/customers/auth/logout', headers: { origin: 'https://attacker.example' } })
    expect(response.statusCode).toBe(403)
    expect(response.json()).toEqual({ error: 'invalid_origin' })
  })
  it('allows credentialed browser preflight for admin payment updates', async () => {
    const response = await app.inject({ method: 'OPTIONS', url: '/api/admin/payments', headers: { origin: 'http://localhost:5173', 'access-control-request-method': 'PUT', 'access-control-request-headers': 'content-type' } })
    expect(response.statusCode).toBe(204)
    expect(response.headers['access-control-allow-methods']).toContain('PUT')
    expect(response.headers['access-control-allow-credentials']).toBe('true')
  })
  it('does not reveal orders to malformed public tracking tokens', async () => { expect((await app.inject('/api/orders/public/not-a-valid-token')).statusCode).toBe(404) })
  it('does not expose customers by identifier', async () => { expect((await app.inject('/api/customers/00000000-0000-0000-0000-000000000000')).statusCode).toBe(404) })
  it('rejects invalid customer registration and protects customer session', async () => {
    expect((await app.inject({ method: 'POST', url: '/api/customers/auth/register', payload: { name: 'A', phone: '1', email: 'invalid', password: 'short' } })).statusCode).toBe(400)
    expect((await app.inject('/api/customers/auth/me')).statusCode).toBe(401)
  })
})

describe('seed identities', () => {
  it('creates unique database identities for repeated variant names', () => {
    const ids = PRODUCTS.flatMap((item) => item.variants.map((variant) => `${item.id}:${variant.id}`))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('customer phone normalization', () => {
  it('keeps a unique digits-only phone identity', () => {
    expect(normalizePhone('(11) 9 8016-9607')).toBe('11980169607')
  })
})

describe('admin audit log', () => {
  it('writes a record for a successful administrative mutation and skips failures', async () => {
    const values = vi.fn().mockResolvedValue(undefined)
    const database = { insert: vi.fn(() => ({ values })) }
    expect(shouldWriteAdminAudit('PATCH', '/api/admin/orders/order-1/status', 200, 'admin-1')).toBe(true)
    await writeAdminAudit({ adminId: 'admin-1', action: 'patch', entityType: 'orders', entityId: 'order-1', metadata: { path: '/api/admin/orders/order-1/status' } }, database)
    expect(values).toHaveBeenCalledOnce()
    expect(shouldWriteAdminAudit('PATCH', '/api/admin/orders/order-1/status', 409, 'admin-1')).toBe(false)
    expect(database.insert).toHaveBeenCalledOnce()
  })
  it('identifies the order itself as the audited resource for a status change', () => {
    expect(adminAuditTarget('/api/admin/orders/order-1/status')).toEqual({ entityType: 'orders', entityId: 'order-1' })
  })
})
