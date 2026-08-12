# Cantinho do Açaí

Plataforma full stack de delivery para uma loja de açaí, com catálogo, pedidos e área administrativa.

## Sobre o projeto

O projeto apresenta uma experiência de pedido de açaí e uma API para operar o catálogo, pedidos, categorias e configurações da loja.

## Tecnologias

- React, TypeScript e Vite
- Node.js e Fastify
- PostgreSQL e Drizzle ORM
- Vitest e pnpm

## Funcionalidades

- Catálogo de produtos, variações e opções
- Fluxo de pedidos e consulta de pedidos do cliente
- Área administrativa para produtos, pedidos, categorias e configurações
- Persistência de dados com migrações e seed

## Como executar

Requer Node.js, pnpm e Docker.

1. Crie os arquivos locais de ambiente necessários, sem versioná-los.
2. Suba o PostgreSQL com `docker compose up -d`.
3. Execute `pnpm install`, `pnpm db:migrate` e `pnpm db:seed`.
4. Em terminais separados, execute `pnpm dev:api` e `pnpm dev`.

Variáveis de ambiente usadas pelo projeto:

- `DATABASE_URL`
- `POSTGRES_PORT`
- `PORT`
- `FRONTEND_ORIGIN`
- `TRUST_PROXY_HOPS`
- `VITE_API_URL`
- `ADMIN_SESSION_SECRET`
- `LOG_LEVEL`
- `NODE_ENV`

Comandos disponíveis: `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm db:generate`, `pnpm db:migrate` e `pnpm db:seed`.

## Status

Em desenvolvimento.
