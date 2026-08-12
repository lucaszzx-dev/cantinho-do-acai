import { describe, expect, it, vi } from 'vitest'
import { generate } from 'otplib'

const state = vi.hoisted(() => ({ admin: { id: 'admin-1', email: 'admin@example.com', active: true, mfaSecret: null as string | null, mfaEnabled: false }, codes: [] as Array<{ id: string; adminId: string; codeHash: string; usedAt: Date | null }> }))
const database = vi.hoisted(() => {
  const rows = (fields?: Record<string, unknown>) => fields ? [{ secret: state.admin.mfaSecret, active: state.admin.active, enabled: state.admin.mfaEnabled, email: state.admin.email }] : state.codes.filter((code) => !code.usedAt)
  const query = (fields?: Record<string, unknown>) => ({ from: () => ({ where: () => ({ limit: async () => rows(fields), then: (resolve: (value: unknown) => unknown) => resolve(rows(fields)) }) }) })
  const update = () => ({ set: (values: Record<string, unknown>) => {
    if ('mfaSecret' in values) state.admin.mfaSecret = values.mfaSecret as string
    if ('mfaEnabled' in values) state.admin.mfaEnabled = values.mfaEnabled as boolean
    return { where: () => ({ returning: async () => {
    if (!('usedAt' in values)) return []
    const code = state.codes.find((item) => !item.usedAt)
    if (!code) return []
    code.usedAt = values.usedAt as Date
    return [{ id: code.id }]
    } }) }
  } })
  const db = { select: query, update, insert: () => ({ values: async (values: typeof state.codes | Record<string, unknown>) => { if (Array.isArray(values)) state.codes.push(...values) } }) }
  return { db: { ...db, transaction: async (callback: (tx: typeof db) => Promise<void>) => callback(db) } }
})

vi.mock('./db/client.js', () => database)
vi.mock('./audit.js', () => ({ shouldWriteAdminAudit: vi.fn(() => false), writeAdminAudit: vi.fn() }))

import { buildApp } from './app.js'
import type { CatalogRepository } from './catalog/repository.js'

const repo: CatalogRepository = { getStore: async () => undefined, getCategories: async () => [], getProducts: async () => [], getProductBySlug: async () => undefined }
describe('admin MFA real TOTP integration', () => {
  it('confirms an otplib token and consumes a bcrypt-hashed backup code once', async () => {
    state.admin = { id: 'admin-1', email: 'admin@example.com', active: true, mfaSecret: null, mfaEnabled: false }; state.codes = []
    const app = buildApp(repo); await app.ready()
    const pending = app.signCookie(Buffer.from(JSON.stringify({ adminId: state.admin.id, flow: 'enroll', nonce: 'nonce' })).toString('base64url'))
    const enrollment = await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/enroll', headers: { cookie: `cantinho_admin_pending=${pending}` } })
    const secret = new URL(enrollment.json().otpauthUri).searchParams.get('secret')!
    const repeatedEnrollment = await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/enroll', headers: { cookie: `cantinho_admin_pending=${pending}` } })
    expect(new URL(repeatedEnrollment.json().otpauthUri).searchParams.get('secret')).toBe(secret)
    const confirmation = await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/enroll/confirm', headers: { cookie: `cantinho_admin_pending=${pending}` }, payload: { code: await generate({ secret }) } })
    expect(confirmation.statusCode).toBe(200); expect(confirmation.json().backupCodes).toHaveLength(10)
    const backupCode = confirmation.json().backupCodes[0]
    const verifyPending = app.signCookie(Buffer.from(JSON.stringify({ adminId: state.admin.id, flow: 'verify', nonce: 'nonce-2' })).toString('base64url'))
    expect((await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/verify', headers: { cookie: `cantinho_admin_pending=${verifyPending}` }, payload: { code: backupCode } })).statusCode).toBe(200)
    expect((await app.inject({ method: 'POST', url: '/api/admin/auth/mfa/verify', headers: { cookie: `cantinho_admin_pending=${verifyPending}` }, payload: { code: backupCode } })).statusCode).toBe(401)
    await app.close()
  }, 15_000)
})
