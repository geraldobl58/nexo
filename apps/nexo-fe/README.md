# Nexo Frontend (nexo-fe)

Frontend do Nexo — marketplace imobiliário construído com **Next.js 15** (App Router), **Tailwind CSS**, **TanStack Query v5** e **Keycloak** para autenticação.

## Stack

| Camada         | Tecnologia                                     |
| -------------- | ---------------------------------------------- |
| Framework      | Next.js 15 (App Router), React 19              |
| Linguagem      | TypeScript 5 (strict mode)                     |
| Estilização    | Tailwind CSS 3 + MUI v7                        |
| Estado / Dados | TanStack Query v5                              |
| Autenticação   | Keycloak JS (PKCE, tokens em `sessionStorage`) |
| Formulários    | react-hook-form v7 + Zod v4                    |
| HTTP           | Axios com interceptor do bearer token Keycloak |
| Mapas          | Leaflet / react-leaflet                        |
| Testes         | Vitest + Testing Library + Playwright          |
| Monorepo       | pnpm workspaces + Turborepo                    |

---

## Estrutura de pastas

```
src/
├── middleware.ts                  # Guard de rotas server-side (cookie nexo-session)
│
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Layout raiz (AuthProvider, MuiProvider, QueryProvider)
│   ├── (marketing)/               # Route group — páginas públicas (Header + Footer)
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Homepage
│   │   ├── imovel/[id]/page.tsx   # Detalhe público do anúncio
│   │   └── publish/
│   │       ├── page.tsx           # Escolha de plano
│   │       └── owner/page.tsx     # Wizard de publicação
│   └── panel/                     # Área protegida (ProtectedRoute + sidebar)
│       ├── layout.tsx
│       ├── page.tsx               # Dashboard
│       └── my-properties/
│           ├── page.tsx
│           └── [my-property]/page.tsx
│
├── features/                      # Feature slices (organização vertical)
│   ├── auth/
│   │   ├── index.ts               # Barrel export da feature
│   │   ├── actions/
│   │   │   ├── session.action.ts  # "use server" — gerencia cookies nexo-session / nexo-user
│   │   │   └── sync-me.action.ts  # "use server" — GET /auth/me com API_URL privada
│   │   ├── components/
│   │   │   └── protected-route.tsx
│   │   ├── hooks/
│   │   │   ├── use-auth.hook.ts   # isAuthenticated, login, logout
│   │   │   └── use-user.hook.ts   # dados do usuário via React Query
│   │   ├── services/
│   │   │   └── auth.service.ts    # GET /auth/me (client-side Axios)
│   │   └── types/
│   │       └── user.type.ts       # interface User
│   │
│   ├── dashboard/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   └── chart-last-days.tsx
│   │   ├── hooks/
│   │   │   └── use-my-listings-count.hook.ts
│   │   └── services/
│   │       └── dashboard.service.ts
│   │
│   ├── marketing/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── marketing-card.component.tsx
│   │   │   └── marketing-search-form.component.tsx
│   │   ├── hooks/
│   │   │   └── use-marketing.hook.ts
│   │   ├── services/
│   │   │   └── marketing.service.ts   # GET /marketing
│   │   └── types/
│   │       └── marketing.type.ts
│   │
│   └── owner/
│       ├── index.ts
│       ├── actions/
│       │   ├── my-listings.action.ts  # CRUD client-side (Axios + KC interceptor)
│       │   └── publish.action.ts      # createPublication, uploadMediaFiles
│       ├── components/
│       │   ├── my-properties.tsx
│       │   ├── my-property.tsx
│       │   ├── my-property-by-id.tsx
│       │   ├── my-property-publish-wizard.tsx
│       │   ├── my-property-media-card.tsx
│       │   ├── action-cell.tsx
│       │   ├── columns.tsx
│       │   └── steps/
│       │       ├── step-location.tsx
│       │       ├── step-details.tsx
│       │       ├── step-photos.tsx
│       │       ├── step-comodities.tsx
│       │       ├── step-contact.tsx
│       │       └── step-finished.tsx
│       ├── enums/
│       │   └── listing.enum.ts        # Purpose, PropertyType, Listing, labels
│       ├── hooks/
│       │   ├── use-my-listings.hook.ts
│       │   └── use-media.hook.ts
│       ├── schemas/
│       │   ├── publish-location.schema.ts
│       │   ├── publish-details.schema.ts
│       │   ├── publish-comodities.schema.ts
│       │   └── publish-contact.schema.ts
│       ├── services/
│       │   ├── listing.service.ts     # GET /marketing/:id (público)
│       │   ├── my-listings.service.ts # CRUD /marketing/me (autenticado)
│       │   └── publish.service.ts     # POST /marketing/me + media upload
│       └── types/
│           ├── publish.type.ts
│           ├── publish-details.type.ts
│           ├── publish-comodities.type.ts
│           ├── publish-location.type.ts
│           └── my-property-media-card.type.ts
│
├── components/                    # Componentes compartilhados
│   ├── layout/                    # Header, Footer, Sidebar, Navbar, AppBar
│   ├── sections/                  # Seções da home (Hero, Feature, Information, System)
│   ├── feedback/                  # Loading
│   └── ui/                        # Primitivos de UI (Card, Carousel, DataTable, etc.)
│
├── config/
│   └── api.ts                     # Instância Axios com interceptor JWT do Keycloak
│
├── constants/
│   └── index.ts                   # BREADCRUMB_MAP, limites de plano
│
├── contexts/
│   └── publish-context.tsx        # Estado do wizard multi-step (persiste em sessionStorage)
│
├── lib/                           # Utilitários transversais
│   ├── keycloak.ts                # Singleton do Keycloak JS
│   ├── session.ts                 # Parse de cookies (Edge-safe)
│   ├── formatted-money.ts         # toCents, fromCents, formatCurrency
│   ├── fect-cep.ts                # Lookup de CEP via BrasilAPI
│   ├── media-upload.tsx           # Limites, tipos aceitos e validação de arquivos
│   ├── leaflet-map.tsx            # Componente de mapa (Leaflet)
│   └── settings-carousel.ts      # Configuração do Slick carousel
│
├── providers/
│   ├── auth-provider.tsx          # Inicializa Keycloak + sync de cookies
│   ├── mui-provider.tsx           # ThemeProvider MUI + AppRouterCache
│   └── query-provider.tsx         # TanStack QueryClientProvider
│
└── routes/
    └── index.tsx                  # Configuração de rotas do sidebar
```

