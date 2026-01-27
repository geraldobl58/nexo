# 🏗️ Nexo Platform

<div align="center">

**Plataforma SaaS de Produção | Baixo Custo | DigitalOcean Kubernetes**

[![CI](https://github.com/geraldobl58/nexo/actions/workflows/ci-main.yml/badge.svg)](https://github.com/geraldobl58/nexo/actions/workflows/ci-main.yml)
[![CD](https://github.com/geraldobl58/nexo/actions/workflows/cd-main.yml/badge.svg)](https://github.com/geraldobl58/nexo/actions/workflows/cd-main.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9+-orange.svg)](https://pnpm.io/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-1.29+-326CE5.svg)](https://kubernetes.io/)

[Início Rápido](#-início-rápido) •
[Documentação](#-documentação) •
[Arquitetura](#-arquitetura) •
[Ambientes](#-ambientes) •
[Deploy](#-deploy)

</div>

---

## 🎯 Sobre o Projeto

A **Plataforma Nexo** é uma solução SaaS profissional para o mercado imobiliário, otimizada para **baixo custo operacional** em produção usando **DigitalOcean Kubernetes (DOKS)**.

### Stack Fixa

| Componente      | Tecnologia                   | Versão |
| --------------- | ---------------------------- | ------ |
| Backend         | NestJS                       | 10.x   |
| Frontend        | Next.js                      | 14.x   |
| Auth            | Keycloak                     | 26.x   |
| Database        | PostgreSQL                   | 16     |
| Cache           | Redis                        | 7      |
| Orquestração    | Kubernetes (DOKS)            | 1.29+  |
| GitOps          | ArgoCD                       | 2.x    |
| CI/CD           | GitHub Actions               | -      |
| Ingress         | NGINX Ingress Controller     | -      |
| TLS             | Cert-Manager + Let's Encrypt | -      |
| Observabilidade | Prometheus + Grafana         | -      |

### Características

- ✅ **Monorepo** com Turborepo + pnpm workspaces
- ✅ **4 Ambientes** isolados por namespace (develop, qa, staging, production)
- ✅ **GitOps** com ArgoCD (deploy automático por branch)
- ✅ **Observabilidade** leve (Prometheus, Grafana, Alertmanager)
- ✅ **Autenticação** enterprise com Keycloak
- ✅ **CI/CD** automatizado com GitHub Actions
- ✅ **Custo otimizado** (1 cluster, 1 node pool, PostgreSQL em container)

---

## 🌿 Fluxo de Branches (GitFlow)

```
feature/* → develop → qa → staging → production
     │          │       │       │          │
     │          │       │       │          └─► Deploy Produção (manual + aprovação)
     │          │       │       └─► Deploy Staging (automático)
     │          │       └─► Deploy QA (automático)
     │          └─► Deploy Develop (automático)
     └─► Desenvolvimento local
```

| Branch      | Ambiente   | Deploy     | Aprovação |
| ----------- | ---------- | ---------- | --------- |
| `feature/*` | local      | -          | -         |
| `develop`   | develop    | Automático | Não       |
| `qa`        | qa         | Automático | Não       |
| `staging`   | staging    | Automático | Não       |
| `main`      | production | Manual     | Sim       |

> 📖 Veja [Git Branching Strategy](documentation/git-branching-strategy.md) para detalhes completos.

---

## 🚀 Início Rápido

### Pré-requisitos

```bash
# Verificar se tudo está instalado
make doctor
```

Você precisa de:

- Node.js 20+
- pnpm 9+
- Docker Desktop

### Instalação (1 comando!)

```bash
# Setup completo: dependências + infraestrutura + migrations
make setup
```

### Iniciar Desenvolvimento

```bash
# 1. Infraestrutura (PostgreSQL + Keycloak)
make start

# 2. Desenvolvimento com hot-reload automático (Tilt)
make up

# Dashboard: http://localhost:10350
```

> 💡 O Tilt monitora alterações e faz rebuild/deploy automaticamente!

### Acessos

| Serviço     | URL                       | Credenciais   |
| ----------- | ------------------------- | ------------- |
| 🖥️ Frontend | http://localhost:3002     | -             |
| ⚙️ Backend  | http://localhost:3333     | -             |
| 📚 Swagger  | http://localhost:3001/api | -             |
| 🔐 Keycloak | http://localhost:8081     | admin / admin |
| 📊 Tilt     | http://localhost:10350    | -             |
| 📈 Grafana  | http://localhost:30001    | admin / admin |
| 🔀 ArgoCD   | https://localhost:30443   | admin / (\*)  |

> (\*) Execute `make argocd-password` para obter a senha do ArgoCD.

---

## 📖 Documentação

### Guias de Configuração

| Documento                                                 | Descrição                                |
| --------------------------------------------------------- | ---------------------------------------- |
| [Quick Start](documentation/quick-start.md)               | Setup em 5 minutos                       |
| [DigitalOcean Setup](documentation/digitalocean-setup.md) | Configurar DOKS, Registry, Load Balancer |
| [GitHub Actions](documentation/github-actions.md)         | CI/CD pipelines e estratégia de branches |
| [GitHub Secrets](documentation/github-secrets.md)         | Todos os secrets necessários             |
| [Environments](documentation/environments.md)             | Diferenças entre ambientes               |

### Guias Técnicos

| Documento                                               | Descrição                     |
| ------------------------------------------------------- | ----------------------------- |
| [Arquitetura](documentation/architecture.md)            | Visão técnica do sistema      |
| [Kubernetes](documentation/kubernetes.md)               | Namespaces, Ingress, TLS, PVC |
| [Deploy](documentation/deploy.md)                       | CI/CD e deploy em produção    |
| [Observabilidade](documentation/observability-guide.md) | Prometheus, Grafana, Alertas  |
| [Troubleshooting](documentation/troubleshooting.md)     | Erros comuns e soluções       |

### Guias de Desenvolvimento

| Documento                                                 | Descrição                      |
| --------------------------------------------------------- | ------------------------------ |
| [Desenvolvimento](documentation/development.md)           | Fluxo de trabalho diário       |
| [Git & Branches](documentation/git-branching-strategy.md) | GitFlow e proteção de branches |
| [API](documentation/api.md)                               | Documentação da API            |

---

## 🛠️ Comandos

### Comandos Principais

```bash
make setup           # 🚀 Setup completo (primeira vez)
make start           # ▶️  Inicia PostgreSQL + Keycloak
make up              # 🔄 Desenvolvimento com Tilt (hot-reload)
make down            # ⏹️  Para Tilt
make stop            # ⏹️  Para containers Docker
```

### Desenvolvimento

```bash
make up              # Tilt (recomendado - auto rebuild)
make dev-be          # Backend sem Tilt
make dev-fe          # Frontend sem Tilt
make test            # Executar testes
make lint            # Verificar código
```

### Database

```bash
make db              # Menu de comandos DB
make db-migrate      # Executar migrations
make db-studio       # Abrir Prisma Studio
make db-reset        # Reset do banco
```

### Kubernetes

```bash
make k8s-setup       # Criar cluster Kind
make k8s-deploy      # Deploy no cluster
make deploy-fe       # Deploy frontend (sem Tilt)
make deploy-be       # Deploy backend (sem Tilt)
```

### Observabilidade e GitOps

```bash
make pf-grafana         # Grafana → localhost:30001
make pf-argocd          # ArgoCD → localhost:30443
make argocd-password    # Senha do ArgoCD
```

> 📋 Ver todos os comandos: `make help`

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXO PLATFORM                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │  Next.js    │     │  NestJS     │     │  Keycloak   │                  │
│   │  Frontend   │────▶│  Backend    │────▶│  Auth       │                  │
│   │  :3003      │     │  :3000      │     │  :8080      │                  │
│   └─────────────┘     └──────┬──────┘     └─────────────┘                  │
│                              │                                              │
│                    ┌─────────┴─────────┐                                   │
│                    │                   │                                   │
│              ┌─────▼─────┐       ┌─────▼─────┐                             │
│              │ PostgreSQL│       │   Redis   │                             │
│              │   :5432   │       │   :6379   │                             │
│              └───────────┘       └───────────┘                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  OBSERVABILIDADE                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Prometheus  │  │  Grafana    │  │    Loki     │  │  Promtail   │        │
│  │   :9090     │  │   :3001     │  │   :3100     │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Estrutura do Projeto

```
nexo/
├── apps/                    # 🖥️ Aplicações
│   ├── nexo-be/            # Backend NestJS
│   ├── nexo-fe/            # Frontend Next.js
│   └── nexo-auth/          # Keycloak Themes
│
├── packages/                # 📦 Libs compartilhadas
│   ├── auth/               # Autenticação
│   ├── config/             # Configurações
│   └── ui/                 # Design System
│
├── infra/                   # 🏗️ Infraestrutura
│   ├── docker/             # Docker Compose (4 ambientes)
│   ├── k8s/                # Kubernetes manifests
│   ├── helm/               # Helm Charts
│   └── argocd/             # GitOps configs
│
├── documentation/           # 📚 Documentação
├── scripts/                 # 📜 Scripts auxiliares
└── .github/workflows/       # 🤖 CI/CD
```

---

## 🔄 Fluxo de Desenvolvimento

```
 1. Desenvolve      2. Commit/Push      3. CI/CD           4. Deploy
 ─────────────      ──────────────      ─────              ──────
      │                   │                │                  │
      ▼                   ▼                ▼                  ▼
 ┌─────────┐        ┌─────────┐      ┌─────────┐       ┌─────────┐
 │ VS Code │───────▶│ GitHub  │─────▶│ Actions │──────▶│ ArgoCD  │
 │         │        │         │      │  Build  │       │  Sync   │
 │  make   │        │  Push   │      │  Test   │       │    ↓    │
 │  dev-be │        │         │      │  Image  │       │   K8s   │
 └─────────┘        └─────────┘      └─────────┘       └─────────┘
```

---

## 📊 Stack Tecnológica

### Aplicações

| Componente | Tecnologia | Versão |
| ---------- | ---------- | ------ |
| Backend    | NestJS     | 10.x   |
| Frontend   | Next.js    | 14.x   |
| Auth       | Keycloak   | 26.x   |
| Database   | PostgreSQL | 16     |
| Cache      | Redis      | 7      |

### Infraestrutura (DigitalOcean)

| Componente   | Tecnologia                | Descrição               |
| ------------ | ------------------------- | ----------------------- |
| Cluster      | DOKS                      | 1 cluster, 1 node pool  |
| Container    | Docker                    | Multi-stage builds      |
| Orquestração | Kubernetes 1.29+          | Namespaces por ambiente |
| GitOps       | ArgoCD                    | Deploy automático       |
| CI/CD        | GitHub Actions            | Pipelines reutilizáveis |
| IaC          | Helm                      | Charts por aplicação    |
| Ingress      | NGINX Ingress Controller  | Load Balancer           |
| TLS          | Cert-Manager              | Let's Encrypt           |
| Registry     | GitHub Container Registry | Imagens Docker          |

### Observabilidade (Leve)

| Componente | Tecnologia   | Resource Limits |
| ---------- | ------------ | --------------- |
| Métricas   | Prometheus   | 256Mi RAM       |
| Dashboards | Grafana      | 256Mi RAM       |
| Alertas    | Alertmanager | 128Mi RAM       |

---

## 🧪 Ambientes

Todos os ambientes rodam no **mesmo cluster DOKS**, separados por **namespaces**:

| Namespace         | Branch    | URL             | Deploy             | Resource Limits       |
| ----------------- | --------- | --------------- | ------------------ | --------------------- |
| `nexo-develop`    | `develop` | dev.nexo.io     | Automático         | CPU: 500m, RAM: 512Mi |
| `nexo-qa`         | `qa`      | qa.nexo.io      | Automático         | CPU: 500m, RAM: 512Mi |
| `nexo-staging`    | `staging` | staging.nexo.io | Automático         | CPU: 1, RAM: 1Gi      |
| `nexo-production` | `main`    | nexo.io         | Manual + Aprovação | CPU: 2, RAM: 2Gi      |

> 📖 Veja [Environments](documentation/environments.md) para detalhes completos de cada ambiente.

---

## 🚀 Deploy

### Fluxo GitOps

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Commit  │───►│    CI    │───►│   Push   │───►│  ArgoCD  │───►│   DOKS   │
│  (Git)   │    │  (Test)  │    │  (GHCR)  │    │  (Sync)  │    │  (K8s)   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Deploy por Branch

| Ação                      | Resultado                                          |
| ------------------------- | -------------------------------------------------- |
| `git push origin develop` | CI → Build → Deploy Develop                        |
| `git push origin qa`      | CI → Build → Deploy QA                             |
| `git push origin staging` | CI → Build → Deploy Staging                        |
| Merge PR para `main`      | CI → Build → Aguarda Aprovação → Deploy Production |

> 📖 Veja [Deploy](documentation/deploy.md) e [GitHub Actions](documentation/github-actions.md) para detalhes completos.

---

## 📈 Custo Otimizado

Este projeto foi desenhado para **baixo custo operacional**:

| Recurso            | Configuração           | Custo Estimado  |
| ------------------ | ---------------------- | --------------- |
| DOKS Cluster       | 1 node pool, 2-3 nodes | ~$48-72/mês     |
| Load Balancer      | NGINX Ingress (1 LB)   | ~$12/mês        |
| Block Storage      | PostgreSQL PVC (20GB)  | ~$2/mês         |
| Container Registry | Basic Plan             | ~$5/mês         |
| **Total Estimado** |                        | **~$67-91/mês** |

### Estratégias de Economia

- ✅ **1 cluster** para todos os ambientes (separados por namespace)
- ✅ **PostgreSQL em container** com PVC (não managed database)
- ✅ **Resource limits agressivos** para cada pod
- ✅ **Observabilidade mínima** (Prometheus + Grafana + Alertmanager)
- ✅ **Auto-scaling** configurado para escalar sob demanda

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature` a partir de `develop`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request para `develop`

> ⚠️ PRs diretos para `main` não são permitidos. Use o fluxo: `feature/* → develop → qa → staging → main`

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**🏗️ Nexo Platform** - Enterprise-grade Architecture

_Desenvolvido com ❤️ para alta performance e escalabilidade_

[⬆ Voltar ao topo](#-nexo-platform)

</div>
