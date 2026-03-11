# Nexo Backend (nexo-be)

API backend do Nexo — marketplace imobiliário construído com NestJS, Prisma e Keycloak.

## Arquitetura

O projeto segue **Clean Architecture** com **Domain-Driven Design (DDD)**, separando responsabilidades em camadas dentro de cada módulo:

```
src/
├── modules/
│   ├── auth/                    # Autenticação Keycloak (JWT / Passport)
│   ├── identity/                # Sincronização de usuários internos (equipe)
│   ├── marketing/               # Módulo de anúncios de imóveis
│   │   ├── domain/              # Entidades, interfaces e enums (sem deps externas)
│   │   │   ├── entities/        # ListingEntity
│   │   │   ├── enums/           # ListingStatus, ListingPlan, etc.
│   │   │   ├── repositories/    # Interface ListingRepository
│   │   │   └── value-objects/
│   │   ├── application/         # Casos de uso (orquestram o domain)
│   │   │   └── use-cases/       # Create, Get, Update, Delete, Publish, etc.
│   │   ├── infrastructure/      # Implementações concretas
│   │   │   ├── prisma/          # PrismaListingRepository
│   │   │   ├── cloudinary/      # Upload de mídias
│   │   │   └── http/            # Controllers + DTOs
│   │   └── modules/             # Wiring NestJS (DI)
│   └── users/                   # Módulo de anunciantes externos
├── libs/                        # Módulos compartilhados (PrismaModule, etc.)
├── app.module.ts
└── main.ts
```

### Princípios

- **Domain** nunca importa de infrastructure — define apenas interfaces e tipos
- **Infrastructure** implementa as interfaces do domain (ex: `PrismaListingRepository` implementa `ListingRepository`)
- **Application** orquestra domain sem saber da infra (depende apenas de interfaces)
- **HTTP** lida exclusivamente com requisições (guards, decorators, controllers, DTOs)
- **Module** faz o wiring via DI — único lugar que conhece todas as camadas

## Modelo de Negócio

### Atores do sistema

O sistema distingue dois tipos de atores autenticados:

| Modelo       | Quem é                          | Origem do JWT               |
| ------------ | ------------------------------- | --------------------------- |
| `User`       | Equipe interna (admin, suporte) | Keycloak — roles do realm   |
| `Advertiser` | Anunciante externo do portal    | Keycloak (sem role interna) |

### Tipos de anunciante (`AdvertiserType`)

| Tipo        | Descrição                       |
| ----------- | ------------------------------- |
| `AGENCY`    | Imobiliária                     |
| `BROKER`    | Corretor independente           |
| `OWNER`     | Proprietário direto (sem CRECI) |
| `DEVELOPER` | Construtora / Incorporadora     |

### Planos de assinatura (`PlanType`)

| Plano          | Preço/mês | Máx. imóveis  | Máx. fotos | Máx. vídeos |
| -------------- | --------- | ------------- | ---------- | ----------- |
| `BASIC`        | Gratuito  | **1**         | 5          | 0           |
| `INTERMEDIATE` | R$ 49,90  | 5             | 10         | 1           |
| `PREMIUM`      | R$ 99,90  | **ilimitado** | 10         | 1           |

> `maxProperties = -1` significa ilimitado (plano PREMIUM).
> O plano BASIC é atribuído automaticamente ao criar um anunciante.

## Autenticação

### Clientes Keycloak: nexo-web vs nexo-api

#### nexo-web (Public Client)

- **Tipo:** Public (sem client_secret)
- **Propósito:** Emitir tokens JWT para usuários e anunciantes
- **Usado por:** Frontend (Next.js), Postman, ferramentas de teste

#### nexo-api (Confidential Client)

- **Tipo:** Confidential (requer client_secret)
- **Propósito:** Validar tokens JWT nas requisições ao backend
- **Usado por:** Backend NestJS via `KeycloakStrategy` (Passport JWT + JWKS)

#### Fluxo de autenticação

```
1. Usuário faz login via nexo-web
   → POST /realms/nexo/protocol/openid-connect/token
   → Retorna access_token (JWT RS256)

2. Cliente envia request com Bearer Token
   → JwtAuthGuard intercepta
   → KeycloakStrategy valida via JWKS (chaves públicas do nexo-api)
   → Extrai claims: sub, email, name, realm_access.roles
   → Retorna AuthUser para o controller

3. SyncUserUseCase (identity)
   → Faz upsert do usuário interno no banco (User)
   → Mapeia roles do Keycloak para roles internas (ADMIN / MODERATOR / SUPPORT)
```

