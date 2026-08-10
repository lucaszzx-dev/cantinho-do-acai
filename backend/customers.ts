import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { db } from './db/client.js'
import { customers } from './db/schema.js'

export const normalizePhone = (phone: string) => phone.replace(/\D/g, '')

export async function createCustomerSession(name: string, phone: string) {
  const normalizedPhone = normalizePhone(phone)
  const [existing] = await db.select().from(customers).where(eq(customers.phone, normalizedPhone)).limit(1)
  if (existing) {
    const [updated] = await db.update(customers).set({ name, updatedAt: new Date() }).where(eq(customers.id, existing.id)).returning()
    return updated
  }
  const [customer] = await db.insert(customers).values({ id: randomUUID(), name, phone: normalizedPhone }).returning()
  return customer
}

export async function getCustomer(id: string) {
  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
  return customer
}

export async function registerCustomer(name: string, phone: string, email: string, password: string) {
  const normalizedPhone = normalizePhone(phone)
  const normalizedEmail = email.toLowerCase()
  const [existing] = await db.select().from(customers).where(eq(customers.email, normalizedEmail)).limit(1)
  if (existing) throw new Error('E-mail já cadastrado.')
  const passwordHash = await bcrypt.hash(password, 12)
  const [customer] = await db.insert(customers).values({ id: randomUUID(), name, phone: normalizedPhone, email: normalizedEmail, passwordHash }).returning()
  return customer
}

export async function authenticateCustomer(email: string, password: string) {
  const [customer] = await db.select().from(customers).where(eq(customers.email, email.toLowerCase())).limit(1)
  return customer?.passwordHash && await bcrypt.compare(password, customer.passwordHash) ? customer : undefined
}
