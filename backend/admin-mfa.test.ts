import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ authenticateAdmin: vi.fn(), verifyMfaCode: vi.fn() }))

vi.mock('./admin-auth.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('./admin-auth.js')>(),
  authenticateAdmin: mocks.authenticateAdmin,
  verifyMfaCode: mocks.verifyMfaCode,
}))
vi.mock('./audit.js', () => ({ shouldWriteAdminAudit: vi.fn(() => false), writeAdminAudit: vi.fn() }))

import { buildApp } from './app.js'
import type { CatalogRepository } from './catalog/repository.js'

const repo: CatalogRepository = { getStore: async () => undefined, getCategories: async () => [], getProducts: async () => [], getProductBySlug: async () => undefined }
const admin = { id: 'admin-1', name: 'Admin', email: 'admin@example.com', active: true, passwordHash: '', mfaSecret: 'secret', mfaEnabled: true, createdAt: new Date(), updatedAt: new Date() }

function cookie(response: { headers: Record<string, string | string[] | number | undefined> }) {
  const cookies = response.headers['set-cookie']
  return (Array.isArray(cookies) ? cookies : [String(cookies)]).find((value) => value.startsWith('cantinho_admin_pending='))!.split(';')[0]
}

describe('admin MFA login flow', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.authenticateAdmin.mockResolvedValue(admin) })
  it('does not issue a full session before MFA enrollment', async () => {
    mocks.authenticateAdmin.mockResolvedValue({ ...admin, mfaEnabled: false })
    const app = buildApp(repo); await app.ready()
    const response = await app.inject({ method: 'POST', url: '/api/admin/auth/login', payload: { email: admin.email, password: 'password-123' } })
    expect(response.statusCode).toBe(200); expect(response.json()).toEqual({ next: 'enroll' }); expect(cookie(response)).toContain('cantinho_admin_pending='); expect(cookie(response)).not.toContain('cantinho_admin=')
    expect((await app.inject('/api/admin/auth/me')).statusCode).toBe(401)
    await app.close()
  })
  it('rejects an invalid TOTP code', async () => {
    mocks.verifyMfaCode.mockResolvedValue(false)
    const app = buildApp(repo); await app.ready()
    const login = await app.inject({ method: 'POST', url: '/api/admin/auth/login', payload: { email: admin.email, password: 'password-123' } })
    const response = await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/verify', headers: { cookie: cookie(login) }, payload: { code: '000000' } })
    expect(response.statusCode).toBe(401); expect(response.json()).toEqual({ error: 'invalid_mfa_code' }); await app.close()
  })
  it('accepts a backup code once and rejects its reuse', async () => {
    mocks.verifyMfaCode.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const app = buildApp(repo); await app.ready()
    const login = await app.inject({ method: 'POST', url: '/api/admin/auth/login', payload: { email: admin.email, password: 'password-123' } })
    expect((await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/verify', headers: { cookie: cookie(login) }, payload: { code: 'BACKUP-CODE' } })).statusCode).toBe(200)
    expect((await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/verify', headers: { cookie: cookie(login) }, payload: { code: 'BACKUP-CODE' } })).statusCode).toBe(401)
    await app.close()
  })
  it('rate limits MFA verification after five attempts', async () => {
    mocks.verifyMfaCode.mockResolvedValue(false)
    const app = buildApp(repo); await app.ready()
    const login = await app.inject({ method: 'POST', url: '/api/admin/auth/login', payload: { email: admin.email, password: 'password-123' } })
    for (let attempt = 0; attempt < 5; attempt++) expect((await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/verify', headers: { cookie: cookie(login) }, payload: { code: '000000' } })).statusCode).toBe(401)
    expect((await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/verify', headers: { cookie: cookie(login) }, payload: { code: '000000' } })).statusCode).toBe(429)
    await app.close()
  })
})