## Setup

### Pré-requisitos

- Node.js 20+
- pnpm
- Docker e Docker Compose

### 1. Subir os serviços

```bash
# Na raiz do monorepo
docker compose up -d
```

Inicia:

- **PostgreSQL** na porta `5432` (bancos: `nexo_db` e `nexo_keycloak`)
- **Keycloak 26** na porta `8080` (admin: `admin`/`admin`)

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3333
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://nexo:nexo_password@localhost:5432/nexo_db
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_INTERNAL_URL=http://localhost:8080
KEYCLOAK_REALM=nexo
```

> **Kubernetes:** `KEYCLOAK_URL` deve ser a URL externa (issuer do token, ex: `https://develop.auth.nexo.local`) e `KEYCLOAK_INTERNAL_URL` aponta para o serviço interno do cluster para buscar as JWKS.

### 3. Configurar o banco

```bash
pnpm prisma:generate   # Gera o Prisma Client
pnpm prisma:migrate    # Aplica as migrations
pnpm prisma:seed       # Popula com dados de desenvolvimento
```

### 4. Iniciar o servidor

```bash
pnpm start:dev
```

API disponível em `http://localhost:3333` — Swagger em `http://localhost:3333/docs`.

## Configuração do Keycloak

Acesse `http://localhost:8080` com `admin`/`admin`.

### Passo 1 — Desabilitar SSL (desenvolvimento local)

```bash
docker exec nexo-auth-dev /opt/keycloak/bin/kcadm.sh \
  config credentials --server http://localhost:8080 --realm master --user admin --password admin

docker exec nexo-auth-dev /opt/keycloak/bin/kcadm.sh \
  update realms/master -s sslRequired=NONE
```

### Passo 2 — Criar o Realm `nexo`

1. Menu lateral → dropdown do realm → **Create realm**
2. **Realm name:** `nexo` → **Create**
3. Desabilitar SSL no novo realm:

```bash
docker exec nexo-auth-dev /opt/keycloak/bin/kcadm.sh \
  update realms/nexo -s sslRequired=NONE
```

### Passo 3 — Criar o Client do Backend (`nexo-api`)

1. **Clients** → **Create client**
2. **Client ID:** `nexo-api` | **Client type:** OpenID Connect
3. **Client authentication:** ON | **Standard flow** + **Direct access grants**
4. **Valid redirect URIs:** `http://localhost:3333/*` | **Web origins:** `http://localhost:3333`

### Passo 4 — Criar o Client do Frontend (`nexo-web`)

1. **Clients** → **Create client**
2. **Client ID:** `nexo-web` | **Client type:** OpenID Connect
3. **Client authentication:** OFF (public) | **Standard flow** + **Direct access grants**
4. **Valid redirect URIs:** `http://localhost:3000/*` | **Web origins:** `http://localhost:3000`

### Passo 5 — Criar Roles

Em **Realm roles** → **Create role**, crie:

- `admin`
- `moderator`
- `support`

### Passo 6 — Criar Usuário de Teste

1. **Users** → **Add user** → Username: `dev@nexo.local` | Email verified: ON
2. Aba **Credentials** → **Set password** → Temporary: OFF
3. Aba **Role mapping** → **Assign role** → `admin`

## Testando a Autenticação

### Obter token JWT

```bash
curl -s -X POST http://localhost:8080/realms/nexo/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=nexo-web" \
  -d "grant_type=password" \
  -d "username=dev@nexo.local" \
  -d "password=<sua_senha>" | jq .access_token -r
```

### Chamar `/auth/me`