---

## Convenções de nomenclatura

Baseadas nos mesmos padrões do backend:

| Tipo de arquivo       | Sufixo           | Exemplo                           |
| --------------------- | ---------------- | --------------------------------- |
| Hook (React Query)    | `.hook.ts`       | `use-my-listings.hook.ts`         |
| Serviço HTTP (Axios)  | `.service.ts`    | `my-listings.service.ts`          |
| Server Action         | `.action.ts`     | `session.action.ts`               |
| Schema de validação   | `.schema.ts`     | `publish-details.schema.ts`       |
| Tipos / interfaces    | `.type.ts`       | `publish.type.ts`, `user.type.ts` |
| Enum                  | `.enum.ts`       | `listing.enum.ts`                 |
| Componente de feature | `.component.tsx` | `marketing-card.component.tsx`    |

---

## Organização por feature slice

Cada feature em `src/features/` é **auto-contida** com a seguinte estrutura:

```
src/features/<nome>/
├── index.ts          # Barrel export (API pública da feature)
├── actions/          # Client-side actions ou Server Actions ("use server")
├── components/       # Componentes React específicos da feature
├── hooks/            # Custom hooks (TanStack Query)
├── services/         # Chamadas HTTP via Axios (client-side)
├── types/            # Interfaces e tipos TypeScript
├── schemas/          # Schemas de validação Zod
└── enums/            # Enums do domínio
```

**Regra:** importe sempre pelo barrel export quando disponível:

```tsx
import { useAuth, ProtectedRoute } from "@/features/auth";
import { useMyListings, Purpose } from "@/features/owner";
import { useMarketing } from "@/features/marketing";
```

