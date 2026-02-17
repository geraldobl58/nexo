# Nexo Backend (nexo-be)

API backend do Nexo — marketplace imobiliario construido com NestJS, Prisma e Keycloak.

## Arquitetura

O projeto segue **Clean Architecture** com **Domain-Driven Design (DDD)**, separando responsabilidades em 4 camadas:

```
src/
├── domain/                  # Regras de negocio puras (tipos, interfaces)
│   ├── auth/
│   │   └── auth-user.ts         # Tipo AuthUser (payload do JWT)
│   └── user/
│       └── user.repository.ts   # Interface UserRepository + UserDTO
│
├── application/             # Casos de uso (orquestram o domain)
│   └── auth/
│       └── me.usecase.ts        # Sincroniza user Keycloak → banco
│
├── infrastructure/          # Implementacoes concretas (banco, auth)
│   ├── auth/
│   │   └── keycloak.strategy.ts # Passport JWT Strategy
│   └── database/
│       └── repositories/
│           └── prisma-user.repository.ts
│
├── presentation/            # Camada HTTP (controllers, guards)
│   └── auth/
│       ├── auth.controller.ts       # GET /auth/me
│       ├── jwt-auth.guard.ts        # Guard de autenticacao
│       └── current-user.decorator.ts # @CurrentUser()
│
├── modules/                 # Modulos NestJS (wiring de DI)
│   ├── auth/auth.module.ts
│   └── health/
│
├── libs/prisma/             # PrismaModule global
├── app.module.ts
└── main.ts
```

### Principios

- **Domain** nunca importa de infrastructure — define apenas interfaces e tipos
- **Infrastructure** implementa as interfaces do domain (ex: `PrismaUserRepository` implementa `UserRepository`)
- **Application** orquestra domain sem saber da infra (depende apenas de interfaces)
- **Presentation** lida exclusivamente com HTTP (guards, decorators, controllers)
- **Module** faz o wiring via `useFactory` — unico lugar que conhece todas as camadas

### Fluxo de autenticacao

```
Cliente envia request com Bearer Token
  → JwtAuthGuard intercepta
    → KeycloakStrategy valida JWT via JWKS (chaves publicas do Keycloak)
      → validate() extrai claims e retorna AuthUser
        → @CurrentUser() disponibiliza no controller
          → MeUseCase.execute() faz upsert no banco (cria ou atualiza)
            → Retorna UserDTO com dados do banco local
```

### Clientes Keycloak: nexo-web vs nexo-api

O sistema utiliza **dois clientes Keycloak** com papeis distintos no fluxo de autenticacao:

#### nexo-web (Public Client)

- **Tipo:** Public (sem client_secret)
- **Proposito:** Emitir tokens JWT para usuarios
- **Usado por:**
  - Frontend (Next.js) para login de usuarios
  - Ferramentas de teste (Postman, curl, Insomnia)
  - Qualquer aplicacao cliente que precise autenticar usuarios
- **Fluxo:** Usuario → nexo-web → Keycloak → Token JWT

#### nexo-api (Confidential Client)

- **Tipo:** Confidential (requer client_secret)
- **Proposito:** Validar tokens JWT nas requisicoes ao backend
- **Usado por:**
  - Backend NestJS via `KeycloakStrategy` (Passport JWT)
  - Validacao automatica via JWKS (chaves publicas do Keycloak)
- **Fluxo:** Request com token → JwtAuthGuard → KeycloakStrategy → Valida via JWKS → AuthUser

#### Fluxo Completo de Autenticacao

```
1. Usuario faz login no frontend (ou via Postman)
   → POST http://localhost:8080/realms/nexo/protocol/openid-connect/token
   → Body: client_id=nexo-web, grant_type=password, username, password
   → Keycloak valida credenciais e emite access_token (JWT)

2. Frontend/Cliente armazena o access_token

3. Cliente faz request para o backend com o token
   → GET http://localhost:3333/auth/me
   → Header: Authorization: Bearer <access_token>

4. Backend valida o token automaticamente
   → JwtAuthGuard intercepta a request
   → KeycloakStrategy (nexo-api) busca chaves publicas via JWKS
   → Valida assinatura do token (RS256)
   → Extrai claims (sub, email, name, realm_access.roles)
   → Retorna AuthUser para o controller

5. Controller executa a logica de negocio
   → MeUseCase recebe AuthUser
   → Faz upsert no banco (cria ou atualiza usuario)
   → Retorna UserDTO com dados do banco local
```