```bash
curl -s http://localhost:3333/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

```json
{
  "id": "b7191598-...",
  "keycloakId": "6b7df60c-...",
  "email": "dev@nexo.local",
  "name": "Dev Nexo",
  "role": "ADMIN",
  "isActive": true
}
```

### Respostas de erro

| Status | Descrição                                              |
| ------ | ------------------------------------------------------ |
| 401    | Token JWT ausente, expirado ou inválido                |
| 403    | Token válido mas sem permissão para o recurso          |
| 429    | Limite de requisições excedido (100 req/min)           |
| 500    | Erro interno (banco indisponível, Keycloak fora do ar) |

## Endpoints

| Método | Rota                            | Auth | Descrição                             |
| ------ | ------------------------------- | ---- | ------------------------------------- |
| GET    | `/auth/me`                      | JWT  | Retorna usuário interno autenticado   |
| GET    | `/health`                       | —    | Health check                          |
| GET    | `/metrics`                      | —    | Métricas Prometheus                   |
| GET    | `/docs`                         | —    | Swagger UI                            |
| GET    | `/marketing`                    | —    | Lista anúncios públicos (ACTIVE)      |
| GET    | `/marketing/:id`                | —    | Detalhe de anúncio público            |
| GET    | `/marketing/me`                 | JWT  | Lista meus anúncios (todos os status) |
| GET    | `/marketing/me/:id`             | JWT  | Detalhe de um anúncio próprio         |
| POST   | `/marketing`                    | JWT  | Cria novo anúncio (DRAFT)             |
| PATCH  | `/marketing/:id`                | JWT  | Atualiza anúncio próprio              |
| DELETE | `/marketing/:id`                | JWT  | Remove anúncio (soft delete)          |
| PATCH  | `/marketing/:id/publish`        | JWT  | Publica anúncio (DRAFT → ACTIVE)      |
| PATCH  | `/marketing/:id/unpublish`      | JWT  | Pausa anúncio (ACTIVE → INACTIVE)     |
| PATCH  | `/marketing/:id/reactivate`     | JWT  | Reativa anúncio (INACTIVE → ACTIVE)   |
| POST   | `/marketing/:id/media`          | JWT  | Upload de mídia (foto/vídeo)          |
| DELETE | `/marketing/:id/media/:mediaId` | JWT  | Remove uma mídia                      |
| PATCH  | `/marketing/:id/media/reorder`  | JWT  | Reordena mídias                       |

## Controle de Acesso

### Ownership de anúncios

Quando um anunciante cria um anúncio via `POST /marketing`, o campo `advertiserId` é preenchido com o `id` do `Advertiser` autenticado. Esse anunciante se torna o **dono** do anúncio.

### Regras por endpoint

| Endpoint                              | Público | Dono             | Admin / Moderador |
| ------------------------------------- | ------- | ---------------- | ----------------- |
| `POST /marketing`                     | ✗       | ✓ cria           | ✓ cria            |
| `GET /marketing` (ACTIVE)             | ✓       | ✓                | ✓                 |
| `GET /marketing` (DRAFT/INACTIVE)     | ✗ 403   | ✓ só os próprios | ✓ todos           |
| `GET /marketing/:id` (ACTIVE)         | ✓       | ✓                | ✓                 |
| `GET /marketing/:id` (DRAFT/INACTIVE) | 404     | ✓                | ✓                 |
| `PATCH /marketing/:id`                | ✗       | ✓ só o próprio   | ✓ qualquer        |
| `DELETE /marketing/:id`               | ✗       | ✓ só o próprio   | ✓ qualquer        |
| `PATCH /marketing/:id/publish`        | ✗       | ✓ só o próprio   | ✓ qualquer        |
| `PATCH /marketing/:id/unpublish`      | ✗       | ✓ só o próprio   | ✓ qualquer        |

> **404 em rascunhos:** ao tentar `GET /marketing/:id` de um DRAFT sem ser o dono, a API retorna 404 intencionalmente — não vaza a existência de rascunhos de outros anunciantes.

### Ciclo de vida de um anúncio

```
POST /marketing
  └─► status: DRAFT  (invisível no portal — só o dono vê)
        │
        ▼ PATCH /:id/publish
      status: ACTIVE  (visível nas buscas públicas)
        │
        ├─► PATCH /:id/unpublish → INACTIVE  (fora do ar, dono ainda vê)
        │     └─► PATCH /:id/publish → ACTIVE novamente
        │
        ├─► status: SOLD    (venda concluída)
        └─► status: RENTED  (aluguel concluído)
