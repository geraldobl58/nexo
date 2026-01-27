# 💻 Referência de Desenvolvimento

Guia técnico para desenvolvimento no Nexo Platform.

> 📖 Para o workflow diário, veja [daily-development.md](daily-development.md)

## 🗄️ Banco de Dados (Prisma)

### Workflow

```bash
# Criar nova migration
make db-migrate

# Gerar Prisma Client
make db-generate

# Visualizar dados
make db-studio

# Reset completo (⚠️ apaga dados)
make db-reset
```

### Conexão Direta

```bash
# Via Docker
docker exec -it nexo-postgres-dev psql -U nexo -d nexo_db

# Via psql
psql postgresql://nexo:nexo_password@localhost:5432/nexo_db
```

## 🏗️ Estrutura de Código

### Backend - Novo Módulo

```bash
cd apps/nexo-be

# Criar módulo
pnpm nest g module modules/products
pnpm nest g controller modules/products
pnpm nest g service modules/products
```

**Estrutura resultante:**

```
src/modules/products/
├── products.module.ts
├── products.controller.ts
├── products.service.ts
└── dto/
    ├── create-product.dto.ts
    └── update-product.dto.ts
```

### Frontend - Nova Página

```
src/app/
├── products/              # Rota /products
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx       # Rota /products/:id
```

## 🧪 Testes

```bash
# Todos os testes
make test

# Backend
cd apps/nexo-be && pnpm test
cd apps/nexo-be && pnpm test:cov   # com coverage
cd apps/nexo-be && pnpm test:e2e   # E2E

# Frontend
cd apps/nexo-fe && pnpm test
```

## 📝 Git Workflow

### Branches

| Branch      | Propósito           | Deploy     |
| ----------- | ------------------- | ---------- |
| `main`      | Produção            | Automático |
| `staging`   | Pré-produção        | Automático |
| `develop`   | Desenvolvimento     | Automático |
| `feature/*` | Nova funcionalidade | -          |
| `bugfix/*`  | Correção            | -          |
| `hotfix/*`  | Correção urgente    | -          |

### Conventional Commits

| Prefixo     | Descrição           |
| ----------- | ------------------- |
| `feat:`     | Nova funcionalidade |
| `fix:`      | Correção de bug     |
| `docs:`     | Documentação        |
| `refactor:` | Refatoração         |
| `test:`     | Testes              |
| `chore:`    | Manutenção          |

```bash
git commit -m "feat(auth): implement OAuth login"
git commit -m "fix(api): resolve memory leak"
```

## 🐛 Debug

### Backend (VS Code)

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Backend",
      "port": 9229,
      "restart": true
    }
  ]
}
```

```bash
cd apps/nexo-be && pnpm start:debug
```

### Frontend (VS Code)

```json
{
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000"
    }
  ]
}
```

## 🔧 Extensões VS Code Recomendadas

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker"
  ]
}
```

---

📖 **Próximos passos:**

- [API](api.md) - Documentação da API
- [Deploy](deploy.md) - CI/CD e produção
- [Kubernetes](kubernetes.md) - Deploy em K8s
