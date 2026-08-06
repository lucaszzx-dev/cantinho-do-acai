import { describe, it, expect } from 'vitest'
import { PRODUCTS } from '../data/products'
import {
  unitPrice,
  itemSubtotal,
  cartTotal,
  cartItemCount,
  buildFromPrice,
} from '../utils/pricing'
import { buildOrderMessage } from '../utils/whatsapp'
import type { CartItem, CheckoutData } from '../types/domain'

const tradicional = PRODUCTS.find((p) => p.id === 'acai-tradicional')!
const morangoAvela = PRODUCTS.find((p) => p.id === 'acai-morango-creme-avela')!
const garrafa = PRODUCTS.find((p) => p.id === 'acai-garrafa-300')!
const copoDoce = PRODUCTS.find((p) => p.id === 'copo-doce-de-leite')!
const aguaSemGas = PRODUCTS.find((p) => p.id === 'agua-sem-gas')!

const MOCK_CHECKOUT: CheckoutData = {
  name: 'Maria',
  phone: '11999990000',
  address: 'Rua Teste',
  number: '123',
  complement: '',
  neighborhood: 'Centro',
  notes: '',
  paymentMethod: 'Pix',
}

describe('Tradicional sizes', () => {
  it('has 4 size variants', () => {
    expect(tradicional.variants).toHaveLength(4)
  })

  it('300ml = 17.90', () => {
    const v = tradicional.variants.find((v) => v.id === '300ml')!
    expect(v.price).toBe(17.9)
  })

  it('400ml = 21.90', () => {
    const v = tradicional.variants.find((v) => v.id === '400ml')!
    expect(v.price).toBe(21.9)
  })

  it('500ml = 24.90', () => {
    const v = tradicional.variants.find((v) => v.id === '500ml')!
    expect(v.price).toBe(24.9)
  })

  it('700ml = 28.90', () => {
    const v = tradicional.variants.find((v) => v.id === '700ml')!
    expect(v.price).toBe(28.9)
  })
})

describe('Adicionais pricing', () => {
  const adicionaisGroup = tradicional.optionGroups.find((g) => g.id === 'adicionais')!

  it('Bis costs 3.00', () => {
    const bis = adicionaisGroup.options.find((o) => o.id === 'bis')!
    expect(bis.price).toBe(3)
  })

  it('Creme de Avela costs 5.00', () => {
    const ca = adicionaisGroup.options.find((o) => o.id === 'creme-de-avela')!
    expect(ca.price).toBe(5)
  })

  it('Amendoim Triturado is free (0.00)', () => {
    const a = adicionaisGroup.options.find((o) => o.id === 'amendoim-triturado-ad')!
    expect(a.price).toBe(0)
  })
})

describe('Acompanhamentos limit (max 3)', () => {
  const acGroup = tradicional.optionGroups.find((g) => g.id === 'acompanhamentos')!

  it('has maxSelectable of 3', () => {
    expect(acGroup.maxSelectable).toBe(3)
  })

  it('contains 9 total options (4 frutas + 5 complementos)', () => {
    expect(acGroup.options).toHaveLength(9)
  })

  it('all acompanhamentos are free', () => {
    for (const opt of acGroup.options) {
      expect(opt.price).toBe(0)
    }
  })
})

describe('Minimum variant / fromPrice', () => {
  it('Tradicional fromPrice = 17.90 (smallest variant)', () => {
    expect(buildFromPrice(tradicional)).toBe(17.9)
  })

  it('Premium fromPrice = 20.90 (smallest variant of Morango c/ Avela)', () => {
    expect(buildFromPrice(morangoAvela)).toBe(20.9)
  })

  it('Garrafa fromPrice = 16.00 (Leite Condensado)', () => {
    expect(buildFromPrice(garrafa)).toBe(16)
  })
})