---

## Proteção de rotas

O projeto usa **duas camadas** complementares:

### 1. Middleware (server-side, Edge)

`middleware.ts` roda antes da página carregar. Verifica o cookie `nexo-session` (httpOnly) e redireciona para `/` se ausente — sem flash de conteúdo.

Rotas protegidas: `/panel/*`

### 2. ProtectedRoute (client-side)

Componente que valida o token Keycloak no browser. Segunda linha de defesa, garante que o token é válido (não apenas que o cookie existe).

```tsx
import { ProtectedRoute, useAuth } from "@/features/auth";

export default function PanelLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

| Camada         | Onde roda       | O que verifica        | Benefício                  |
| -------------- | --------------- | --------------------- | -------------------------- |
| Middleware     | Servidor (edge) | Cookie `nexo-session` | Redirect rápido, sem flash |
| ProtectedRoute | Client          | Token Keycloak válido | Validação real do JWT      |

---

## Fluxo de autenticação

```
1. Usuário acessa /panel sem estar autenticado
   → Middleware: cookie nexo-session ausente → redirect para /

2. useAuth().login() é chamado
   → keycloak.login() redireciona para o Keycloak
   → Usuário realiza login
   → Keycloak redireciona de volta com código PKCE

3. AuthProvider (auth-provider.tsx) inicializa
   → keycloak.init({ pkceMethod: 'S256', checkLoginIframe: false })
   → Tokens armazenados em sessionStorage (kc_token, kc_refresh_token, kc_id_token)
   → syncMeAction(token) → GET /auth/me (server-side, URL privada)
   → setAuthCookie() → grava nexo-session (httpOnly) + nexo-user (base64)
   → React Query cache atualizado

4. Usuário autenticado acessa /panel
   → Middleware permite (cookie presente)
   → ProtectedRoute valida token Keycloak
   → useAuth() expõe { user, isAuthenticated }

5. Refresh automático
   → keycloak.onAuthRefreshSuccess → atualiza sessionStorage
   → keycloak.onAuthRefreshError  → força logout

6. Logout
   → sessionStorage limpo + cookies deletados
   → keycloak.logout() → redireciona para home
```

---

## API do `useAuth`

```tsx
import { useAuth } from "@/features/auth";

const {
  user, // User | null
  isLoading, // true durante inicialização
  isAuthenticated, // boolean
  login, // (redirectPath?: string) => Promise<void>
  logout, // () => Promise<void>
  refreshUserData, // () => Promise<void>
} = useAuth();
```

---

## Server Actions (`"use server"`)

Server Actions são usadas quando a chamada precisa de segurança server-side (URL privada, lógica de cookie):

```ts
// src/features/auth/actions/sync-me.action.ts
"use server";

