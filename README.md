# Cantinho do Açaí

React/Vite frontend plus a Fastify, PostgreSQL and Drizzle catalog API. Product
prices are stored as integer cents in PostgreSQL, avoiding floating-point money
errors; API DTOs expose prices in reais to preserve the current frontend API.

## Local setup

1. Copy `.env.example` to `.env` and adjust values if required.
2. Run `docker compose up -d` and wait for PostgreSQL to be healthy.
3. Run `pnpm install`, `pnpm db:migrate`, then `pnpm db:seed`.
4. In one terminal run `pnpm dev:api`; in another run `pnpm dev`.

Frontend: `http://localhost:5173`. API: `http://localhost:3000`; health check:
`/health`.

## Commands

`pnpm build`, `pnpm lint`, `pnpm test`, `pnpm db:generate`, `pnpm db:migrate`,
and `pnpm db:seed` are available from the repository root.

Set `TRUST_PROXY_HOPS` to the number of trusted proxies in front of the API (for example, `1` for one CDN/load balancer). Keep it at `0` locally so rate limiting does not trust forwarded headers.

The schema contains categories, products, variants, option groups, options and
store configuration. The idempotent seed imports the existing frontend catalog,
including its explicitly marked PENDING/MOCK store schedule, address, payment
methods and delivery rules. The frontend requests the public API first and uses
the current local catalog only if the API is unavailable.

`/admin` is the initial operational area for product availability/order,
categories and core store configuration. Customer convenience sessions use name
and normalized phone only; they are not authentication.