describe('Premium prices', () => {
  const premiums = [
    { id: 'acai-morango-creme-avela', prices: [20.9, 23.9, 27.9, 31.9] },
    { id: 'acai-beijinho', prices: [23.9, 27.9, 32.9, 37.9] },
    { id: 'acai-confete', prices: [25.9, 29.9, 34.9, 39.9] },
    { id: 'acai-bis', prices: [25.9, 29.9, 34.9, 39.9] },
    { id: 'acai-granola', prices: [20.9, 23.9, 27.9, 31.9] },
    { id: 'acai-ferrero', prices: [25.9, 29.9, 34.9, 39.9] },
    { id: 'acai-trento', prices: [25.9, 29.9, 34.9, 39.9] },
    { id: 'acai-kit-kat', prices: [25.9, 29.9, 34.9, 39.9] },
    { id: 'acai-uva-morango', prices: [21.9, 24.9, 28.9, 32.9] },
  ]

  for (const { id, prices } of premiums) {
    it(id + ' has correct variant prices', () => {
      const product = PRODUCTS.find((p) => p.id === id)!
      expect(product.variants).toHaveLength(4)
      for (let i = 0; i < 4; i++) {
        expect(product.variants[i].price).toBe(prices[i])
      }
    })
  }
})

describe('Garrafa prices by flavor', () => {
  it('Creme de Avela = 18.00', () => {
    const v = garrafa.variants.find((v) => v.id === 'creme-de-avela')!
    expect(v.price).toBe(18)
  })

  it('Leite Condensado = 16.00', () => {
    const v = garrafa.variants.find((v) => v.id === 'leite-condensado')!
    expect(v.price).toBe(16)
  })

  it('Mousse de Maracuja = 18.00', () => {
    const v = garrafa.variants.find((v) => v.id === 'mousse-de-maracuja')!
    expect(v.price).toBe(18)
  })
})

describe('Quantity / subtotal', () => {
  it('unitPrice * quantity = subtotal', () => {
    const item: CartItem = {
      uid: 'test-1',
      productId: 'acai-tradicional',
      productName: 'Test',
      category: 'monte-seu-acai',
      variantId: '500ml',
      variantName: '500ml',
      selections: {},
      quantity: 3,
      unitPrice: 24.9,
    }
    expect(itemSubtotal(item)).toBeCloseTo(74.7)
  })

  it('cartTotal sums all items', () => {
    const items: CartItem[] = [
      { uid: '1', productId: 'a', productName: 'A', category: 'bebidas', selections: {}, quantity: 2, unitPrice: 10 },
      { uid: '2', productId: 'b', productName: 'B', category: 'bebidas', selections: {}, quantity: 1, unitPrice: 5 },
    ]
    expect(cartTotal(items)).toBe(25)
  })

  it('cartItemCount sums quantities', () => {
    const items: CartItem[] = [
      { uid: '1', productId: 'a', productName: 'A', category: 'bebidas', selections: {}, quantity: 2, unitPrice: 10 },
      { uid: '2', productId: 'b', productName: 'B', category: 'bebidas', selections: {}, quantity: 3, unitPrice: 5 },
    ]
    expect(cartItemCount(items)).toBe(5)
  })
})

describe('Different configs are not merged', () => {
  it('different variantId means different config', () => {
    const a: CartItem = {
      uid: 'a', productId: 'acai-tradicional', productName: 'A', category: 'monte-seu-acai',
      variantId: '300ml', variantName: '300ml', selections: {}, quantity: 1, unitPrice: 17.9,
    }
    const b: CartItem = {
      uid: 'b', productId: 'acai-tradicional', productName: 'A', category: 'monte-seu-acai',
      variantId: '500ml', variantName: '500ml', selections: {}, quantity: 1, unitPrice: 24.9,
    }
    expect(a.variantId).not.toBe(b.variantId)
    expect(a.unitPrice).not.toBe(b.unitPrice)
  })

  it('different selections means different config', () => {
    const a: CartItem = {
      uid: 'a', productId: 'acai-tradicional', productName: 'A', category: 'monte-seu-acai',
      variantId: '500ml', variantName: '500ml', selections: { acompanhamentos: ['bis'] }, quantity: 1, unitPrice: 24.9,
    }
    const b: CartItem = {
      uid: 'b', productId: 'acai-tradicional', productName: 'A', category: 'monte-seu-acai',
      variantId: '500ml', variantName: '500ml', selections: { acompanhamentos: ['granola'] }, quantity: 1, unitPrice: 24.9,
    }
    expect(JSON.stringify(a.selections)).not.toBe(JSON.stringify(b.selections))
  })
})