export async function syncMeAction(token: string): Promise<User> {
  const res = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return res.json();
}
```

> `API_URL` é uma variável de ambiente **privada** (sem prefixo `NEXT_PUBLIC_`).
> Chamadas client-side usam `NEXT_PUBLIC_API_URL` via Axios (`src/config/api.ts`).

---

## Gerenciamento de estado (TanStack Query)

O projeto usa **TanStack Query v5** como única solução de estado global — **sem Context API**:

- **Auth status** (`isAuthenticated`, `isLoading`) — cache React Query via `AUTH_SESSION_KEY`
- **Dados do usuário** — query `["auth", "user"]` com `syncMeAction`
- **AuthProvider** — inicializa o Keycloak e atualiza o cache (não usa `Context.Provider`)
- **`useAuth()`** — lê do cache React Query, sem `useContext`

---

## Wizard de publicação

O fluxo de criação de anúncio usa `PublishContext` (`contexts/publish-context.tsx`) para coordenar o wizard multi-step:

```
Localização → Detalhes → Fotos → Comodidades → Contato → Concluído
```

- Estado persiste em `sessionStorage` com versionamento (`STORAGE_VERSION`) — dados de versões antigas são descartados automaticamente
- Arquivos de mídia (`File[]`) não são persistidos (não serializáveis)
- Ao concluir: `POST /marketing/me` (cria DRAFT) → upload das fotos → redirecionamento para `/panel`

---

## Regras de negócio — Planos de anúncio

| Plano      | Fotos | Anúncios ativos | Destaque | Status        |
| ---------- | ----- | --------------- | -------- | ------------- |
| `FREE`     | 5     | 1               | Não      | ✅ Disponível |
| `STANDARD` | 10    | Ilimitado       | Não      | 🔒 Em breve   |
| `FEATURED` | 10    | Ilimitado       | Sim      | 🔒 Em breve   |
| `PREMIUM`  | 10    | Ilimitado       | Sim      | 🔒 Em breve   |
| `SUPER`    | 10    | Ilimitado       | Sim      | 🔒 Em breve   |

> **Nota:** o módulo de pagamento ainda não está implementado. Todos os anúncios criados recebem o plano `FREE` por padrão (`listingPlan @default(FREE)` no Prisma Schema).

### Regra 1 — Anúncio único no plano FREE

Um usuário FREE só pode ter **1 anúncio ativo**. Validação dupla:

- **Backend:** `CreateListingUseCase` lança `ForbiddenException (403)` se `countActiveFreeByOwner >= 1`
- **Frontend:** `useMyListings()` expõe `isAtFreeLimit` (boolean) — botão "Novo anúncio" fica desabilitado com tooltip

### Regra 2 — Limite de fotos por plano

| Plano | Fotos | Vídeos |
| ----- | ----- | ------ |
| FREE  | 5     | 0      |
| Pagos | 10    | 2      |

Constantes em `src/lib/media-upload.tsx`: `MAX_IMAGES_FREE`, `MAX_IMAGES_PAID`, `MAX_VIDEOS`.

---

## Variáveis de ambiente

| Variável                         | Tipo                | Descrição                            |
| -------------------------------- | ------------------- | ------------------------------------ |
| `API_URL`                        | Server-only         | URL base do backend (Server Actions) |
| `NEXT_PUBLIC_API_URL`            | Client (build-time) | URL base do backend (Axios)          |
| `NEXT_PUBLIC_KEYCLOAK_URL`       | Client (build-time) | URL do Keycloak                      |
| `NEXT_PUBLIC_KEYCLOAK_REALM`     | Client (build-time) | Realm do Keycloak                    |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Client (build-time) | Client ID do Keycloak                |

> `NEXT_PUBLIC_*` são embutidas no bundle JS em build-time (expostas ao browser).
> `API_URL` fica **apenas no servidor** — nunca exposta ao client.

Os valores por ambiente ficam definidos nos Helm values em `local/helm/nexo-fe/`.

---

## Segurança

- PKCE (Proof Key for Code Exchange) ativado no Keycloak
- Tokens armazenados em `sessionStorage` (não em `localStorage`)
- Cookie `nexo-session` httpOnly — não acessível via JavaScript
- `API_URL` server-only — URL do backend nunca exposta ao client
- Proteção dupla de rotas (Middleware + ProtectedRoute)
- Refresh automático do token a cada 30s antes de expirar
- Logout global (invalida sessão no Keycloak + limpa cookie + limpa sessionStorage)

---

## Scripts

```bash
pnpm dev    # Desenvolvimento com hot-reload
pnpm build  # Build para produção
pnpm start  # Iniciar build de produção
pnpm lint   # Lint com ESLint
pnpm test   # Vitest
```

---

## Próximos passos

- [x] Wizard de publicação (localização → detalhes → fotos → comodidades → contato → concluído)
- [x] Painel do proprietário (listar, editar, publicar, despublicar, excluir)
- [x] Regra: plano FREE permite apenas 1 anúncio ativo
- [x] Regra: plano FREE permite até 5 fotos (planos pagos: até 10)
- [ ] Integração com gateway de pagamento (Stripe / Pagar.me)
- [ ] Planos pagos desbloqueáveis (STANDARD, FEATURED, PREMIUM, SUPER)
- [ ] Controle de permissões por role
- [ ] Testes unitários e de integração (Vitest + React Testing Library)
- [ ] Dark mode
- [ ] i18n (internacionalização)
