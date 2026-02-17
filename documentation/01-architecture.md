# 01 — Arquitetura

> Visão geral da arquitetura técnica da plataforma Nexo.

---

## Stack Tecnológico

| Camada         | Tecnologia                                              | Versão    |
| -------------- | ------------------------------------------------------- | --------- |
| Frontend       | Next.js (standalone output)                             | 14.2      |
| Backend        | NestJS (Clean Architecture)                             | 11.x      |
| Autenticação   | Keycloak                                                | 26.x      |
| Banco de Dados | PostgreSQL (DO Managed)                                 | 16        |
| ORM            | Prisma                                                  | 7.x       |
| Orquestração   | DigitalOcean Kubernetes (DOKS)                          | 1.31      |
| GitOps         | ArgoCD                                                  | 3.x       |
| CI/CD          | GitHub Actions                                          | —         |
| Ingress        | NGINX Ingress Controller                                | —         |
| TLS            | Let's Encrypt via cert-manager (`*.g3developer.online`) | —         |
| Monitoramento  | — (removido para lab)                                   | —         |
| Registry       | GitHub Container Registry (GHCR)                        | —         |
| Monorepo       | pnpm workspaces + Turborepo                             | 9.x / 2.x |
| Runtime        | Node.js                                                 | 20 LTS    |

---

## Visão Geral dos Serviços

```
                ┌──────────────────┐
                │    Usuário       │
                │   (Browser)      │
                └────────┬─────────┘
                         │ HTTP
                         ▼
              ┌──────────────────────┐
              │   NGINX Ingress      │
              └──┬───────┬────────┬──┘
                 │       │        │
        ┌────────▼─┐ ┌───▼────┐ ┌─▼──────────┐
        │ nexo-fe  │ │nexo-be │ │ nexo-auth   │
        │ Next.js  │ │NestJS  │ │ Keycloak 26 │
        │ :3000    │ │:3333   │ │ :8080       │
        └──────────┘ └───┬────┘ └──────┬──────┘
                         │             │
                    ┌────▼─────────────▼────┐
                    │  DO Managed Database   │
                    │  PostgreSQL 16         │
                    │                        │
                    │  nexo_app (backend)    │
                    │  nexo_keycloak (auth)  │
                    └────────────────────────┘
```

### nexo-be (Backend)

- **Framework:** NestJS 11 com Express
- **Arquitetura:** Clean Architecture (Domain → Application → Infrastructure → Presentation)
- **ORM:** Prisma 7 com PostgreSQL
- **Auth:** Passport JWT com validação via JWKS (Keycloak)
- **API Docs:** Swagger em `/docs`
- **Métricas:** Desabilitado (lab)
- **Logging:** nestjs-pino (structured JSON)
- **Rate Limiting:** @nestjs/throttler (100 req/60s)
- **Health:** `/health` endpoint (liveness + readiness)

### nexo-fe (Frontend)

- **Framework:** Next.js 14 com output `standalone`
- **Auth:** keycloak-js (OIDC/PKCE flow)
- **State:** TanStack Query v5 (server state)
- **UI:** Tailwind CSS + Radix UI (shadcn/ui)
- **SSR:** Server actions para chamadas ao backend (tokens nunca expostos no client)

### nexo-auth (Autenticação)

- **Engine:** Keycloak 26.5
- **Protocol:** OpenID Connect (PKCE)
- **Realm:** `nexo`
- **Client:** `nexo-web` (public client)
- **Themes:** Customizados em `apps/nexo-auth/themes/`
- **Modo:** `start` (produção) / `start-dev` (desenvolvimento)

---

## Clean Architecture (Backend)

```
apps/nexo-be/src/
├── domain/           # Entidades, Value Objects, Interfaces de repositório
│   ├── auth/         #   Regras de negócio puras (sem dependência externa)
│   └── user/
│
├── application/      # Use Cases, DTOs, Services
│   └── auth/         #   Orquestra regras do domain com infraestrutura
│
├── infrastructure/   # Implementações concretas
│   ├── auth/         #   Passport strategies, guards
│   └── database/     #   Prisma service, repositories
│
├── presentation/     # Controllers, Decorators, Pipes
│   └── auth/         #   HTTP endpoints, request/response handling
│
├── modules/          # NestJS modules (composição)
│   ├── auth/
│   └── health/
│
├── libs/             # Bibliotecas internas
│   └── prisma/       #   Prisma client wrapper
│
├── shared/           # Utilities compartilhados
├── app.module.ts     # Root module
└── main.ts           # Bootstrap
```

**Regra de dependência:** As camadas internas nunca dependem das externas.

```
Domain ← Application ← Infrastructure ← Presentation
(puro)   (use cases)    (implementação)   (HTTP)
```

---

