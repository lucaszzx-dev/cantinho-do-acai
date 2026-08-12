import { beforeEach, describe, expect, it } from 'vitest'
import { PRODUCTS } from '../data/products'
import type { CartItem } from '../types/domain'
import { cartConfigurationLabels, orderItemPayload } from './cartConfiguration'
import { CART_STORAGE_KEY, loadStoredCart, saveStoredCart } from './cartStorage'
import { cartTotal } from './pricing'

const storage = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) } })

const item: CartItem = { uid: 'item-1', productId: 'acai-tradicional', productName: 'Açaí Tradicional', category: 'monte-seu-acai', variantId: '300ml', variantName: '300ml', selections: { adicionais: ['bis'], acompanhamentos: [] }, quantity: 1, unitPrice: 22.9 }

describe('configured visitor cart item', () => {
  beforeEach(() => storage.clear())

  it('preserves variant and additions in cart storage after navigation or refresh', () => {
    saveStoredCart([item])
    expect(loadStoredCart()).toEqual([item])
    expect(JSON.parse(storage.get(CART_STORAGE_KEY)!)).toMatchObject({ version: 2, items: [{ variantId: '300ml', selections: { adicionais: ['bis'] } }] })
  })

  it('migrates full API identifiers already stored by the older catalog response', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 2, items: [{ ...item, variantId: 'acai-tradicional:300ml', selections: { 'acai-tradicional:adicionais': ['acai-tradicional:adicionais:bis'] } }] }))
    expect(loadStoredCart()[0]).toMatchObject({ variantId: '300ml', selections: { adicionais: ['bis'] } })
  })

  it('shows the variant and selected addition in the order review data', () => {
    expect(cartConfigurationLabels(item, PRODUCTS.find((product) => product.id === item.productId))).toEqual(['300ml', 'Bis'])
  })

  it('uses the configured price and sends selections in the order payload', () => {
    expect(cartTotal([item])).toBe(22.9)
    expect(orderItemPayload([item])).toEqual([{ productId: 'acai-tradicional', variantId: '300ml', quantity: 1, selections: { adicionais: ['bis'], acompanhamentos: [] } }])
  })
})
