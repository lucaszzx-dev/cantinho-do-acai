import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from './db/client.js'
import { adminBackupCodes, adminUsers } from './db/schema.js'
import { generateSecret, generateURI, verify } from 'otplib'

export const adminCookie = 'cantinho_admin'
export const adminPendingCookie = 'cantinho_admin_pending'

export async function authenticateAdmin(email: string, password: string) { const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase())).limit(1); return user?.active && await bcrypt.compare(password, user.passwordHash) ? user : undefined }
export async function createAdmin(name: string, email: string, password: string) { const passwordHash = await bcrypt.hash(password, 12); return db.insert(adminUsers).values({ id: randomUUID(), name, email: email.toLowerCase(), passwordHash }) }

export function createPendingSession(adminId: string, flow: 'enroll' | 'verify') {
  return Buffer.from(JSON.stringify({ adminId, flow, nonce: randomUUID() })).toString('base64url')
}

export function parsePendingSession(value: string): { adminId: string; flow: 'enroll' | 'verify'; nonce: string } | undefined {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    return typeof parsed.adminId === 'string' && (parsed.flow === 'enroll' || parsed.flow === 'verify') && typeof parsed.nonce === 'string' ? parsed : undefined
  } catch { return undefined }
}

export async function startMfaEnrollment(adminId: string, email: string) {
  const secret = generateSecret()
  await db.update(adminUsers).set({ mfaSecret: secret, mfaEnabled: false, updatedAt: new Date() }).where(eq(adminUsers.id, adminId))
  return generateURI({ issuer: 'Cantinho do Açaí', label: email, secret })
}

export async function confirmMfaEnrollment(adminId: string, token: string) {
  const [admin] = await db.select({ secret: adminUsers.mfaSecret, active: adminUsers.active, enabled: adminUsers.mfaEnabled }).from(adminUsers).where(eq(adminUsers.id, adminId)).limit(1)
  if (!admin?.active || admin.enabled || !admin.secret) return undefined
  const result = await verify({ secret: admin.secret, token })
  if (!result.valid) return undefined
  const backupCodes = Array.from({ length: 10 }, () => randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase())
  const codeHashes = await Promise.all(backupCodes.map((code) => bcrypt.hash(code, 12)))
  await db.transaction(async (tx) => {
    await tx.update(adminUsers).set({ mfaEnabled: true, updatedAt: new Date() }).where(eq(adminUsers.id, adminId))
    await tx.insert(adminBackupCodes).values(codeHashes.map((codeHash) => ({ id: randomUUID(), adminId, codeHash })))
  })
  return backupCodes
}

export async function verifyMfaCode(adminId: string, token: string) {
  const [admin] = await db.select({ secret: adminUsers.mfaSecret, active: adminUsers.active, enabled: adminUsers.mfaEnabled }).from(adminUsers).where(eq(adminUsers.id, adminId)).limit(1)
  if (!admin?.active || !admin.enabled || !admin.secret) return false
  if (/^\d{6}$/.test(token) && (await verify({ secret: admin.secret, token })).valid) return true
  const codes = await db.select().from(adminBackupCodes).where(and(eq(adminBackupCodes.adminId, adminId), isNull(adminBackupCodes.usedAt)))
  for (const code of codes) {
    if (await bcrypt.compare(token, code.codeHash)) {
      const used = await db.update(adminBackupCodes).set({ usedAt: new Date() }).where(and(eq(adminBackupCodes.id, code.id), isNull(adminBackupCodes.usedAt))).returning({ id: adminBackupCodes.id })
      return used.length === 1
    }
  }
  return false
}