```

### Roles internas (equipe)

| Role no Keycloak | Role no banco | Permissão                                  |
| ---------------- | ------------- | ------------------------------------------ |
| `admin`          | `ADMIN`       | Tudo — vê e edita anúncios de qualquer um  |
| `moderator`      | `MODERATOR`   | Vê e edita anúncios de qualquer anunciante |
| qualquer outra   | `SUPPORT`     | Acesso básico — operações de suporte       |

> Anunciantes externos (`Advertiser`) não usam o modelo `User`. A proteção dos dados deles é feita pela verificação `listing.advertiserId === advertiser.id`.

## Regras de Negócio — Planos

### Regra 1 — Limite de imóveis ativos por plano

**Use case:** `CreateListingUseCase`

Antes de criar o anúncio:

```
1. Busca o plano via getAdvertiserPlanLimits(advertiserId)
2. Se maxProperties !== -1:
      count = countActiveByAdvertiser(advertiserId)
      Se count >= maxProperties → ForbiddenException (403)
         "Você atingiu o limite de N imóvel(is) do seu plano."
3. Cria o anúncio normalmente
```

Métodos do `ListingRepository`:

- `countActiveByAdvertiser(advertiserId)` — conta imóveis ativos não-deletados e com status diferente de SOLD/RENTED
- `getAdvertiserPlanLimits(advertiserId)` — retorna `{ maxProperties, maxPhotos, maxVideos }` da assinatura ativa (fallback: limites do plano BASIC)

### Regra 2 — Limite de mídias por plano

**Use case:** `UploadMediaUseCase`

```
1. Busca o anúncio e seu advertiserId
2. Chama getAdvertiserPlanLimits(advertiserId)
3. Para fotos: se currentCount >= maxPhotos → BadRequestException (400)
4. Para vídeos: se currentCount >= maxVideos → BadRequestException (400)
```

## Seed de Dados de Teste

O arquivo `prisma/seed.ts` popula o banco com dados completos de desenvolvimento.

### Rodar o seed

```bash
pnpm prisma:seed
```

### O que o seed cria

| Recurso     | Quantidade | Detalhes                                                  |
| ----------- | ---------- | --------------------------------------------------------- |
| Planos      | 3          | BASIC (grátis), INTERMEDIATE (R$49,90), PREMIUM (R$99,90) |
| Anunciantes | 5          | AGENCY, BROKER, OWNER, DEVELOPER + bulk tester (BROKER)   |
| Assinaturas | 5          | Cada anunciante com plano adequado ao seu tipo            |
| Imóveis     | 50+        | Distribuídos por tipo, status e cidade (SP, RJ, MG, etc.) |
| Conversas   | Várias     | Vinculadas a anunciantes                                  |

### Bulk tester (50 imóveis para paginação)

O seed cria um anunciante `BROKER` com assinatura PREMIUM para testes de paginação e filtros. Para vinculá-lo ao seu usuário Keycloak:

```bash
# .env (apps/nexo-be)
SEED_OWNER_KEYCLOAK_ID=<uuid-do-seu-usuario-no-keycloak>
```

Para obter o UUID:

```bash
echo "<access_token>" | cut -d. -f2 | base64 -d 2>/dev/null | jq .sub
```

## Scripts

```bash
pnpm start:dev        # Desenvolvimento com hot-reload
pnpm build            # Build para produção
pnpm start:prod       # Iniciar build de produção
pnpm prisma:generate  # Gerar Prisma Client
pnpm prisma:migrate   # Rodar migrations
pnpm prisma:reset     # Resetar banco e re-aplicar migrations
pnpm prisma:seed      # Popular banco com dados de desenvolvimento
pnpm prisma:studio    # Abrir Prisma Studio (GUI do banco)
pnpm test             # Rodar testes unitários
pnpm test:e2e         # Rodar testes e2e
pnpm test:cov         # Rodar testes com cobertura
pnpm lint             # Lint com auto-fix
```

## Stack

| Camada     | Tecnologia                                     |
| ---------- | ---------------------------------------------- |
| Runtime    | Node.js 20+ / TypeScript                       |
| Framework  | NestJS 11                                      |
| ORM        | Prisma 7 com `@prisma/adapter-pg` (PostgreSQL) |
| Auth       | Keycloak 26 (JWT RS256 via JWKS / Passport)    |
| Upload     | Cloudinary                                     |
| Logs       | Pino (pretty no dev, JSON em produção)         |
| Docs       | Swagger / OpenAPI                              |
| Rate Limit | @nestjs/throttler (100 req/min)                |
| Monorepo   | Turborepo + pnpm                               |
