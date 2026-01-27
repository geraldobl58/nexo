# 🏗️ Arquitetura

Visão técnica da arquitetura do Nexo Platform.

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                    │
│                    (Web Browser, Mobile App, API)                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           EDGE LAYER                                    │
│                    (Cloudflare / Load Balancer)                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    nexo-fe       │  │    nexo-be       │  │   nexo-auth      │
│    (Next.js)     │  │    (NestJS)      │  │   (Keycloak)     │
│    Port: 3000    │  │    Port: 3001    │  │    Port: 8080    │
└────────┬─────────┘  └────────┬─────────┘  └──────────────────┘
         │                     │
         │                     ▼
         │           ┌──────────────────┐
         │           │    PostgreSQL    │◄─────────────────────┐
         │           │    Port: 5432    │                      │
         │           └──────────────────┘                      │
         │                     │                               │
         │           ┌──────────────────┐                      │
         │           │      Redis       │                      │
         │           │    Port: 6379    │                      │
         │           └──────────────────┘                      │
         │                                                     │
         └─────────────────────────────────────────────────────┘
                            (via Backend API)
```

## Stack Tecnológica

### Frontend (nexo-fe)

| Tecnologia   | Versão | Propósito       |
| ------------ | ------ | --------------- |
| Next.js      | 14.x   | Framework React |
| React        | 18.x   | UI Library      |
| TypeScript   | 5.x    | Type Safety     |
| Tailwind CSS | 3.x    | Styling         |
| shadcn/ui    | latest | Componentes     |

### Backend (nexo-be)

| Tecnologia | Versão | Propósito      |
| ---------- | ------ | -------------- |
| NestJS     | 10.x   | Framework      |
| TypeScript | 5.x    | Type Safety    |
| Prisma     | 5.x    | ORM            |
| PostgreSQL | 16     | Database       |
| Redis      | 7      | Cache/Sessions |

### Autenticação (nexo-auth)

| Tecnologia     | Versão | Propósito         |
| -------------- | ------ | ----------------- |
| Keycloak       | 26.x   | Identity Provider |
| OAuth 2.0      | -      | Authorization     |
| OpenID Connect | -      | Authentication    |

## Estrutura de Pastas

```
nexo/
├── apps/
│   ├── nexo-be/                  # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/          # Feature modules
│   │   │   ├── common/           # Shared utilities
│   │   │   └── main.ts           # Entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── migrations/       # Database migrations
│   │   └── test/                 # E2E tests
│   │
│   ├── nexo-fe/                  # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/              # App Router pages
│   │   │   ├── components/       # React components
│   │   │   └── lib/              # Utilities
│   │   └── public/               # Static assets
│   │
│   └── nexo-auth/                # Keycloak customization
│       └── themes/               # Custom themes
│           └── nexo/             # Nexo theme
│
├── packages/                     # Shared packages
│   ├── ui/                       # Shared UI components
│   ├── config/                   # Shared configurations
│   └── auth/                     # Auth library
│
└── infra/                        # Infrastructure
    ├── k8s/                      # Kubernetes manifests
    │   ├── base/                 # Base Kustomize
    │   └── overlays/             # Environment overlays
    └── helm/                     # Helm charts
```

## Padrões de Código

### Backend (NestJS)

```typescript
// Módulo bem estruturado
@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

// Controller com validação
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }
}

// Service com injeção de dependência
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### Frontend (Next.js)

```typescript
// Server Component (padrão)
async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  return <UserProfile user={user} />;
}

// Client Component (quando necessário)
'use client';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Fluxo de Autenticação

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │ nexo-be  │         │ Keycloak │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  1. Login Request  │                    │
     │───────────────────►│                    │
     │                    │  2. Redirect       │
     │                    │───────────────────►│
     │  3. Auth Page      │                    │
     │◄───────────────────────────────────────-│
     │                    │                    │
     │  4. Credentials    │                    │
     │────────────────────────────────────────►│
     │                    │                    │
     │  5. Auth Code      │                    │
     │◄───────────────────────────────────────-│
     │                    │                    │
     │  6. Exchange Code  │                    │
     │───────────────────►│  7. Get Token      │
     │                    │───────────────────►│
     │                    │  8. JWT Token      │
     │                    │◄───────────────────│
     │  9. Session        │                    │
     │◄───────────────────│                    │
     │                    │                    │
```

## Banco de Dados

### Schema Simplificado

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

### Convenções

- IDs: UUID v4
- Timestamps: `createdAt`, `updatedAt` em todas as tabelas
- Soft delete: campo `deletedAt` quando necessário
- Índices: em campos de busca frequente

## Cache Strategy

```
┌─────────────┐    Cache Miss    ┌─────────────┐
│   Request   │─────────────────►│  PostgreSQL │
└──────┬──────┘                  └──────┬──────┘
       │                                │
       │         ┌──────────┐           │
       └────────►│   Redis  │◄──────────┘
                 │  (Cache) │   Cache Set
                 └──────────┘
```

- **TTL padrão**: 1 hora
- **Invalidação**: Por evento (CQRS pattern)
- **Keys**: Namespace por entidade

## Próximos Passos

- 💻 [Desenvolvimento](development.md) - Fluxo de trabalho
- 📡 [API](api.md) - Endpoints da API
- 🚀 [Deploy](deploy.md) - CI/CD e produção
