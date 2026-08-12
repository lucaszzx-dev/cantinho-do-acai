import { randomUUID } from 'node:crypto'
import { db } from './db/client.js'
import { adminAuditLog } from './db/schema.js'

export type AuditInput = { adminId: string; action: string; entityType: string; entityId?: string; metadata?: Record<string, string> }

export function shouldWriteAdminAudit(method: string, path: string, statusCode: number, adminId: unknown) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && path.startsWith('/api/admin/') && !path.startsWith('/api/admin/auth/') && statusCode < 400 && typeof adminId === 'string'
}

export function adminAuditTarget(path: string) {
  const segments = path.split('/').filter(Boolean)
  return { entityType: segments[2] ?? 'admin', entityId: segments.length >= 5 ? segments[3] : segments.at(-1) }
}

export async function writeAdminAudit(input: AuditInput, database: any = db) {
  await database.insert(adminAuditLog).values({ id: randomUUID(), ...input })
}