#### Por que usar nexo-web nos testes?

O client **nexo-api** e confidential e requer `client_secret`, sendo usado apenas internamente pelo backend para validacao. Para obter tokens (login), sempre use **nexo-web** (public), que permite autenticacao direta com username/password.

## Setup

### Pre-requisitos

- Node.js 20+
- pnpm
- Docker e Docker Compose

### 1. Subir os servicos (PostgreSQL + Keycloak)

```bash
# Na raiz do monorepo
docker compose up -d
```

Isso inicia:

- **PostgreSQL** na porta `5432` (bancos: `nexo_db` e `nexo_keycloak`)
- **Keycloak 26.5** na porta `8080` (admin: `admin`/`admin`)

### 2. Configurar variaveis de ambiente

```bash
cp .env.example .env
```

Variaveis de ambiente utilizadas pela aplicacao:

```env
NODE_ENV=development
PORT=3333
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://nexo:nexo_password@localhost:5432/nexo_db
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_INTERNAL_URL=http://localhost:8080
KEYCLOAK_REALM=nexo
```

> **Kubernetes:** In cluster deployments `KEYCLOAK_URL` must match the token issuer (external HTTPS URL, e.g. `https://develop.auth.nexo.local`) while `KEYCLOAK_INTERNAL_URL` points to the cluster-internal service (e.g. `http://nexo-auth-develop:8080`) for JWKS fetching. Locally both use the same value.

### 3. Configurar o banco

```bash
pnpm prisma:generate   # Gera o Prisma Client
pnpm prisma:migrate     # Aplica as migrations
```

### 4. Iniciar o servidor

```bash
pnpm start:dev
```

A API estara disponivel em `http://localhost:3333` e a documentacao Swagger em `http://localhost:3333/docs`.

## Configuracao do Keycloak

Acesse o admin do Keycloak em `http://localhost:8080` com as credenciais `admin`/`admin`.

### Passo 1 — Desabilitar SSL nos Realms (desenvolvimento)

O Keycloak exige HTTPS por padrao. Para desenvolvimento local via HTTP, execute:

```bash
docker exec nexo-auth-dev /opt/keycloak/bin/kcadm.sh \
  config credentials --server http://localhost:8080 --realm master --user admin --password admin

docker exec nexo-auth-dev /opt/keycloak/bin/kcadm.sh \
  update realms/master -s sslRequired=NONE
```

> Repita para o realm `nexo` apos cria-lo: `kcadm.sh update realms/nexo -s sslRequired=NONE`

### Passo 2 — Criar o Realm

1. No menu lateral, clique no dropdown do realm (mostra "master")
2. Clique em **Create realm**
3. Preencha:
   - **Realm name:** `nexo`
4. Clique em **Create**
5. Desabilite SSL no novo realm:

```bash
docker exec nexo-auth-dev /opt/keycloak/bin/kcadm.sh \
  update realms/nexo -s sslRequired=NONE
```

### Passo 3 — Criar o Client do Backend (nexo-api)

1. No realm `nexo`, va em **Clients** → **Create client**
2. **General settings:**
   - **Client ID:** `nexo-api`
   - **Client type:** OpenID Connect
3. **Capability config:**
   - **Client authentication:** ON (confidential)
   - **Authorization:** OFF
   - **Authentication flow:** marque apenas **Standard flow** e **Direct access grants**
4. **Login settings:**
   - **Valid redirect URIs:** `http://localhost:3333/*`
   - **Web origins:** `http://localhost:3333`
5. Clique em **Save**

### Passo 4 — Criar o Client do Frontend (nexo-web)

1. Va em **Clients** → **Create client**
2. **General settings:**
   - **Client ID:** `nexo-web`
   - **Client type:** OpenID Connect
3. **Capability config:**
   - **Client authentication:** OFF (public)
   - **Authentication flow:** marque **Standard flow** e **Direct access grants**
