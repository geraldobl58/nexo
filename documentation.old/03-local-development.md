# 03 — Desenvolvimento Local

> Como rodar o Nexo localmente para desenvolvimento.

---

## Visão Geral

O ambiente de desenvolvimento usa **Docker Compose** para infraestrutura (PostgreSQL + Keycloak) e roda o backend/frontend nativamente via pnpm.

```
┌──────────────────────────────────────────────────┐
│                Docker Compose                     │
│  ┌──────────────┐    ┌─────────────────────────┐ │
│  │ PostgreSQL   │    │ Keycloak 26             │ │
│  │ :5432        │◄───│ :8080 (admin)           │ │
│  │              │    │ :9000 (management)      │ │
│  │ nexo_app     │    │                         │ │
│  │ nexo_keycloak│    │ admin/admin             │ │
│  └──────────────┘    └─────────────────────────┘ │
└──────────────────────────────────────────────────┘
         ▲                        ▲
         │                        │
  ┌──────┴──────┐         ┌───────┴────────┐
  │  nexo-be    │         │    nexo-fe     │
  │  NestJS     │◄────────│    Next.js     │
  │  :3333      │         │    :3000       │
  └─────────────┘         └────────────────┘
     (nativo)                 (nativo)
```

---

## Setup Inicial

### 1. Clonar o Repositório

```bash
git clone git@github.com:geraldobl58/nexo.git
cd nexo
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Subir Infraestrutura (Docker Compose)

```bash
docker compose up -d
```

Isso inicia:

- **PostgreSQL** na porta `5432` (bancos `nexo_app` e `nexo_keycloak` criados automaticamente)
- **Keycloak** na porta `8080` (admin: `admin` / `admin`)

Verificar status:

```bash
docker compose ps
docker compose logs -f keycloak  # Aguardar "Keycloak started"
```

### 4. Configurar o Backend

```bash
# Criar arquivo .env no backend
cat > apps/nexo-be/.env << 'EOF'
# Database
DATABASE_URL="postgresql://nexo:nexo_password@localhost:5432/nexo_app?schema=public"

# Server
PORT=3333
NODE_ENV=development

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=nexo
KEYCLOAK_CLIENT_ID=nexo-web

# Frontend (CORS)
FRONTEND_URL=http://localhost:3000

# Swagger
SWAGGER_ENABLED=true
EOF

# Rodar migrations do Prisma
pnpm --filter nexo-be prisma:migrate

# Gerar Prisma Client
pnpm --filter nexo-be prisma:generate
```

### 5. Configurar o Frontend

```bash
# Criar arquivo .env.local no frontend
cat > apps/nexo-fe/.env.local << 'EOF'
# API
API_URL=http://localhost:3333
NEXT_PUBLIC_API_URL=http://localhost:3333

# Keycloak
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=nexo
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nexo-web
EOF
```

### 6. Configurar Keycloak

Acesse `http://localhost:8080` com `admin` / `admin` e:

1. **Criar o realm `nexo`:**
   - Canto superior esquerdo → "Create realm"
   - Name: `nexo`
   - Enabled: ON

2. **Criar o client `nexo-web`:**
   - Clients → Create client
   - Client ID: `nexo-web`
   - Client type: OpenID Connect
   - Client authentication: OFF (public client)
   - Standard flow: ON
   - Direct access grants: ON
   - Valid redirect URIs: `http://localhost:3000/*`
   - Valid post logout redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`

3. **Criar um usuário de teste:**
   - Users → Add user
   - Username: `test`
   - Email: `test@nexo.dev`
   - Email verified: ON
   - Credentials → Set password: `test` (Temporary: OFF)

---

## Comandos do Dia a Dia

### Rodar Aplicações

```bash
# Backend (NestJS) — porta 3333
pnpm --filter nexo-be dev

# Frontend (Next.js) — porta 3000
pnpm --filter nexo-fe dev

# Ambos simultaneamente (via Turborepo)
pnpm dev
```

### Banco de Dados

```bash
# Rodar migrations
pnpm --filter nexo-be prisma:migrate

# Resetar banco (⚠ apaga dados)
pnpm --filter nexo-be prisma:reset

# Abrir Prisma Studio (GUI)
pnpm --filter nexo-be prisma:studio

# Gerar Prisma Client após alterar schema
pnpm --filter nexo-be prisma:generate
```

### Build & Lint

```bash
# Build de todos os apps
pnpm build

# Lint de todos os apps
pnpm lint

