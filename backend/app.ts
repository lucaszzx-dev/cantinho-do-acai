import cors from '@fastify/cors'
import Fastify from 'fastify'
import { z } from 'zod'
import { env } from './env.js'
import { postgresCatalogRepository, type CatalogRepository } from './catalog/repository.js'

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
  app.get('/api/products/:slug', async (request, reply) => {
    const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params)
    const product = await repository.getProductBySlug(slug)
    return product ?? reply.status(404).send({ error: 'product_not_found' })
  })
  return app
}
