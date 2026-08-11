import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().default(0),
  ADMIN_SESSION_SECRET: z.string().min(24).optional(),
})

export const env = envSchema.parse(process.env)

if (process.env.NODE_ENV === 'production' && !env.ADMIN_SESSION_SECRET) {
  throw new Error('ADMIN_SESSION_SECRET is required in production')
}
