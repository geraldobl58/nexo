# Nexo Frontend (nexo-fe)

Frontend do Nexo — marketplace imobiliário construído com Next.js 14, Tailwind CSS, React Query e Keycloak para autenticação.

## Arquitetura

O projeto segue uma arquitetura **feature-based** com separação clara de responsabilidades:

```
src/
├── middleware.ts                # Middleware Next.js (protege rotas server-side)
│
├── features/                   # Módulos por funcionalidade
│   └── auth/                   # Feature de autenticação
│       ├── index.ts            # Barrel exports da feature
│       ├── actions/            # Server Actions ("use server")
│       │   ├── sync-me.ts      # Busca dados do usuário via API (server-side)
│       │   └── session.ts      # Gerencia cookie de sessão (httpOnly)
│       ├── components/         # Componentes específicos da feature
│       │   └── protected-route.tsx
│       ├── hooks/              # Hooks da feature
│       │   ├── use-auth.ts     # Hook de autenticação (React Query)
│       │   └── use-user.ts     # React Query hook para dados do usuário
│       ├── http/               # Chamadas HTTP client-side (Axios)
│       │   └── auth-api.ts     # Endpoints de autenticação
│       ├── types/              # TypeScript types da feature
│       │   └── index.ts        # User
│       └── schemas/            # Validação (Zod)
│
├── providers/                  # Providers globais (sem Context API)
│   ├── query-provider.tsx      # React Query (QueryClientProvider)
│   └── auth-provider.tsx       # Inicializa Keycloak e seta React Query cache
│
├── components/                 # Componentes compartilhados (UI)
│   └── ui/
│       └── button.tsx          # shadcn/ui components
│
├── config/                     # Configurações globais
│   └── api.ts                  # Cliente Axios com interceptor JWT
│
├── lib/                        # Bibliotecas e utilitários
│   ├── keycloak.ts             # Instância do Keycloak JS
│   └── utils.ts                # Utilitários (cn, etc.)
│
├── app/                        # Páginas Next.js (App Router)
│   ├── (marketing)/
│   │   └── page.tsx            # Home (pública)
│   ├── panel/
│   │   └── page.tsx            # Painel administrativo (protegido)
│   └── layout.tsx              # Layout raiz com Providers
│
└── public/
    └── silent-check-sso.html   # SSO silencioso do Keycloak
```

### Convenção para novas features

Cada feature segue a mesma estrutura:

```
src/features/<nome-da-feature>/
├── index.ts            # Barrel exports (API pública da feature)
├── actions/            # Server Actions ("use server") - chamadas seguras ao backend
├── components/         # Componentes React da feature
├── hooks/              # Custom hooks (React Query, estado local)
├── http/               # Chamadas HTTP client-side (Axios)
├── types/              # Interfaces e tipos TypeScript
├── schemas/            # Schemas de validação (Zod)
```

Importar sempre pelo barrel export: `import { useAuth, ProtectedRoute } from "@/features/auth"`.

## Proteção de Rotas (Middleware + ProtectedRoute)

O projeto usa **duas camadas de proteção** que se complementam:

### 1. Middleware (server-side)

O `middleware.ts` roda no servidor **antes** da página carregar. Verifica o cookie `nexo-session` (httpOnly) e redireciona para `/` se ausente. Isso evita o "flash" de conteúdo protegido.

```
Requisição → Middleware → Cookie existe? → Sim → Renderiza página
                                         → Não → Redirect para /
```

Rotas protegidas pelo middleware: `/panel/*`

### 2. ProtectedRoute (client-side)

O componente `ProtectedRoute` valida o token Keycloak no client-side. Funciona como segunda camada de segurança — garante que o token é válido e não apenas que o cookie existe.

```tsx
import { ProtectedRoute, useAuth } from "@/features/auth";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <h1>Bem-vindo, {user?.name}!</h1>
    </ProtectedRoute>
  );
}
```

### Por que manter os dois?