4. **Login settings:**
   - **Valid redirect URIs:** `http://localhost:3000/*`
   - **Web origins:** `http://localhost:3000`
5. Clique em **Save**

### Passo 5 — Criar Roles

1. Va em **Realm roles** → **Create role**
2. Crie as seguintes roles:
   - `admin`
   - `moderator`
   - `support`

### Passo 6 — Criar um Usuario de Teste

1. Va em **Users** → **Add user**
2. Preencha:
   - **Username:** `dev@nexo.local`
   - **Email:** `dev@nexo.local`
   - **Email verified:** ON
   - **First name:** `Dev`
   - **Last name:** `Nexo`
3. Clique em **Create**
4. Na aba **Credentials**:
   - Clique em **Set password**
   - Defina a senha (ex: `dev123`)
   - **Temporary:** OFF
5. Na aba **Role mapping**:
   - Clique em **Assign role**
   - Selecione `admin`

## Testando a Autenticacao

Use o client **nexo-web** (public) para obter tokens. O client **nexo-api** e confidential e serve apenas para validacao no backend.

### Obter um token JWT

```bash
curl -s -X POST http://localhost:8080/realms/nexo/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=nexo-web" \
  -d "grant_type=password" \
  -d "username=dev@nexo.local" \
  -d "password=<senha_definida>" | jq .access_token -r
```

### Chamar o endpoint /auth/me

```bash
TOKEN="<token_obtido_acima>"

curl -s http://localhost:3333/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

Resposta esperada:

```json
{
  "id": "b7191598-3f4d-4ff0-8cef-31bd606572bd",
  "keycloakId": "6b7df60c-f76f-4103-b34c-a173b38e0731",
  "email": "dev@nexo.local",
  "name": "Geraldo Luiz",
  "role": "SUPPORT",
  "isActive": true
}
```

O endpoint faz **upsert** automaticamente: na primeira chamada cria o usuario no banco, nas seguintes atualiza `lastLoginAt`.

### Respostas de erro

| Status | Descricao                                             |
| ------ | ----------------------------------------------------- |
| 401    | Token JWT ausente, expirado ou invalido               |
| 403    | Token valido mas sem permissao para acessar o recurso |
| 429    | Limite de requisicoes excedido (100 req/min)          |
| 500    | Erro interno (falha no banco, Keycloak indisponivel)  |

### Testando no Postman

1. **Obter token:** POST `http://localhost:8080/realms/nexo/protocol/openid-connect/token`
   - Body (x-www-form-urlencoded):
     - `client_id`: `nexo-web`
     - `grant_type`: `password`
     - `username`: `dev@nexo.local`
     - `password`: `<senha_definida>`
2. **Chamar API:** GET `http://localhost:3333/auth/me`
   - Header: `Authorization: Bearer <access_token>`

## Endpoints

| Metodo | Rota       | Auth | Descricao                   |
| ------ | ---------- | ---- | --------------------------- |
| GET    | `/auth/me` | JWT  | Retorna usuario autenticado |
| GET    | `/health`  | -    | Health check                |
| GET    | `/metrics` | -    | Metricas                    |
| GET    | `/docs`    | -    | Swagger UI                  |

## Scripts

```bash
pnpm start:dev       # Desenvolvimento com hot-reload
pnpm build           # Build para producao
pnpm start:prod      # Iniciar build de producao
pnpm prisma:generate # Gerar Prisma Client
pnpm prisma:migrate  # Rodar migrations
pnpm prisma:studio   # Abrir Prisma Studio (GUI do banco)
pnpm test            # Rodar testes
pnpm lint            # Lint com auto-fix
```

## Stack

- **Runtime:** Node.js 20+ / TypeScript
- **Framework:** NestJS 11
- **ORM:** Prisma 7 com PostgreSQL
- **Auth:** Keycloak 26.5 (JWT via JWKS / Passport)
- **Logs:** Pino (pretty no dev, JSON em producao)
- **Docs:** Swagger/OpenAPI
- **Rate Limiting:** @nestjs/throttler (100 req/min)
- **Monorepo:** Turborepo + pnpm
