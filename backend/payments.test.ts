import { describe, expect, it } from 'vitest'
import { paymentMethodsSchema, publicPaymentMethods } from './payments.js'

const configured = [
  { id: 'pix', label: 'Pix', active: true, order: 2, instruction: 'Use a chave abaixo.', pixKey: 'pix@cantinho.test' },
  { id: 'cash', label: 'Dinheiro', active: true, order: 1, instruction: '', pixKey: '' },
  { id: 'debit', label: 'Débito', active: false, order: 0, instruction: '', pixKey: '' },
  { id: 'credit', label: 'Crédito', active: false, order: 3, instruction: '', pixKey: '' },
] as const

describe('payment configuration', () => {
  it('returns only active methods in configured order', () => {
    expect(publicPaymentMethods(configured).map((method) => method.id)).toEqual(['cash', 'pix'])
  })

  it('keeps Pix instructions and key for checkout', () => {
    expect(publicPaymentMethods(configured).find((method) => method.id === 'pix')).toMatchObject({ instruction: 'Use a chave abaixo.', pixKey: 'pix@cantinho.test' })
  })

  it('does not expose inactive Pix, debit or credit methods', () => {
    const methods = configured.map((method) => method.id === 'pix' || method.id === 'debit' || method.id === 'credit' ? { ...method, active: false } : method)
    expect(publicPaymentMethods(methods).map((method) => method.id)).toEqual(['cash'])
  })

  it('requires every stable payment method exactly once', () => {
    expect(() => paymentMethodsSchema.parse(configured.slice(0, 3))).toThrow()
    expect(() => paymentMethodsSchema.parse([...configured, configured[0]])).toThrow()
  })
})