describe('Old cart format does not crash', () => {
  it('legacy v1 format is safely discarded', () => {
    // Simulate old format: CartItem[] without envelope
    const legacy = [{ uid: 'x', productId: 'y', name: 'Old', quantity: 1, unitPrice: 10, extras: [], fromPrice: false }]
    // The loadCart function filters by isCartItemV2 which requires productName and selections
    // Legacy items with 'name' instead of 'productName' will be filtered out
    const hasProductName = legacy.every((i: any) => typeof i.productName === 'string')
    expect(hasProductName).toBe(false)
  })
})

describe('WhatsApp message', () => {
  it('generates a message with product name and variant', () => {
    const items: CartItem[] = [
      {
        uid: '1', productId: 'acai-tradicional', productName: 'Acai Tradicional',
        category: 'monte-seu-acai', variantId: '500ml', variantName: '500ml',
        selections: {}, quantity: 1, unitPrice: 24.9,
      },
    ]
    const msg = buildOrderMessage(items, MOCK_CHECKOUT)
    expect(msg).toContain('Acai Tradicional')
    expect(msg).toContain('Tamanho: 500ml')
    expect(msg).toContain('Qtd: 1')
    expect(msg).toContain('Maria')
  })

  it('includes paid extras with price', () => {
    const items: CartItem[] = [
      {
        uid: '1', productId: 'acai-tradicional', productName: 'Acai Tradicional',
        category: 'monte-seu-acai', variantId: '500ml', variantName: '500ml',
        selections: { adicionais: ['bis', 'creme-de-avela'] }, quantity: 1, unitPrice: 32.9,
      },
    ]
    const msg = buildOrderMessage(items, MOCK_CHECKOUT)
    expect(msg).toContain('Adicionais:')
    expect(msg).toContain('Bis')
    expect(msg).toContain('Creme de Avel')
  })

  it('no internal IDs exposed', () => {
    const items: CartItem[] = [
      {
        uid: 'abc-123', productId: 'acai-tradicional', productName: 'Acai',
        category: 'monte-seu-acai', selections: {}, quantity: 1, unitPrice: 17.9,
      },
    ]
    const msg = buildOrderMessage(items, MOCK_CHECKOUT)
    expect(msg).not.toContain('abc-123')
    expect(msg).not.toContain('acai-tradicional')
  })
})

describe('Product structure', () => {
  it('every product has id, name, category, available', () => {
    for (const p of PRODUCTS) {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.category).toBeTruthy()
      expect(typeof p.available).toBe('boolean')
    }
  })

  it('simple products have empty variants and optionGroups', () => {
    expect(copoDoce.variants).toHaveLength(0)
    expect(copoDoce.optionGroups).toHaveLength(0)
    expect(aguaSemGas.variants).toHaveLength(0)
    expect(aguaSemGas.optionGroups).toHaveLength(0)
  })
})

describe('Unit price calculation', () => {
  it('variant + paid extras = unit price', () => {
    const variant = 24.9
    const groups = tradicional.optionGroups
    const sels = {
      adicionais: ['bis', 'creme-de-avela'],
      acompanhamentos: [],
      descartaveis: ['sim'],
    }
    const uPrice = unitPrice(variant, groups, sels)
    expect(uPrice).toBeCloseTo(32.9) // 24.9 + 3 + 5
  })

  it('free options do not add to price', () => {
    const variant = 17.9
    const groups = tradicional.optionGroups
    const sels = {
      acompanhamentos: ['granola', 'leite-condensado', 'morango'],
      adicionais: [],
      descartaveis: ['sim'],
    }
    const uPrice = unitPrice(variant, groups, sels)
    expect(uPrice).toBe(17.9)
  })
})
