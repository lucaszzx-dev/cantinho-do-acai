import { desc, eq } from 'drizzle-orm'
import { randomBytes, randomUUID } from 'node:crypto'
import { db } from './db/client.js'
import { orderItems, orders, orderStatusHistory } from './db/schema.js'

export const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'] as const
export type OrderStatus = typeof orderStatuses[number]
const transitions: Record<OrderStatus, OrderStatus[]> = { pending: ['confirmed', 'cancelled'], confirmed: ['preparing', 'cancelled'], preparing: ['ready', 'cancelled'], ready: ['out_for_delivery', 'delivered'], out_for_delivery: ['delivered'], delivered: [], cancelled: [] }
export async function createOrder(input: any) {
  const [existing] = await db.select().from(orders).where(eq(orders.idempotencyKey, input.idempotencyKey)).limit(1)
  if (existing) return existing
  const subtotalCents = input.items.reduce((sum: number, item: any) => sum + Math.round(item.unitPrice * 100) * item.quantity, 0)
  const number = Number(`${Date.now()}`.slice(-6))
  const [order] = await db.insert(orders).values({ id: randomUUID(), number, publicAccessToken: randomBytes(32).toString('base64url'), customerId: input.customerId, customerName: input.customerName, phone: input.phone, address: input.address, addressNumber: input.addressNumber, complement: input.complement, neighborhood: input.neighborhood, notes: input.notes, paymentMethod: input.paymentMethod, subtotalCents, totalCents: subtotalCents, status: 'pending', idempotencyKey: input.idempotencyKey }).returning()
  await db.insert(orderItems).values(input.items.map((item: any) => ({ id: randomUUID(), orderId: order.id, productName: item.productName, variantName: item.variantName, quantity: item.quantity, unitPriceCents: Math.round(item.unitPrice * 100), subtotalCents: Math.round(item.unitPrice * 100) * item.quantity, options: item.options ?? [] })))
  await db.insert(orderStatusHistory).values({ id: randomUUID(), orderId: order.id, status: 'pending' })
  return order
}
export async function getOrder(id: string) { const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1); if (!order) return undefined; const [items, history] = await Promise.all([db.select().from(orderItems).where(eq(orderItems.orderId, id)), db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, id)).orderBy(desc(orderStatusHistory.createdAt))]); return { ...order, items, history } }
export async function getPublicOrder(token: string) { const [order] = await db.select().from(orders).where(eq(orders.publicAccessToken, token)).limit(1); return order ? getOrder(order.id) : undefined }
export async function updateOrderStatus(id: string, status: OrderStatus) { const order = await getOrder(id); if (!order || !transitions[order.status as OrderStatus].includes(status)) return undefined; const [updated] = await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id)).returning(); await db.insert(orderStatusHistory).values({ id: randomUUID(), orderId: id, status }); return updated }