| Camada         | Onde roda        | O que verifica        | Benefício                  |
| -------------- | ---------------- | --------------------- | -------------------------- |
| Middleware     | Servidor (edge)  | Cookie `nexo-session` | Redirect rápido, sem flash |
| ProtectedRoute | Client (browser) | Token Keycloak válido | Validação real do token    |

## Server Actions ("use server")

As chamadas à API backend são feitas via **Server Actions** para maior segurança:

- A URL da API (`API_URL`) fica **apenas no servidor** — não exposta no bundle do client
- O token JWT é passado para a server action, que faz a requisição server-side
- Detalhes da requisição (headers, URLs internas) ficam ocultos do browser

```tsx
// src/features/auth/actions/sync-me.ts
"use server";

export async function syncMeAction(token: string): Promise<User> {
  const res = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
```

O hook `useUser()` chama a server action automaticamente via React Query:

```tsx
// src/features/auth/hooks/use-user.ts
const query = useQuery({
  queryKey: ["auth", "user"],
  queryFn: async () => {
    await keycloak.updateToken(30);
    return syncMeAction(keycloak.token!);
  },
  enabled: isAuthenticated,
});
```

## Gerenciamento de Estado com React Query (sem Context API)

O projeto usa **@tanstack/react-query** como unica solucao de estado — **sem Context API**:

- **Auth status** (`isAuthenticated`, `isLoading`) — armazenado no cache React Query via `AUTH_SESSION_KEY`
- **Dados do usuário** — query `["auth", "user"]` que chama server action
- **AuthProvider** — apenas inicializa o Keycloak e seta dados no cache (nao usa Context.Provider)
- **useAuth()** — le do cache React Query, sem useContext

Benefícios:

- Cache automático e deduplicação de requisições
- Revalidação inteligente (stale-while-revalidate)
- Retry automático em caso de falha
- Estado global sem prop drilling ou Context boilerplate

### Exemplo: criando uma nova feature com server action

```tsx
// src/features/properties/actions/fetch-properties.ts
"use server";

export async function fetchPropertiesAction(token: string) {
  const res = await fetch(`${process.env.API_URL}/properties`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
```

```tsx
// src/features/properties/hooks/use-properties.ts
import { useQuery } from "@tanstack/react-query";
import keycloak from "@/lib/keycloak";
import { fetchPropertiesAction } from "../actions/fetch-properties";

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      await keycloak.updateToken(30);
      return fetchPropertiesAction(keycloak.token!);
    },
  });
}
```

## Fluxo de Autenticação

```
1. Usuário acessa /panel sem estar autenticado
   → Middleware detecta ausência do cookie nexo-session
   → Redireciona para / (server-side, sem flash)

2. Usuário clica em "Entrar com Keycloak"
   → keycloak.login() redireciona para o Keycloak
   → Usuário faz login no Keycloak
   → Keycloak redireciona de volta para /panel com token JWT

3. AuthProvider inicializa
   → keycloak.init({ onLoad: 'check-sso' }) verifica SSO
   → Se autenticado: seta cookie nexo-session (httpOnly)
   → React Query busca dados do usuário via server action
   → Configura refresh automático do token (30s)

4. Usuário autenticado acessa /panel
   → Middleware permite (cookie presente)
   → ProtectedRoute valida token Keycloak
   → Página renderiza com dados do useAuth()

5. Requisições à API
   → Server actions fazem chamadas server-side
   → Token é passado como parâmetro e atualizado antes de expirar

6. Logout
   → useAuth().logout() limpa cookie nexo-session
   → Limpa estado e redireciona para Keycloak
   → Keycloak faz logout global e redireciona para home
```

## API do useAuth

```tsx
import { useAuth } from "@/features/auth";

const {
  user, // Dados do usuário (id, email, name, role, isActive)
  isLoading, // true durante inicialização/verificação
  isAuthenticated, // true se usuário estiver autenticado
  login, // Função para iniciar login no Keycloak
  logout, // Função para fazer logout (limpa cookie + Keycloak)
  refreshUserData, // Invalida cache React Query e recarrega dados
} = useAuth();
```

## Setup

### Pré-requisitos

