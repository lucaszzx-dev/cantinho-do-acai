import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from './db/client.js'
import { adminUsers } from './db/schema.js'

export const adminCookie = 'cantinho_admin'
export async function authenticateAdmin(email: string, password: string) { const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase())).limit(1); return user?.active && await bcrypt.compare(password, user.passwordHash) ? user : undefined }
export async function createAdmin(name: string, email: string, password: string) { const passwordHash = await bcrypt.hash(password, 12); return db.insert(adminUsers).values({ id: randomUUID(), name, email: email.toLowerCase(), passwordHash }) }
