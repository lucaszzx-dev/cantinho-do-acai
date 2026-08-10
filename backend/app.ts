import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import Fastify from 'fastify'
import { z } from 'zod'
import { env } from './env.js'
import { postgresCatalogRepository, type CatalogRepository } from './catalog/repository.js'
import { authenticateCustomer, createCustomerSession, getCustomer, registerCustomer } from './customers.js'
import { db } from './db/client.js'
import { categories, orders, products, storeConfig } from './db/schema.js'
import { desc, eq, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { adminCookie, authenticateAdmin } from './admin-auth.js'
import { createOrder, getCustomerOrders, getOrder, getPublicOrder, orderStatuses, updateOrderStatus } from './orders.js'
import { paymentMethodsSchema, publicPaymentMethods } from './payments.js'

export function buildApp(repository: CatalogRepository = postgresCatalogRepository) {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info', redact: ['req.headers.authorization'] } })
  app.register(cors, { origin: env.FRONTEND_ORIGIN, credentials: true })
  app.register(cookie, { secret: env.ADMIN_SESSION_SECRET ?? 'development-only-change-me' })
  app.register(rateLimit, { global: false })
  const customerCookie = 'cantinho_customer'
  app.addHook('onRequest', async (request, reply) => {
    if (!request.url.startsWith('/api/admin/') || request.url.startsWith('/api/admin/auth/')) return
    const session = request.unsignCookie(request.cookies[adminCookie] ?? '')
    if (!session.valid) return reply.status(401).send({ error: 'admin_unauthorized' })
    request.headers['x-admin-id'] = session.value
  })
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof z.ZodError) return reply.status(400).send({ error: 'invalid_request' })
    if (error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) return reply.status(error.statusCode).send({ error: 'invalid_request' })
    app.log.error(error)
    reply.status(500).send({ error: 'internal_server_error' })
  })
  app.get('/health', async () => ({ status: 'ok' }))
  app.get('/ready', async (_request, reply) => { try { await db.execute(sql`select 1`); return { status: 'ready' } } catch { return reply.status(503).send({ status: 'not_ready' }) } })
  app.get('/api/store', async (_request, reply) => {
    const store = await repository.getStore()
    return store ?? reply.status(404).send({ error: 'store_not_found' })
  })
  app.get('/api/categories', async () => repository.getCategories())
  app.get('/api/products', async () => repository.getProducts())
  app.get('/api/payments', async () => {
    const [store] = await db.select({ paymentMethods: storeConfig.paymentMethods }).from(storeConfig).where(eq(storeConfig.id, 'default')).limit(1)
    return publicPaymentMethods(store?.paymentMethods)
  })
  const orderInput = z.object({ idempotencyKey: z.string().uuid(), customerId: z.string().uuid().optional(), customerName: z.string().min(2), phone: z.string().min(8), address: z.string().min(2), addressNumber: z.string().min(1), complement: z.string().optional(), neighborhood: z.string().min(2), notes: z.string().optional(), paymentMethod: z.string().min(2), needsChange: z.boolean().optional(), changeForCents: z.number().int().positive().optional(), items: z.array(z.object({ productId: z.string().min(1), variantId: z.string().optional(), quantity: z.number().int().positive(), selections: z.record(z.string(), z.array(z.string())) })).min(1) })
  app.post('/api/orders', async (request, reply) => { try { const input = orderInput.parse(request.body); const session = request.unsignCookie(request.cookies[customerCookie] ?? ''); const order = await createOrder({ ...input, customerId: session.valid ? session.value : undefined }); return reply.status(201).send({ orderNumber: order.number, publicAccessToken: order.publicAccessToken, status: order.status }) } catch (error) { if (error instanceof Error && /indisponível|Troco/.test(error.message)) return reply.status(400).send({ error: 'invalid_order', message: error.message }); throw error } })
  app.get('/api/orders/public/:token', async (request, reply) => { const parsed = z.object({ token: z.string().min(32).max(128) }).safeParse(request.params); if (!parsed.success) return reply.status(404).send({ error: 'order_not_found' }); const order = await getPublicOrder(parsed.data.token); return order ? { number: order.number, status: order.status, paymentMethod: order.paymentMethod, totalCents: order.totalCents, items: order.items, history: order.history } : reply.status(404).send({ error: 'order_not_found' }) })
  app.get('/api/admin/orders/:id', async (request, reply) => { const { id } = z.object({ id: z.string().uuid() }).parse(request.params); return (await getOrder(id)) ?? reply.status(404).send({ error: 'order_not_found' }) })
  app.patch('/api/admin/orders/:id/status', async (request, reply) => { const { id } = z.object({ id: z.string().uuid() }).parse(request.params); const { status } = z.object({ status: z.enum(orderStatuses) }).parse(request.body); const order = await updateOrderStatus(id, status); return order ?? reply.status(409).send({ error: 'invalid_status_transition' }) })
  app.post('/api/admin/auth/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const input = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(request.body)
    const user = await authenticateAdmin(input.email, input.password)
    if (!user) return reply.status(401).send({ error: 'invalid_credentials' })
    reply.setCookie(adminCookie, user.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production', signed: true, maxAge: 60 * 60 * 8 })
    return { id: user.id, name: user.name, email: user.email }
  })
  app.post('/api/admin/auth/logout', async (_request, reply) => { reply.clearCookie(adminCookie, { path: '/' }); return { ok: true } })
  app.get('/api/admin/auth/me', async (request, reply) => { const session = request.unsignCookie(request.cookies[adminCookie] ?? ''); if (!session.valid) return reply.status(401).send({ error: 'admin_unauthorized' }); return { id: session.value } })
  const productInput = z.object({ name: z.string().min(2), slug: z.string().min(2), categoryId: z.string().min(1), description: z.string().optional(), image: z.string().optional(), active: z.boolean().default(true), sortOrder: z.number().int().nonnegative().default(0), price: z.number().nonnegative(), fromPrice: z.boolean().default(false) })
  app.get('/api/admin/products', async () => repository.getProducts())
  app.get('/api/admin/orders', async () => db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100))
  app.post('/api/admin/products', async (request, reply) => {
    const input = productInput.parse(request.body)
    const [product] = await db.insert(products).values({ id: randomUUID(), ...input, basePriceCents: Math.round(input.price * 100) }).returning()
    return reply.status(201).send(product)
  })
  app.patch('/api/admin/products/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params)
    const input = productInput.partial().parse(request.body)
    const [product] = await db.update(products).set({ ...input, ...(input.price === undefined ? {} : { basePriceCents: Math.round(input.price * 100) }), updatedAt: new Date() }).where(eq(products.id, id)).returning()
    return product ?? reply.status(404).send({ error: 'product_not_found' })
  })
  app.get('/api/admin/categories', async () => repository.getCategories())
  app.patch('/api/admin/categories/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params)
    const input = z.object({ name: z.string().min(2).optional(), subtitle: z.string().nullable().optional(), sortOrder: z.number().int().nonnegative().optional(), active: z.boolean().optional() }).parse(request.body)
    const [category] = await db.update(categories).set({ ...input, updatedAt: new Date() }).where(eq(categories.id, id)).returning()
    return category ?? reply.status(404).send({ error: 'category_not_found' })
  })
  app.get('/api/admin/store', async () => repository.getStore())
  app.get('/api/admin/payments', async () => { const [store] = await db.select({ paymentMethods: storeConfig.paymentMethods }).from(storeConfig).where(eq(storeConfig.id, 'default')).limit(1); return paymentMethodsSchema.parse(store?.paymentMethods) })
  app.put('/api/admin/payments', async (request, reply) => { const paymentMethods = paymentMethodsSchema.parse(request.body); const result = await db.update(storeConfig).set({ paymentMethods, updatedAt: new Date() }).where(eq(storeConfig.id, 'default')).returning({ id: storeConfig.id }); if (result.length === 0) return reply.status(404).send({ error: 'store_not_found' }); return paymentMethods })
  app.patch('/api/admin/store', async (request) => {
    const input = z.object({ name: z.string().min(2).optional(), city: z.string().min(2).optional(), tagline: z.string().min(2).optional(), whatsappNumber: z.string().min(8).optional(), deliveryMode: z.string().min(2).optional(), minOrder: z.number().nonnegative().optional(), schedule: z.object({ override: z.enum(['auto', 'open', 'closed']).optional(), message: z.string().max(120).optional(), days: z.record(z.string(), z.object({ enabled: z.boolean(), opensAt: z.string().regex(/^\d\d:\d\d$/), closesAt: z.string().regex(/^\d\d:\d\d$/) })).optional() }).optional() }).parse(request.body)
    const [store] = await db.update(storeConfig).set({ ...input, ...(input.minOrder === undefined ? {} : { minOrderCents: Math.round(input.minOrder * 100) }), updatedAt: new Date() }).where(eq(storeConfig.id, 'default')).returning()
    return store
  })
  app.post('/api/customers/session', async (request, reply) => {
    const input = z.object({ name: z.string().trim().min(2).max(100), phone: z.string().min(8).max(30) }).parse(request.body)
    const customer = await createCustomerSession(input.name, input.phone)
    return reply.status(200).send({ id: customer.id, name: customer.name, phone: customer.phone })
  })
  const customerAuthInput = z.object({ name: z.string().trim().min(2).max(100), phone: z.string().min(8).max(30), email: z.string().email(), password: z.string().min(8).max(128) })
  app.post('/api/customers/auth/register', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => { try { const input = customerAuthInput.parse(request.body); const customer = await registerCustomer(input.name, input.phone, input.email, input.password); reply.setCookie(customerCookie, customer.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production', signed: true, maxAge: 60 * 60 * 24 * 30 }); return reply.status(201).send({ id: customer.id, name: customer.name, phone: customer.phone, email: customer.email }) } catch (error) { if (error instanceof Error && error.message === 'E-mail já cadastrado.') return reply.status(409).send({ error: 'email_taken' }); throw error } })
  app.post('/api/customers/auth/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => { const input = z.object({ email: z.string().email(), password: z.string().min(8).max(128) }).parse(request.body); const customer = await authenticateCustomer(input.email, input.password); if (!customer) return reply.status(401).send({ error: 'invalid_credentials' }); reply.setCookie(customerCookie, customer.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production', signed: true, maxAge: 60 * 60 * 24 * 30 }); return { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email } })
  app.post('/api/customers/auth/logout', async (_request, reply) => { reply.clearCookie(customerCookie, { path: '/' }); return { ok: true } })
  app.get('/api/customers/auth/me', async (request, reply) => { const session = request.unsignCookie(request.cookies[customerCookie] ?? ''); if (!session.valid) return reply.status(401).send({ error: 'customer_unauthorized' }); const customer = await getCustomer(session.value); return customer ? { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email } : reply.status(401).send({ error: 'customer_unauthorized' }) })
  app.get('/api/customers/me/orders', async (request, reply) => { const session = request.unsignCookie(request.cookies[customerCookie] ?? ''); if (!session.valid) return reply.status(401).send({ error: 'customer_unauthorized' }); return getCustomerOrders(session.value) })
  app.get('/api/customers/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const customer = await getCustomer(id)
    return customer ? { id: customer.id, name: customer.name, phone: customer.phone } : reply.status(404).send({ error: 'customer_not_found' })
  })
  app.get('/api/products/:slug', async (request, reply) => {
    const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params)
    const product = await repository.getProductBySlug(slug)
    return product ?? reply.status(404).send({ error: 'product_not_found' })
  })
  return app
}