- Node.js 20+
- pnpm
- Backend (nexo-be) rodando em `http://localhost:3333`
- Keycloak rodando em `http://localhost:8080`

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie ou edite o arquivo `.env`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
NEXT_PUBLIC_KEYCLOAK_URL="http://localhost:8080"
NEXT_PUBLIC_KEYCLOAK_REALM="nexo"
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID="nexo-web"

# Server-only (usado por server actions - não exposto ao client)
API_URL="http://localhost:3333"
```

> **Importante:**
>
> - `NEXT_PUBLIC_*` — embutidas no bundle JavaScript em **build-time** (expostas ao client)
> - `API_URL` — disponível apenas no servidor (server actions, middleware). Mais seguro.

### 3. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Variáveis de Ambiente por Ambiente

| Variável                         | Tipo                | develop                                   | prod                              |
| -------------------------------- | ------------------- | ----------------------------------------- | --------------------------------- |
| `API_URL`                        | Server-only         | `http://nexo-be-nexo-develop:3000`        | `http://nexo-be-nexo-prod:3000`   |
| `NEXT_PUBLIC_API_URL`            | Client (build-time) | `https://develop.api.g3developer.online`  | `https://api.g3developer.online`  |
| `NEXT_PUBLIC_KEYCLOAK_URL`       | Client (build-time) | `https://develop.auth.g3developer.online` | `https://auth.g3developer.online` |
| `NEXT_PUBLIC_KEYCLOAK_REALM`     | Client (build-time) | `nexo`                                    | `nexo`                            |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Client (build-time) | `nexo-web`                                | `nexo-fe`                         |

Os valores ficam definidos em:

- **Local:** `.env` (localhost)
- **Kubernetes:** `infra/helm/nexo-fe/values-{env}.yaml`
- **Pipeline:** `.github/workflows/pipeline.yml` (Docker build args para `NEXT_PUBLIC_*`)

> `API_URL` (server-only) é injetado como env var runtime pelo Helm — funciona sem build args porque só é lido no servidor.

## Configuração do Keycloak

O frontend usa o client **nexo-web** (public) para autenticação:

1. **Client ID:** `nexo-web`
2. **Client type:** OpenID Connect
3. **Client authentication:** OFF (public)
4. **Valid redirect URIs:** `http://localhost:3000/*`
5. **Web origins:** `http://localhost:3000`
6. **Authentication flow:** Standard flow + Direct access grants

## Páginas

| Rota     | Descrição                | Protegida                         |
| -------- | ------------------------ | --------------------------------- |
| `/`      | Home / Login (marketing) | Não                               |
| `/panel` | Painel administrativo    | Sim (Middleware + ProtectedRoute) |

## Scripts

```bash
pnpm dev         # Desenvolvimento com hot-reload
pnpm build       # Build para produção
pnpm start       # Iniciar build de produção
pnpm lint        # Lint com ESLint
```

## Segurança

- Tokens JWT com refresh automático
- SSO (Single Sign-On) via Keycloak
- PKCE (Proof Key for Code Exchange) ativado
- Proteção dupla de rotas (Middleware + ProtectedRoute)
- Cookie de sessão httpOnly (não acessível via JavaScript)
- Server Actions para chamadas à API (URL do backend oculta do client)
- Logout global (invalida sessão no Keycloak + limpa cookie)
- Tokens armazenados apenas em memória (não em localStorage)

## Stack

- **Framework:** Next.js 14 (App Router + Middleware)
- **Linguagem:** TypeScript
- **Estado + Data Fetching:** React Query (@tanstack/react-query) + Server Actions (sem Context API)
- **HTTP Client:** Axios (client-side) / fetch (server actions)
- **Estilização:** Tailwind CSS
- **Autenticação:** Keycloak JS Client 26.2.3
- **UI Components:** Radix UI (shadcn/ui) + Lucide Icons
- **Monorepo:** Turborepo + pnpm

## Próximos Passos

- [ ] Adicionar gerenciamento de anúncios no painel
- [ ] Implementar controle de permissões por role
- [ ] Adicionar testes (Vitest + React Testing Library)
- [ ] Implementar dark mode
- [ ] Adicionar i18n (internacionalização)
