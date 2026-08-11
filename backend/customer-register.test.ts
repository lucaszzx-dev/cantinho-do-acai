import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./customers.js', () => ({
  authenticateCustomer: vi.fn(),
  createCustomerSession: vi.fn(),
  getCustomer: vi.fn(),
  registerCustomer: vi.fn().mockRejectedValue(new Error('E-mail já cadastrado.')),
}))

import { buildApp } from './app.js'

describe('customer registration privacy', () => {
  const app = buildApp()
  beforeEach(async () => app.ready())

  it('returns a generic 201 response without a session cookie for an existing email', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/customers/auth/register', payload: { name: 'Cliente', phone: '11990000000', email: 'existing@example.com', password: 'password-123' } })
    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({ message: 'Cadastro recebido. Se já existe uma conta com esse e-mail, faça login normalmente.' })
    expect(response.headers['set-cookie']).toBeUndefined()
  })
})