# Verificação de tipos
pnpm check-types

# Formatar código
pnpm format
```

### Testes

```bash
# Unit tests (backend)
pnpm --filter nexo-be test

# Watch mode
pnpm --filter nexo-be test:watch

# E2E tests
pnpm --filter nexo-be test:e2e

# Coverage
pnpm --filter nexo-be test:cov
```

### Docker Compose

```bash
# Subir
docker compose up -d

# Parar
docker compose down

# Parar e apagar volumes (⚠ apaga dados)
docker compose down -v

# Ver logs
docker compose logs -f postgres
docker compose logs -f keycloak

# Rebuild
docker compose up -d --build
```

---

## Portas Utilizadas

| Serviço               | Porta | URL                                              |
| --------------------- | ----- | ------------------------------------------------ |
| nexo-fe (Next.js)     | 3000  | `http://localhost:3000`                          |
| nexo-be (NestJS)      | 3333  | `http://localhost:3333`                          |
| Swagger (API docs)    | 3333  | `http://localhost:3333/docs`                     |
| PostgreSQL            | 5432  | `postgresql://nexo:nexo_password@localhost:5432` |
| Keycloak (admin)      | 8080  | `http://localhost:8080`                          |
| Keycloak (management) | 9000  | `http://localhost:9000`                          |

---

## Variáveis de Ambiente

### Backend (`apps/nexo-be/.env`)

| Variável             | Exemplo                                                   | Descrição                            |
| -------------------- | --------------------------------------------------------- | ------------------------------------ |
| `DATABASE_URL`       | `postgresql://nexo:nexo_password@localhost:5432/nexo_app` | Conexão PostgreSQL                   |
| `PORT`               | `3333`                                                    | Porta do servidor                    |
| `NODE_ENV`           | `development`                                             | Ambiente                             |
| `KEYCLOAK_URL`       | `http://localhost:8080`                                   | URL externo do Keycloak              |
| `KEYCLOAK_REALM`     | `nexo`                                                    | Realm no Keycloak                    |
| `KEYCLOAK_CLIENT_ID` | `nexo-web`                                                | Client ID                            |
| `FRONTEND_URL`       | `http://localhost:3000`                                   | URL do frontend (CORS)               |
| `SWAGGER_ENABLED`    | `true`                                                    | Habilitar Swagger UI                 |
| `LOG_LEVEL`          | `debug`                                                   | Nível de log (debug/info/warn/error) |

### Frontend (`apps/nexo-fe/.env.local`)

| Variável                         | Exemplo                 | Descrição                   |
| -------------------------------- | ----------------------- | --------------------------- |
| `API_URL`                        | `http://localhost:3333` | URL interno da API (SSR)    |
| `NEXT_PUBLIC_API_URL`            | `http://localhost:3333` | URL público da API (client) |
| `NEXT_PUBLIC_KEYCLOAK_URL`       | `http://localhost:8080` | URL do Keycloak             |
| `NEXT_PUBLIC_KEYCLOAK_REALM`     | `nexo`                  | Realm                       |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `nexo-web`              | Client ID                   |

---

## Hot Reload

| Serviço        | Mecanismo            | Detalhes                                                                               |
| -------------- | -------------------- | -------------------------------------------------------------------------------------- |
| **nexo-be**    | `nest start --watch` | Recompila automaticamente ao salvar                                                    |
| **nexo-fe**    | Next.js Fast Refresh | HMR instantâneo no browser                                                             |
| **nexo-auth**  | Volume mount         | `apps/nexo-auth/themes/` montado no Keycloak via Docker Compose com cache desabilitado |
| **PostgreSQL** | Persistente          | Dados mantidos no volume `nexo-postgres-data`                                          |

---

## Problemas Comuns no Dev Local

### Keycloak não inicia

```bash
# Verificar se o PostgreSQL está saudável
docker compose ps
# Se postgres não estiver healthy, espere ou reinicie
docker compose restart postgres
# Aguardar e reiniciar keycloak
docker compose restart keycloak
```

### Erro de conexão com banco

```bash
# Verificar se o banco existe
docker compose exec postgres psql -U nexo -l

# Se nexo_app não existir, recrear
docker compose down -v && docker compose up -d
```

### Prisma schema desatualizado

```bash
pnpm --filter nexo-be prisma:generate
# Se der erro de migration, resetar
pnpm --filter nexo-be prisma:reset
```

---

## Próximo Passo

→ [04 — Configuração do GitHub](04-github-setup.md)
