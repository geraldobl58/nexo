# 📚 Nexo Platform — Documentação

> Portal imobiliário fullstack com arquitetura de microsserviços, CI/CD automatizado e deploy em DigitalOcean Kubernetes.

---

## Visão Geral

O **Nexo** é uma plataforma de portal imobiliário construída como monorepo com 3 aplicações:

| Serviço       | Tecnologia              | Descrição                       |
| ------------- | ----------------------- | ------------------------------- |
| **nexo-be**   | NestJS 11 + Prisma 7    | API REST com Clean Architecture |
| **nexo-fe**   | Next.js 14 (standalone) | Frontend SSR com Keycloak auth  |
| **nexo-auth** | Keycloak 26             | Identity & Access Management    |

**Infraestrutura:** DigitalOcean Kubernetes (DOKS) · GitHub Actions CI/CD · ArgoCD GitOps · GHCR · NGINX Ingress · Let's Encrypt TLS

**Ambientes:** develop → prod (2 namespaces isolados, lab com recursos mínimos)

---

## Índice

| #   | Documento                                                | Descrição                                                               |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| 01  | [Arquitetura](01-architecture.md)                        | Stack, Clean Architecture, fluxo de autenticação, estrutura do monorepo |
| 02  | [Pré-requisitos](02-prerequisites.md)                    | Ferramentas, contas e acessos necessários                               |
| 03  | [Desenvolvimento Local](03-local-development.md)         | Docker Compose, pnpm, variáveis de ambiente, hot-reload                 |
| 04  | [Configuração do GitHub](04-github-setup.md)             | Repository settings, secrets, branch protection, GHCR                   |
| 05  | [Configuração da DigitalOcean](05-digitalocean-setup.md) | DOKS cluster, Managed Database, DNS, firewall                           |
| 06  | [CI/CD Pipeline](06-cicd-pipeline.md)                    | GitHub Actions: 10 stages, build multi-arch, deploy automático          |
| 07  | [Helm Charts](07-helm-charts.md)                         | Estrutura dos charts, values por ambiente, templates                    |
| 08  | [ArgoCD & GitOps](08-argocd-gitops.md)                   | ApplicationSet, Projects, sync policies, fluxo GitOps                   |
| 09  | [Ambientes](09-environments.md)                          | 4 ambientes, domínios, branches, promoção de código                     |
| 10  | [Observabilidade](10-observability.md)                   | Health checks e logs (Prometheus/Grafana removidos definitivamente)     |
| 11  | [Operações](11-operations.md)                            | Comandos do dia-a-dia, scripts, rollback, scaling                       |
| 12  | [Troubleshooting](12-troubleshooting.md)                 | Problemas comuns, diagnóstico e soluções                                |

---

## Quick Reference

### Desenvolvimento Local

```bash
# Subir infraestrutura local (Postgres + Keycloak)
docker compose up -d

# Instalar dependências
pnpm install

# Rodar backend (porta 3333)
pnpm --filter nexo-be dev

# Rodar frontend (porta 3000)
pnpm --filter nexo-fe dev

# Prisma migrations
pnpm --filter nexo-be prisma:migrate
```

### Deploy DigitalOcean (primeira vez)

```bash
# 1. Provisionar cluster DOKS
./infra/scripts/setup-doks.sh

# 2. Criar secrets (DB, GHCR, Keycloak admin)
./infra/scripts/create-secrets.sh

# 3. Configurar DNS (A records → LoadBalancer IP)

# 4. Push para branch develop → pipeline roda automaticamente
git push origin develop
```

### URLs de Produção

| Serviço  | URL                                   |
| -------- | ------------------------------------- |
| Frontend | `https://app.g3developer.online`      |
| API      | `https://api.g3developer.online`      |
| Keycloak | `https://auth.g3developer.online`     |
| API Docs | `https://api.g3developer.online/docs` |

---

## Arquitetura Resumida

```
┌─────────────────────────────────────────────────────────────────┐
│                     DigitalOcean Cloud                          │
│                                                                 │
│  ┌──────────────┐   ┌──────────────────────────────────────┐   │
│  │ DO Managed   │   │     DOKS Cluster (K8s 1.31)          │   │
│  │ PostgreSQL   │   │                                      │   │
│  │              │   │  ┌─────────┐ ┌─────────┐ ┌────────┐ │   │
│  │ nexo_app  ◄──┼───┼──┤ nexo-be │ │ nexo-fe │ │  nexo  │ │   │
│  │ nexo_kc   ◄──┼───┼──┤ NestJS  │ │ Next.js │ │  auth  │ │   │
│  │              │   │  └─────────┘ └─────────┘ └────────┘ │   │
│  └──────────────┘   │       ▲            ▲          ▲      │   │
│                     │       │            │          │      │   │
│                     │  ┌────┴────────────┴──────────┴───┐  │   │
│                     │  │     NGINX Ingress Controller    │  │   │
│                     │  └────────────────┬────────────────┘  │   │
│                     └──────────────────────────────────────┘   │
│                                        │                       │
│                          ┌─────────────┴──────────┐            │
│                          │  DO Load Balancer       │            │
│                          │  (IP público)           │            │
│                          └─────────────┬──────────┘            │
└────────────────────────────────────────┼───────────────────────┘
                                         │
                              ┌──────────┴──────────┐
                              │ DNS (*.g3developer.online) │
                              └─────────────────────┘
```

---

## Repositório

```
nexo/
├── apps/
│   ├── nexo-be/          # Backend NestJS (Clean Architecture)
│   ├── nexo-fe/          # Frontend Next.js (standalone)
│   └── nexo-auth/        # Keycloak themes customizados
├── packages/             # Pacotes compartilhados (auth, config, ui)
├── infra/                # Infraestrutura DigitalOcean
│   ├── helm/             # Helm charts (nexo-be, nexo-fe, nexo-auth)
│   ├── argocd/           # ApplicationSet + Projects
│   ├── k8s/base/         # Namespaces + ClusterIssuers
│   ├── scripts/          # Setup DOKS + Create Secrets
│   └── docker/           # Init scripts para Docker Compose
├── documentation/        # Esta documentação
├── .github/workflows/    # CI/CD Pipeline (GitHub Actions)
├── docker-compose.yml    # Dev local (Postgres + Keycloak)
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml   # Monorepo workspace
```
