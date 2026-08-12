import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'
import { env } from './env.js'
import { postgresCatalogRepository, type CatalogRepository } from './catalog/repository.js'
import { authenticateCustomer, createCustomerSession, getCustomer, registerCustomer, updateCustomerProfile } from './customers.js'
import { db } from './db/client.js'
import { adminUsers, categories, optionGroups, orders, productOptions, products, productVariants, storeConfig } from './db/schema.js'
import { asc, desc, eq, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { adminCookie, adminPendingCookie, authenticateAdmin, confirmMfaEnrollment, createAdminSession, createPendingSession, getAdminSession, parsePendingSession, revokeAdminSession, startMfaEnrollment, verifyMfaCode } from './admin-auth.js'
import { createOrder, getCustomerOrders, getOrder, getPublicOrder, orderStatuses, updateOrderStatus } from './orders.js'
import { paymentMethodsSchema, publicPaymentMethods } from './payments.js'
import { adminAuditTarget, shouldWriteAdminAudit, writeAdminAudit } from './audit.js'

export function buildApp(repository: CatalogRepository = postgresCatalogRepository) {
  const app = Fastify({ trustProxy: env.TRUST_PROXY_HOPS > 0 ? env.TRUST_PROXY_HOPS : false, logger: { level: process.env.LOG_LEVEL ?? 'info', redact: ['req.headers.authorization'] } })
  app.register(helmet, { contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"], frameAncestors: ["'none'"] } }, frameguard: { action: 'deny' }, referrerPolicy: { policy: 'no-referrer' }, strictTransportSecurity: process.env.NODE_ENV === 'production' ? { maxAge: 15_552_000, includeSubDomains: true } : false })
  app.addHook('onSend', async (_request, reply) => { reply.header('Permissions-Policy', 'camera=(), geolocation=(), microphone=(), payment=(), usb=()') })
  app.register(cors, { origin: env.FRONTEND_ORIGIN, credentials: true, methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] })
  app.register(cookie, { secret: env.ADMIN_SESSION_SECRET ?? 'development-only-change-me' })
  app.register(rateLimit, { global: false })
  const customerCookie = 'cantinho_customer'
  const mfaAttempts = new Map<string, { count: number; resetAt: number }>()
  const sessionCookieOptions = { httpOnly: true, sameSite: 'lax' as const, path: '/', secure: process.env.NODE_ENV === 'production', signed: true }
  const pendingCookieOptions = { ...sessionCookieOptions, path: '/api/admin/auth/mfa', maxAge: 60 * 5 }
  app.addHook('onRequest', async (request, reply) => {
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
    const isProtectedMutation = request.url.startsWith('/api/admin/') || request.url.startsWith('/api/customers/')
    const origin = request.headers.origin
    if (isMutation && isProtectedMutation && origin && origin !== env.FRONTEND_ORIGIN) return reply.status(403).send({ error: 'invalid_origin' })
    if (!request.url.startsWith('/api/admin/') || request.url.startsWith('/api/admin/auth/')) return
    const signed = request.unsignCookie(request.cookies[adminCookie] ?? '')
    const session = signed.valid ? await getAdminSession(signed.value) : undefined
    if (!session) { reply.clearCookie(adminCookie, { path: '/' }); return reply.status(401).send({ error: 'admin_unauthorized' }) }
    request.headers['x-admin-id'] = session.adminId
    reply.header('cache-control', 'no-store, private')
  })
  app.addHook('onRequest', async (request, reply) => {
    const path = request.url.split('?')[0]
    if (request.method !== 'POST' || !['/api/admin/auth/mfa/verify', '/api/admin/auth/mfa/enroll/confirm'].includes(path)) return
    const key = `${path}:${request.ip}`; const now = Date.now(); const current = mfaAttempts.get(key)
    if (!current || current.resetAt <= now) { mfaAttempts.set(key, { count: 1, resetAt: now + 5 * 60 * 1000 }); return }
    if (current.count >= 5) return reply.status(429).send({ error: 'rate_limit_exceeded' })
    current.count += 1
  })
  app.addHook('onResponse', async (request, reply) => {
    const adminId = request.headers['x-admin-id']
    const path = request.url.split('?')[0]
    if (!shouldWriteAdminAudit(request.method, path, reply.statusCode, adminId)) return
    const target = adminAuditTarget(path)
    await writeAdminAudit({ adminId: adminId as string, action: request.method.toLowerCase(), ...target, metadata: { path } })
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
  app.post('/api/orders', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => { try { const input = orderInput.parse(request.body); const session = request.unsignCookie(request.cookies[customerCookie] ?? ''); const order = await createOrder({ ...input, customerId: session.valid ? session.value : undefined }); return reply.status(201).send({ orderNumber: order.number, publicAccessToken: order.publicAccessToken, status: order.status }) } catch (error) { if (error instanceof Error && /indisponível|Troco/.test(error.message)) return reply.status(400).send({ error: 'invalid_order', message: error.message }); throw error } })
  app.get('/api/orders/public/:token', async (request, reply) => { const parsed = z.object({ token: z.string().min(32).max(128) }).safeParse(request.params); if (!parsed.success) return reply.status(404).send({ error: 'order_not_found' }); const order = await getPublicOrder(parsed.data.token); return order ? { number: order.number, status: order.status, paymentMethod: order.paymentMethod, totalCents: order.totalCents, items: order.items, history: order.history } : reply.status(404).send({ error: 'order_not_found' }) })
  app.get('/api/admin/orders/:id', async (request, reply) => { const { id } = z.object({ id: z.string().uuid() }).parse(request.params); return (await getOrder(id)) ?? reply.status(404).send({ error: 'order_not_found' }) })
  app.patch('/api/admin/orders/:id/status', async (request, reply) => { const { id } = z.object({ id: z.string().uuid() }).parse(request.params); const { status } = z.object({ status: z.enum(orderStatuses) }).parse(request.body); const order = await updateOrderStatus(id, status); return order ?? reply.status(409).send({ error: 'invalid_status_transition' }) })
  app.post('/api/admin/auth/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const input = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(request.body)
    const user = await authenticateAdmin(input.email, input.password)
    if (!user) return reply.status(401).send({ error: 'invalid_credentials' })
    const next = user.mfaEnabled ? 'verify' : 'enroll'
    reply.clearCookie(adminCookie, { path: '/' })
    reply.setCookie(adminPendingCookie, createPendingSession(user.id, next), pendingCookieOptions)
    return { next }
  })
  const getPending = (request: FastifyRequest, reply: FastifyReply, requiredFlow: 'enroll' | 'verify') => {
    const signed = request.unsignCookie(request.cookies[adminPendingCookie] ?? '')
    const pending = signed.valid ? parsePendingSession(signed.value) : undefined
    if (!pending || pending.flow !== requiredFlow) { reply.status(401).send({ error: 'mfa_pending_unauthorized' }); return undefined }
    return pending
  }
  app.post('/api/admin/auth/mfa/enroll', async (request, reply) => {
    const pending = getPending(request, reply, 'enroll')
    if (!pending) return
    const [admin] = await db.select({ email: adminUsers.email, active: adminUsers.active, enabled: adminUsers.mfaEnabled }).from(adminUsers).where(eq(adminUsers.id, pending.adminId)).limit(1)
    if (!admin?.active || admin.enabled) return reply.status(401).send({ error: 'mfa_pending_unauthorized' })
    const otpauthUri = await startMfaEnrollment(pending.adminId, admin.email)
    return otpauthUri ? { otpauthUri } : reply.status(401).send({ error: 'mfa_pending_unauthorized' })
  })
  app.post('/api/admin/auth/mfa/enroll/confirm', { config: { rateLimit: { max: 5, timeWindow: '5 minutes' } } }, async (request, reply) => {
    const pending = getPending(request, reply, 'enroll')
    if (!pending) return
    const { code } = z.object({ code: z.string().regex(/^\d{6}$/) }).parse(request.body)
    const backupCodes = await confirmMfaEnrollment(pending.adminId, code)
    if (!backupCodes) { await writeAdminAudit({ adminId: pending.adminId, action: 'mfa_enrollment_verification_failed', entityType: 'admin_user', entityId: pending.adminId }); return reply.status(401).send({ error: 'invalid_mfa_code' }) }
    await writeAdminAudit({ adminId: pending.adminId, action: 'mfa_enrolled', entityType: 'admin_user', entityId: pending.adminId })
    reply.clearCookie(adminPendingCookie, { path: '/api/admin/auth/mfa' })
    reply.setCookie(adminCookie, await createAdminSession(pending.adminId), { ...sessionCookieOptions, maxAge: 60 * 60 * 8 })
    return { backupCodes }
  })
  app.post('/api/admin/auth/mfa/verify', { config: { rateLimit: { max: 5, timeWindow: '5 minutes' } } }, async (request, reply) => {
    const pending = getPending(request, reply, 'verify')
    if (!pending) return
    const { code } = z.object({ code: z.string().min(6).max(32) }).parse(request.body)
    if (!await verifyMfaCode(pending.adminId, code)) { await writeAdminAudit({ adminId: pending.adminId, action: 'mfa_verification_failed', entityType: 'admin_user', entityId: pending.adminId }); return reply.status(401).send({ error: 'invalid_mfa_code' }) }
    reply.clearCookie(adminPendingCookie, { path: '/api/admin/auth/mfa' })
    reply.setCookie(adminCookie, await createAdminSession(pending.adminId), { ...sessionCookieOptions, maxAge: 60 * 60 * 8 })
    return { ok: true }
  })
  app.post('/api/admin/auth/logout', async (request, reply) => { const signed = request.unsignCookie(request.cookies[adminCookie] ?? ''); if (signed.valid) await revokeAdminSession(signed.value); reply.clearCookie(adminCookie, { path: '/' }); return { ok: true } })
  app.get('/api/admin/auth/me', async (request, reply) => { const signed = request.unsignCookie(request.cookies[adminCookie] ?? ''); const session = signed.valid ? await getAdminSession(signed.value) : undefined; if (!session) return reply.status(401).send({ error: 'admin_unauthorized' }); reply.header('cache-control', 'no-store, private'); return { id: session.adminId } })
  const productInput = z.object({ name: z.string().min(2), slug: z.string().min(2), categoryId: z.string().min(1), description: z.string().optional(), image: z.string().optional(), active: z.boolean().default(true), sortOrder: z.number().int().nonnegative().default(0), price: z.number().nonnegative(), fromPrice: z.boolean().default(false) })
  app.get('/api/admin/products', async () => db.select().from(products).orderBy(asc(products.sortOrder)))
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
  app.get('/api/admin/categories', async () => db.select().from(categories).orderBy(asc(categories.sortOrder)))
  app.post('/api/admin/categories', async (request, reply) => {
    const input = z.object({ name: z.string().min(2), slug: z.string().min(2), subtitle: z.string().optional(), sortOrder: z.number().int().nonnegative().default(0), active: z.boolean().default(true) }).parse(request.body)
    const [category] = await db.insert(categories).values({ id: randomUUID(), ...input }).returning()
    return reply.status(201).send(category)
  })
  app.patch('/api/admin/categories/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params)
    const input = z.object({ name: z.string().min(2).optional(), slug: z.string().min(2).optional(), subtitle: z.string().nullable().optional(), sortOrder: z.number().int().nonnegative().optional(), active: z.boolean().optional() }).parse(request.body)
    const [category] = await db.update(categories).set({ ...input, updatedAt: new Date() }).where(eq(categories.id, id)).returning()
    return category ?? reply.status(404).send({ error: 'category_not_found' })
  })
  app.get('/api/admin/products/:id/variants', async (request) => { const { id } = z.object({ id: z.string().min(1) }).parse(request.params); return db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(asc(productVariants.sortOrder)) })
  app.post('/api/admin/products/:id/variants', async (request, reply) => { const { id } = z.object({ id: z.string().min(1) }).parse(request.params); const input = z.object({ name: z.string().min(1), priceCents: z.number().int().nonnegative(), sortOrder: z.number().int().nonnegative(), active: z.boolean().default(true) }).parse(request.body); const [variant] = await db.insert(productVariants).values({ id: `${id}:${randomUUID()}`, productId: id, ...input }).returning(); return reply.status(201).send(variant) })
  app.patch('/api/admin/variants/:id', async (request, reply) => { const input = z.object({ name: z.string().min(1).optional(), priceCents: z.number().int().nonnegative().optional(), sortOrder: z.number().int().nonnegative().optional(), active: z.boolean().optional() }).parse(request.body); const [row] = await db.update(productVariants).set(input).where(eq(productVariants.id, z.object({ id: z.string().min(1) }).parse(request.params).id)).returning(); return row ?? reply.status(404).send({ error: 'variant_not_found' }) })
  const groupInput = z.object({ label: z.string().min(1), hint: z.string().optional(), type: z.enum(['single', 'multi']), required: z.boolean().default(false), minSelectable: z.number().int().nonnegative().default(0), maxSelectable: z.number().int().nonnegative().nullable().optional(), active: z.boolean().default(true), sortOrder: z.number().int().nonnegative().default(0) })
  app.get('/api/admin/products/:id/options', async (request) => { const id = z.object({ id: z.string().min(1) }).parse(request.params).id; const groups = await db.select().from(optionGroups).where(eq(optionGroups.productId, id)).orderBy(asc(optionGroups.sortOrder)); const options = groups.length ? await db.select().from(productOptions).orderBy(asc(productOptions.sortOrder)) : []; return groups.map((group) => ({ ...group, options: options.filter((option) => option.optionGroupId === group.id) })) })
  app.post('/api/admin/products/:id/option-groups', async (request, reply) => { const id = z.object({ id: z.string().min(1) }).parse(request.params).id; const [row] = await db.insert(optionGroups).values({ id: `${id}:${randomUUID()}`, productId: id, ...groupInput.parse(request.body) }).returning(); return reply.status(201).send(row) })
  app.patch('/api/admin/option-groups/:id', async (request, reply) => { const [row] = await db.update(optionGroups).set(groupInput.partial().parse(request.body)).where(eq(optionGroups.id, z.object({ id: z.string().min(1) }).parse(request.params).id)).returning(); return row ?? reply.status(404).send({ error: 'group_not_found' }) })
  app.post('/api/admin/option-groups/:id/options', async (request, reply) => { const id = z.object({ id: z.string().min(1) }).parse(request.params).id; const input = z.object({ name: z.string().min(1), priceCents: z.number().int().nonnegative(), sortOrder: z.number().int().nonnegative().default(0), active: z.boolean().default(true) }).parse(request.body); const [row] = await db.insert(productOptions).values({ id: `${id}:${randomUUID()}`, optionGroupId: id, ...input }).returning(); return reply.status(201).send(row) })
  app.patch('/api/admin/options/:id', async (request, reply) => { const input = z.object({ name: z.string().min(1).optional(), priceCents: z.number().int().nonnegative().optional(), sortOrder: z.number().int().nonnegative().optional(), active: z.boolean().optional() }).parse(request.body); const [row] = await db.update(productOptions).set(input).where(eq(productOptions.id, z.object({ id: z.string().min(1) }).parse(request.params).id)).returning(); return row ?? reply.status(404).send({ error: 'option_not_found' }) })
  app.delete('/api/admin/products/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params)
    const [product] = await db.update(products).set({ active: false, archived: true, updatedAt: new Date() }).where(eq(products.id, id)).returning()
    return product ? { ...product, archived: true } : reply.status(404).send({ error: 'product_not_found' })
  })
  app.get('/api/admin/store', async () => repository.getStore())
  app.get('/api/admin/payments', async () => { const [store] = await db.select({ paymentMethods: storeConfig.paymentMethods }).from(storeConfig).where(eq(storeConfig.id, 'default')).limit(1); return paymentMethodsSchema.parse(store?.paymentMethods) })
  app.put('/api/admin/payments', async (request, reply) => { const paymentMethods = paymentMethodsSchema.parse(request.body); const result = await db.update(storeConfig).set({ paymentMethods, updatedAt: new Date() }).where(eq(storeConfig.id, 'default')).returning({ id: storeConfig.id }); if (result.length === 0) return reply.status(404).send({ error: 'store_not_found' }); return paymentMethods })
  app.patch('/api/admin/store', async (request) => {
    const input = z.object({ name: z.string().min(2).optional(), city: z.string().min(2).optional(), tagline: z.string().min(2).optional(), whatsappNumber: z.string().min(8).optional(), deliveryMode: z.string().min(2).optional(), minOrder: z.number().nonnegative().optional(), schedule: z.object({ override: z.enum(['auto', 'open', 'closed']).optional(), message: z.string().max(120).optional(), days: z.record(z.string(), z.object({ enabled: z.boolean(), opensAt: z.string().regex(/^\d\d:\d\d$/), closesAt: z.string().regex(/^\d\d:\d\d$/) })).optional() }).optional() }).parse(request.body)
    const [store] = await db.update(storeConfig).set({ ...input, ...(input.minOrder === undefined ? {} : { minOrderCents: Math.round(input.minOrder * 100) }), updatedAt: new Date() }).where(eq(storeConfig.id, 'default')).returning()
    return store
  })
  app.post('/api/customers/session', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const input = z.object({ name: z.string().trim().min(2).max(100), phone: z.string().min(8).max(30) }).parse(request.body)
    const customer = await createCustomerSession(input.name, input.phone)
    return reply.status(200).send({ id: customer.id, name: customer.name, phone: customer.phone })
  })
  const customerAuthInput = z.object({ name: z.string().trim().min(2).max(100), phone: z.string().min(8).max(30), email: z.string().email(), password: z.string().min(8).max(128) })
  app.post('/api/customers/auth/register', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => { try { const input = customerAuthInput.parse(request.body); const customer = await registerCustomer(input.name, input.phone, input.email, input.password); reply.setCookie(customerCookie, customer.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production', signed: true, maxAge: 60 * 60 * 24 * 30 }); return reply.status(201).send({ id: customer.id, name: customer.name, phone: customer.phone, email: customer.email }) } catch (error) { if (error instanceof Error && error.message === 'E-mail já cadastrado.') return reply.status(201).send({ message: 'Cadastro recebido. Se já existe uma conta com esse e-mail, faça login normalmente.' }); throw error } })
  app.post('/api/customers/auth/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => { const input = z.object({ email: z.string().email(), password: z.string().min(8).max(128) }).parse(request.body); const customer = await authenticateCustomer(input.email, input.password); if (!customer) return reply.status(401).send({ error: 'invalid_credentials' }); reply.setCookie(customerCookie, customer.id, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production', signed: true, maxAge: 60 * 60 * 24 * 30 }); return { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email } })
  app.post('/api/customers/auth/logout', async (_request, reply) => { reply.clearCookie(customerCookie, { path: '/' }); return { ok: true } })
  app.get('/api/customers/auth/me', async (request, reply) => { const session = request.unsignCookie(request.cookies[customerCookie] ?? ''); if (!session.valid) return reply.status(401).send({ error: 'customer_unauthorized' }); const customer = await getCustomer(session.value); return customer ? { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email, address: customer.address } : reply.status(401).send({ error: 'customer_unauthorized' }) })
  app.patch('/api/customers/me', async (request, reply) => { const session = request.unsignCookie(request.cookies[customerCookie] ?? ''); if (!session.valid) return reply.status(401).send({ error: 'customer_unauthorized' }); const input = z.object({ name: z.string().trim().min(2).max(100), phone: z.string().min(8).max(30), address: z.object({ address: z.string().trim().min(2).max(200), number: z.string().trim().min(1).max(20), complement: z.string().trim().max(100).optional(), neighborhood: z.string().trim().min(2).max(100) }) }).parse(request.body); const customer = await updateCustomerProfile(session.value, input); return { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email, address: customer.address } })
  app.get('/api/customers/me/orders', async (request, reply) => { const session = request.unsignCookie(request.cookies[customerCookie] ?? ''); if (!session.valid) return reply.status(401).send({ error: 'customer_unauthorized' }); return getCustomerOrders(session.value) })
  app.get('/api/products/:slug', async (request, reply) => {
    const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params)
    const product = await repository.getProductBySlug(slug)
    return product ?? reply.status(404).send({ error: 'product_not_found' })
  })
  return app
}
