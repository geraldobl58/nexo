# 📚 Nexo Platform - Documentação

Documentação técnica completa do projeto Nexo Platform.

## 📖 Índice

### Guias de Configuração

| Documento                                   | Descrição                                |
| ------------------------------------------- | ---------------------------------------- |
| [Quick Start](quick-start.md)               | Setup em 5 minutos                       |
| [DigitalOcean Setup](digitalocean-setup.md) | Configurar DOKS e Load Balancer          |
| [GitHub Actions](github-actions.md)         | CI/CD pipelines e estratégia de branches |
| [GitHub Secrets](github-secrets.md)         | Todos os secrets necessários             |
| [Environments](environments.md)             | Diferenças entre ambientes               |

### Guias Técnicos

| Documento                                 | Descrição                     |
| ----------------------------------------- | ----------------------------- |
| [Arquitetura](architecture.md)            | Visão técnica do sistema      |
| [Kubernetes](kubernetes.md)               | Namespaces, Ingress, TLS, PVC |
| [Deploy](deploy.md)                       | CI/CD e deploy em produção    |
| [Observabilidade](observability-guide.md) | Prometheus, Grafana, Alertas  |
| [Troubleshooting](troubleshooting.md)     | Erros comuns e soluções       |

### Guias de Desenvolvimento

| Documento                                      | Descrição                      |
| ---------------------------------------------- | ------------------------------ |
| [Desenvolvimento](development.md)              | Fluxo de trabalho diário       |
| [Desenvolvimento Diário](daily-development.md) | Workflow e comandos úteis      |
| [Git & Branches](git-branching-strategy.md)    | GitFlow e proteção de branches |
| [API](api.md)                                  | Documentação da API            |

### 🏠 Ambiente Local K3D

| Documento                          | Descrição                          |
| ---------------------------------- | ---------------------------------- |
| [Setup Local K3D](local/README.md) | Kubernetes local idêntico produção |
| [CI/CD Flow](cicd-flow.md)         | Fluxo completo de CI/CD            |
| [GitHub Config](github-config.md)  | Secrets, Variables, Environments   |

## 🌿 Fluxo de Branches

```
feature/* → develop → qa → staging → main (production)
```

| Branch      | Ambiente        | Deploy     | Aprovação |
| ----------- | --------------- | ---------- | --------- |
| `feature/*` | local           | -          | -         |
| `develop`   | nexo-develop    | Automático | Não       |
| `qa`        | nexo-qa         | Automático | Não       |
| `staging`   | nexo-staging    | Automático | Não       |
| `main`      | nexo-production | Manual     | Sim       |

## Container Registry

O projeto utiliza **GitHub Container Registry (GHCR)** para armazenar imagens Docker:

- **Registry:** `ghcr.io/geraldobl58`
- **Autenticação:** Automática via `GITHUB_TOKEN` no GitHub Actions
- **Imagens:**
  - `ghcr.io/geraldobl58/nexo-be` - Backend NestJS
  - `ghcr.io/geraldobl58/nexo-fe` - Frontend Next.js
  - `ghcr.io/geraldobl58/nexo-auth` - Keycloak customizado

> **Vantagem:** Não requer token adicional, usa integração nativa com GitHub.

## 🚀 Quick Start

```bash
# 1. Clone o repositório
git clone https://github.com/geraldobl58/nexo.git
cd nexo

# 2. Setup inicial
make setup

# 3. Desenvolvimento local
make start   # PostgreSQL + Keycloak
make dev-be  # Backend (terminal 1)
make dev-fe  # Frontend (terminal 2)
```

## 📌 Links Úteis

### Desenvolvimento Local

| Serviço     | URL                       | Credenciais   | Descrição |
| ----------- | ------------------------- | ------------- | --------- |
| Frontend    | http://localhost:3000     | -             | Next.js   |
| Backend API | http://localhost:3333     | -             | NestJS    |
| Swagger     | http://localhost:3001/api | -             | API Docs  |
| Keycloak    | http://localhost:8080     | admin / admin | Auth      |

### Produção (DOKS)

Acessar via URLs configuradas no Ingress do cluster Kubernetes. Veja [deploy.md](deploy.md).

## 📂 Estrutura do Projeto

```
nexo/
├── apps/
│   ├── nexo-be/          # Backend NestJS
│   ├── nexo-fe/          # Frontend Next.js
│   ├── nexo-auth/        # Tema Keycloak
├── packages/
│   ├── ui/               # Componentes compartilhados
│   ├── config/           # Configurações
│   └── auth/             # Lib autenticação
├── infra/
│   ├── k8s/              # Manifests Kubernetes
│   └── helm/             # Charts Helm
│   └── argocd/           # ArgoCD
│   └── docker/           # Docker
│   └── observability/    # Observabilidade
├── scripts/              # Scripts de automação
├── documentation/        # 📚 Esta documentação
└── docker-compose.yml    # Ambiente local
```

## 🛠️ Comandos Principais

> ⚠️ Execute sempre da **raiz do projeto** (`cd nexo`)

```bash
# Setup
make setup              # Setup inicial (deps + Docker)
make doctor             # Verifica dependências instaladas

# Desenvolvimento Local
make start              # Inicia PostgreSQL + Keycloak (Docker)
make stop               # Para containers
make status             # Status dos containers
make logs               # Ver logs

# Aplicações (hot-reload)
make dev-be             # Backend NestJS (localhost:3333)
make dev-fe             # Frontend Next.js (localhost:3000)

# Build & Testes
make build              # Build todos os pacotes
make test               # Executa testes
make lint               # Verifica código

# Docker Build
make build-fe           # Build imagem Frontend (ghcr.io/geraldobl58/nexo-fe)
make build-be           # Build imagem Backend (ghcr.io/geraldobl58/nexo-be)
make build-auth         # Build imagem Keycloak (ghcr.io/geraldobl58/nexo-auth)
make build-all          # Build todas as imagens

# Database (Prisma)
make db-migrate         # Criar migration
make db-generate        # Gerar Prisma Client
make db-studio          # Abrir Prisma Studio
make db-reset           # Reset completo (⚠️ DESTRUTIVO)

# Utilidades
make clean              # Limpa node_modules e containers
```

## 🤝 Contribuindo

1. Crie uma branch a partir de `develop`
2. Faça suas alterações
3. Execute `make test && make lint`
4. Abra um PR para `develop`