## Fluxo de Autenticação

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Browser  │────▶│ nexo-fe  │────▶│nexo-auth │────▶│ nexo-be  │
│          │     │ Next.js  │     │ Keycloak │     │ NestJS   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │  1. Acessa     │                │                │
     │  /panel        │                │                │
     │───────────────▶│                │                │
     │                │ 2. keycloak-js │                │
     │                │  init()        │                │
     │                │───────────────▶│                │
     │                │                │ 3. Login page  │
     │◀───────────────┼────────────────│                │
     │ 4. Credenciais │                │                │
     │───────────────▶│───────────────▶│                │
     │                │                │ 5. Tokens      │
     │                │◀───────────────│  (OIDC/PKCE)   │
     │                │                │                │
     │                │ 6. Server Action               │
     │                │   syncMeAction()               │
     │                │────────────────────────────────▶│
     │                │                │  7. Valida JWT │
     │                │                │  via JWKS      │
     │                │◀───────────────────────────────│
     │  8. Dashboard  │                │                │
     │◀───────────────│                │                │
```

### Detalhes Importantes

1. **PKCE Flow:** O frontend usa `keycloak-js` com Authorization Code + PKCE (sem client secret)
2. **Server Actions:** Todas as chamadas ao backend passam por Server Actions do Next.js — tokens JWT nunca são expostos em `fetch()` do lado do client
3. **Validação JWT:** O backend valida tokens via JWKS endpoint do Keycloak
4. **Dois URLs no backend:**
   - `KEYCLOAK_URL` — URL externo (deve bater com o `iss` claim do token)
   - `KEYCLOAK_INTERNAL_URL` — URL interno no cluster (para JWKS, evita round-trip externo)

---

## Modelo de Dados (Prisma)

O banco `nexo_app` modela um portal imobiliário completo:

| Área             | Models Principais                                           |
| ---------------- | ----------------------------------------------------------- |
| **Usuários**     | `User` (staff: admin/moderator/support, keycloakId)         |
| **Anunciantes**  | `Advertiser` (agency/broker/owner/developer, CRECI, rating) |
| **Imóveis**      | `Property` (tipo, status, preço, endereço, mídia)           |
| **Leads**        | `Lead` (captura de interessados)                            |
| **Visitas**      | `Visit` (agendamento de visitas)                            |
| **Propostas**    | `Proposal` (ofertas de compra/aluguel)                      |
| **Mensagens**    | `Message` (chat entre partes)                               |
| **Notificações** | `Notification` (email/sms/push/whatsapp)                    |
| **Planos**       | `ListingPlan` (free/standard/featured/premium/super)        |
| **Denúncias**    | `Report` (moderação de conteúdo)                            |
| **Integrações**  | `Integration`, `Webhook` (APIs externas)                    |

---

## Estrutura do Monorepo

```
nexo/
├── apps/
│   ├── nexo-be/              # Backend NestJS
│   │   ├── src/              #   Código-fonte (Clean Architecture)
│   │   ├── prisma/           #   Schema + migrations
│   │   ├── test/             #   E2E tests
│   │   └── Dockerfile        #   Multi-stage build
│   │
│   ├── nexo-fe/              # Frontend Next.js
│   │   ├── src/              #   App Router + components
│   │   │   ├── app/          #     Rotas (marketing + panel)
│   │   │   ├── components/   #     UI components
│   │   │   ├── features/     #     Feature modules
│   │   │   └── providers/    #     Context providers
│   │   └── Dockerfile        #   Multi-stage build (standalone)
│   │
│   └── nexo-auth/            # Keycloak
│       ├── themes/nexo/      #   Tema customizado
│       └── Dockerfile        #   Build otimizado
│
├── packages/                 # Pacotes compartilhados
│
├── infra/                    # IaC (DigitalOcean)
│   ├── helm/                 #   Helm charts (3 serviços)
│   ├── argocd/               #   GitOps config
│   ├── k8s/base/             #   Namespaces + Issuers
│   ├── scripts/              #   Setup scripts
│   └── docker/               #   Init scripts para Docker Compose
│
├── .github/workflows/        # GitHub Actions CI/CD
│   └── pipeline.yml          #   Pipeline principal (~1000 linhas)
│
├── docker-compose.yml        # Dev local (Postgres + Keycloak)
├── turbo.json                # Turborepo tasks
├── pnpm-workspace.yaml       # Workspace config
└── package.json              # Root package
```

---

## Docker Builds

### nexo-be (Multi-stage)

```
Stage 1: base           → Node 20 Alpine + pnpm
Stage 2: dependencies   → pnpm install
Stage 3: builder        → prisma generate + nest build
Stage 4: prod-deps      → production-only dependencies
Stage 5: production     → dumb-init, non-root (nestjs:1001)
                           entrypoint: prisma migrate deploy → node dist/src/main.js
                           healthcheck: /health
```

### nexo-fe (Multi-stage)

```
Stage 1: base           → Node 20 Alpine + pnpm (--platform=$BUILDPLATFORM)
Stage 2: dependencies   → pnpm install (hoisted)
Stage 3: builder        → NEXT_PUBLIC_* build-args → pnpm build
Stage 4: runner         → Node 20 Alpine, non-root (nextjs:1001)
                           standalone output, static files duplicated para compatibilidade monorepo
                           CMD: node /app/server.js
```

### nexo-auth (Multi-stage)

```
Stage 1: builder        → Keycloak 26.5, custom themes, kc.sh build
Stage 2: runtime        → Keycloak 26.5, build otimizado copiado
                           CMD: kc.sh (start ou start-dev via Helm values)
```

> **Nota:** Todos os builds são multi-arch (`linux/amd64` + `linux/arm64`) via Docker Buildx.
