import { beforeEach, describe, expect, it, vi } from 'vitest'
import { completePersistedOrder } from './orderFlow'
import { loadOrderTokens, removeOrderToken, saveOrderToken } from './orderTokens'
import { buildMapsRouteUrl, isAllowedOrderStatus } from './orderDelivery'

const storage = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) } })

describe('customer order tokens', () => {
  beforeEach(() => storage.clear())
  it('saves a token once and preserves multiple local orders', () => {
    saveOrderToken('token-a'); saveOrderToken('token-a'); saveOrderToken('token-b')
    expect(loadOrderTokens()).toEqual(['token-b', 'token-a'])
  })
  it('removes invalid tokens without affecting remaining local orders', () => {
    saveOrderToken('token-a'); saveOrderToken('token-b'); removeOrderToken('token-a')
    expect(loadOrderTokens()).toEqual(['token-b'])
  })
})

describe('admin order queue actions', () => {
  it('creates an encoded Maps route and exposes delivery status actions', () => {
    expect(buildMapsRouteUrl('Rua Central', '12 A', 'Centro')).toContain('Rua%20Central%2C%2012%20A%2C%20Centro')
    expect(isAllowedOrderStatus('out_for_delivery')).toBe(true)
    expect(isAllowedOrderStatus('delivered')).toBe(true)
    expect(isAllowedOrderStatus('pending')).toBe(false)
  })
})

describe('checkout completion', () => {
  beforeEach(() => storage.clear())
  it('opens WhatsApp after persistence, saves the token, then clears the cart', () => {
    const events: string[] = []
    completePersistedOrder({ orderNumber: 1234, publicAccessToken: 'public-token' }, 'Pedido #1234', { openWhatsApp: vi.fn(() => events.push('whatsapp')), clearCart: vi.fn(() => events.push('clear')), navigate: vi.fn(() => events.push('navigate')) })
    expect(events).toEqual(['whatsapp', 'clear', 'navigate'])
    expect(loadOrderTokens()).toEqual(['public-token'])
  })
})
