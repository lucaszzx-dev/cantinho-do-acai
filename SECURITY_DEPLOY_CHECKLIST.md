# Checklist de segurança para deploy

- [ ] Mantenha PostgreSQL privado: use rede interna/allowlist do backend no provedor; em containers, não publique 5432 e bloqueie no firewall/security group.
- [ ] Configure secrets no painel do provedor: `DATABASE_URL` (TLS/SSL), `FRONTEND_ORIGIN` (URL HTTPS exata), `TRUST_PROXY_HOPS` e `ADMIN_SESSION_SECRET` (gere com `openssl rand -base64 48`).
- [ ] Exija HTTPS ponta a ponta: certificado válido e redirect HTTP para HTTPS no CDN/load balancer; só então habilite HSTS em produção.
- [ ] Habilite backup automatizado do Postgres, retenção apropriada e teste restore periódico em banco isolado.
- [ ] Calibre `TRUST_PROXY_HOPS`: `1` para um único proxy confiável (Railway/Render/load balancer); aumente somente quando houver CDN/proxy adicional comprovado.
- [ ] Monitore `/health` e `/ready`, erros 5xx, falhas de banco e disponibilidade com alertas.
