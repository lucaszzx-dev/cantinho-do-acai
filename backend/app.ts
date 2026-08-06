import cors from '@fastify/cors'
import Fastify from 'fastify'
import { z } from 'zod'
import { env } from './env.js'
import { postgresCatalogRepository, type CatalogRepository } from './catalog/repository.js'
import { createCustomerSession, getCustomer } from './customers.js'
import { db } from './db/client.js'
import { categories, products, storeConfig } from './db/schema.js'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export function buildApp(repository: CatalogRepository = postgresCatalogRepository) {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info', redact: ['req.headers.authorization'] } })
  app.register(cors, { origin: env.FRONTEND_ORIGIN })
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error)
    reply.status(500).send({ error: 'internal_server_error' })
  })
  app.get('/health', async () => ({ status: 'ok' }))
  app.get('/api/store', async (_request, reply) => {
    const store = await repository.getStore()
    return store ?? reply.status(404).send({ error: 'store_not_found' })
  })
  app.get('/api/categories', async () => repository.getCategories())
  app.get('/api/products', async () => repository.getProducts())
  const productInput = z.object({ name: z.string().min(2), slug: z.string().min(2), categoryId: z.string().min(1), description: z.string().optional(), image: z.string().optional(), active: z.boolean().default(true), sortOrder: z.number().int().nonnegative().default(0), price: z.number().nonnegative(), fromPrice: z.boolean().default(false) })
  app.get('/api/admin/products', async () => repository.getProducts())
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
