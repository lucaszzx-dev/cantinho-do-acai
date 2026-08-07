import { beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from './app.js'
import type { CatalogRepository } from './catalog/repository.js'
import { PRODUCTS } from '../src/data/products'
import { normalizePhone } from './customers.js'

const product = { id: 'acai', slug: 'acai', name: 'Açaí', category: 'monte-seu-acai', available: true, price: 17.9, fromPrice: true, variants: [{ id: '300ml', name: '300ml', price: 17.9 }], optionGroups: [{ id: 'extras', label: 'Extras', type: 'multi', required: false, options: [{ id: 'bis', name: 'Bis', price: 3 }] }] }
const repo: CatalogRepository = { getStore: async () => ({ name: 'Cantinho' }), getCategories: async () => [{ id: 'monte-seu-acai', name: 'Monte Seu Açaí' }], getProducts: async () => [product], getProductBySlug: async (slug) => slug === 'acai' ? product : undefined }

describe('catalog API', () => {
  const app = buildApp(repo)
  beforeEach(async () => app.ready())
  it('returns health', async () => expect((await app.inject('/health')).json()).toEqual({ status: 'ok' }))
  it('returns categories and products with variants/options', async () => { expect((await app.inject('/api/categories')).statusCode).toBe(200); const body = (await app.inject('/api/products')).json(); expect(body[0].variants[0].id).toBe('300ml'); expect(body[0].optionGroups[0].options[0].id).toBe('bis') })
  it('returns a product by slug and 404 otherwise', async () => { expect((await app.inject('/api/products/acai')).statusCode).toBe(200); expect((await app.inject('/api/products/missing')).statusCode).toBe(404) })
  it('protects the administrative order queue', async () => { expect((await app.inject('/api/admin/orders')).statusCode).toBe(401) })
  it('does not reveal orders to malformed public tracking tokens', async () => { expect((await app.inject('/api/orders/public/not-a-valid-token')).statusCode).toBe(404) })
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
