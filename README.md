# 🏗️ Nexo Platform

<div align="center">

**Plataforma SaaS de Produção | GitOps | K3D Kubernetes**

[![CI](https://github.com/geraldobl58/nexo/actions/workflows/ci-main.yml/badge.svg)](https://github.com/geraldobl58/nexo/actions/workflows/ci-main.yml)
[![CD](https://github.com/geraldobl58/nexo/actions/workflows/cd-main.yml/badge.svg)](https://github.com/geraldobl58/nexo/actions/workflows/cd-main.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Início Rápido](#-início-rápido) •
[Documentação](#-documentação) •
[Arquitetura](#-arquitetura) •
[Ambientes](#-ambientes) •
[Deploy](#-deploy-gitops)

</div>

---

## 🎯 Sobre o Projeto

A **Plataforma Nexo** é uma solução SaaS profissional para o mercado imobiliário, usando **K3D** como ambiente Kubernetes local que espelha produção com **GitOps automatizado**.

### Stack Tecnológica

| Componente      | Tecnologia             | Versão |
| --------------- | ---------------------- | ------ |
| Backend         | NestJS                 | 11.x   |
| Frontend        | Next.js                | 14.x   |
| Auth            | Keycloak               | 26.x   |
| Database        | PostgreSQL             | 16     |
| Cache           | Redis                  | 7      |
| ORM             | Prisma                 | 7.x    |
| Orquestração    | K3D (Kubernetes local) | 1.29+  |
| GitOps          | ArgoCD                 | 3.x    |
| CI/CD           | GitHub Actions         | -      |
| Ingress         | NGINX                  | -      |
| Observabilidade | Health Checks + Logs   | -      |

### Características

- ✅ **Monorepo** com Turborepo + pnpm workspaces
- ✅ **4 Ambientes** isolados por namespace (develop, qa, staging, prod)
- ✅ **GitOps** com ArgoCD (deploy automático por branch)
- ✅ **CloudLab Local** completa com k3d + ArgoCD + Observabilidade
- ✅ **Observabilidade** com Prometheus + Grafana + AlertManager
- ✅ **Logging** centralizado com ELK Stack (Elasticsearch + Kibana)
- ✅ **Harbor Registry** para gerenciamento de imagens Docker
- ✅ **Autenticação** enterprise com Keycloak + temas customizados
- ✅ **CI/CD** automatizado com GitHub Actions + Self-hosted Runner

---

## 🏠 CloudLab Local

A plataforma Nexo inclui uma infraestrutura completa de CloudLab local para desenvolvimento e testes, espelhando o ambiente de produção.

### Quick Start - CloudLab

```bash
# Instalação completa com um comando
cd local
make setup

# Ou passo a passo
./scripts/00-install-deps.sh      # Instalar k3d, kubectl, helm, k9s
./scripts/01-create-cluster.sh    # Criar cluster k3s com 3 nodes
./scripts/02-install-argocd.sh    # Instalar ArgoCD
./scripts/03-install-observability.sh  # Prometheus + Grafana
./scripts/04-install-elasticsearch.sh  # ELK Stack
./scripts/06-install-harbor.sh    # Harbor Registry
./scripts/05-deploy-apps.sh       # Deploy aplicações via ArgoCD

# Ver todas as URLs de acesso
make urls
```

### Ferramentas Instaladas

| Ferramenta   | URL                            | Usuário | Senha         |
| ------------ | ------------------------------ | ------- | ------------- |
| ArgoCD       | http://argocd.nexo.local       | admin   | Ver CLI       |
| Grafana      | http://grafana.nexo.local      | admin   | prom-operator |
| Prometheus   | http://prometheus.nexo.local   | -       | -             |
| AlertManager | http://alertmanager.nexo.local | -       | -             |
| Kibana       | http://kibana.nexo.local       | -       | -             |
| Harbor       | http://harbor.nexo.local       | admin   | Harbor12345   |
| Traefik      | http://traefik.nexo.local      | -       | -             |

### Ambientes Locais

Todos os ambientes mapeados em `/etc/hosts` automaticamente:

```
# Develop
http://develop.nexo.local
http://develop.api.nexo.local
http://develop.auth.nexo.local

# QA
http://qa.nexo.local
http://qa.api.nexo.local
http://qa.auth.nexo.local

# Staging
http://staging.nexo.local
http://staging.api.nexo.local
http://staging.auth.nexo.local

# Production (local)
http://prod.nexo.local
http://prod.api.nexo.local
http://prod.auth.nexo.local
```

### Documentação CloudLab

Documentação completa em: [`local/docs/`](./local/docs/README.md)

1. **[Instalação](./local/docs/01-installation.md)** - Setup e troubleshooting
2. **[Kubernetes](./local/docs/02-kubernetes.md)** - Cluster management
3. **[ArgoCD](./local/docs/03-argocd.md)** - GitOps workflows
4. **[Observabilidade](./local/docs/04-observability.md)** - Prometheus + Grafana
5. **[Logging](./local/docs/05-logging.md)** - Elasticsearch + Kibana
6. **[Aplicações](./local/docs/06-applications.md)** - Deploy e gestão
7. **[Troubleshooting](./local/docs/07-troubleshooting.md)** - Problemas comuns
8. **[Cheat Sheet](./local/docs/08-cheatsheet.md)** - Comandos úteis
9. **[GitHub Integration](./local/docs/09-github-integration.md)** - CI/CD setup
10. **[Arquitetura](./local/docs/10-architecture.md)** - Diagramas da infraestrutura
11. **[Ambientes e Domínios](./local/docs/11-environments-and-domains.md)** - HTTP local vs HTTPS produção

### Guias Essenciais

- **[BRANCHES.md](./BRANCHES.md)** - Estratégia de branches (develop, qa, staging, main)
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Próximas ações: aumentar cluster, criar branches
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Guia de início rápido completo

---

## 🚀 Início Rápido

### Pré-requisitos

```bash
# macOS - Instalar via Homebrew
brew install k3d kubectl helm

# Verificar instalação
k3d version      # v5.x
kubectl version  # v1.29+
helm version     # v3.x
docker --version # 24.x+
```

### Setup K3D (1 comando!)

```bash
cd local
./scripts/setup.sh
```

**Pronto!** Em ~5 minutos você terá:

- ✅ Cluster K3D com 3 nodes
- ✅ ArgoCD rodando
- ✅ 2 ambientes: develop, prod
- ✅ 6 aplicações deployadas via ArgoCD

### Acessos

Adicione ao `/etc/hosts`:

```
127.0.0.1 develop.nexo.local develop.api.nexo.local develop.auth.nexo.local
127.0.0.1 prod.nexo.local prod.api.nexo.local prod.auth.nexo.local
```

| Serviço     | URL                            | Credenciais |
| ----------- | ------------------------------ | ----------- |
| 🖥️ Frontend | http://develop.nexo.local      | -           |
| ⚙️ Backend  | http://develop.api.nexo.local  | -           |
| 🔐 Keycloak | http://develop.auth.nexo.local | admin/admin |
| � ArgoCD    | http://localhost:30080         | admin/(\*)  |

> (\*) Execute `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`

---

## 🌿 Fluxo de Branches (GitFlow)

```
feature/* → develop → main (production)
     │          │          │
     │          │          └─► Deploy Produção (manual + aprovação)
     │          └─► Deploy Develop (automático)
     └─► Desenvolvimento local
```

| Branch      | Ambiente   | Deploy     | Aprovação |
| ----------- | ---------- | ---------- | --------- |
| `feature/*` | local      | -          | -         |
| `develop`   | develop    | Automático | Não       |
| `main`      | production | Manual     | Sim       |

> 📖 Veja [CI/CD & GitOps](documentation/cicd-gitops.md) para detalhes completos.

---

## 📖 Documentação

Toda a documentação está consolidada em [`/documentation`](documentation/README.md):

| Documento                                           | Descrição                                       |
| --------------------------------------------------- | ----------------------------------------------- |
| [Architecture](documentation/architecture.md)       | Stack, topologia, namespaces, GitOps pipeline   |
| [Getting Started](documentation/getting-started.md) | Pré-requisitos, setup, /etc/hosts, URLs         |
| [Operations](documentation/operations.md)           | Comandos Makefile, build, deploy, logs          |
| [CI/CD & GitOps](documentation/cicd-gitops.md)      | GitHub Actions, ArgoCD, Helm charts             |
| [Troubleshooting](documentation/troubleshooting.md) | Recovery pós-restart, erros comuns, diagnóstico |

**🎯 Por onde começar:**

1. **Setup Prático**: [Getting Started](documentation/getting-started.md)
2. **Arquitetura**: [Architecture](documentation/architecture.md)
3. **Operação Diária**: [Operations](documentation/operations.md)

---

## 🛠️ Comandos

### K3D / Kubernetes

```bash
cd local
./scripts/setup.sh      # 🚀 Setup completo K3D
./scripts/destroy.sh    # 🗑️  Destruir cluster
./scripts/status.sh     # 📊 Status do cluster
make pods               # 📋 Listar pods
make logs-be            # 📜 Logs backend
make logs-fe            # 📜 Logs frontend
make logs-auth          # 📜 Logs Keycloak
```

### Recuperação ArgoCD (Apps Travados/Degraded)

```bash
# Via Makefile (recomendado)
make apps-status-dev    # 📊 Status de todas as apps (develop)
make heal               # 🩹 Auto-heal todos os ambientes
make heal-dev           # 🩹 Auto-heal apenas develop
make reset-unknown-dev  # 🔄 Reseta apps com status Unknown
make quick-fix-dev      # 🔧 Fix rápido (restart pods)
make fix-be-dev         # 🔧 Fix completo do backend

# Via script direto
cd local
./scripts/argocd-recovery.sh status develop         # Status detalhado
./scripts/argocd-recovery.sh reset-unknown develop  # Reset Unknown
./scripts/argocd-recovery.sh quick-fix develop      # Fix rápido
./scripts/argocd-recovery.sh fix nexo-be develop    # Fix completo
./scripts/argocd-recovery.sh cheatsheet             # Referência rápida

# Para outros ambientes, substitua 'develop' por: prod
```

> 📖 Veja [Troubleshooting](documentation/troubleshooting.md) para guia completo.

### Desenvolvimento

```bash
pnpm install            # Instalar dependências
pnpm dev                # Dev local (sem K3D)
pnpm build              # Build de produção
pnpm test               # Executar testes
pnpm lint               # Linting
```

---

## 📁 Estrutura do Projeto

```
nexo/
├── apps/
│   ├── nexo-be/         # Backend NestJS
│   ├── nexo-fe/         # Frontend Next.js
│   └── nexo-auth/       # Keycloak themes
├── packages/
│   ├── auth/            # Auth utils
│   ├── config/          # Config compartilhada
│   └── ui/              # UI components
├── local/               # 🏗️ Infraestrutura K3D
│   ├── argocd/          # ArgoCD apps/projects
│   ├── helm/            # Helm charts
│   ├── k3d/             # Config do cluster
│   ├── k8s/             # Manifests Kubernetes
│   ├── observability/   # (removido para lab)
│   └── scripts/         # Setup scripts
├── documentation/       # 📚 Toda documentação
└── .github/
    └── workflows/       # CI/CD pipelines
```

---

## 🧪 Ambientes

Todos os ambientes rodam no **mesmo cluster K3D**, separados por **namespaces**:

| Namespace      | Branch    | URL                | Deploy             |
| -------------- | --------- | ------------------ | ------------------ |
| `nexo-develop` | `develop` | develop.nexo.local | Automático         |
| `nexo-prod`    | `main`    | prod.nexo.local    | Manual + Aprovação |

---

## 🚀 Deploy GitOps

### Fluxo Automático

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Commit  │───►│    CI    │───►│   Push   │───►│  ArgoCD  │───►│   K3D    │
│  (Git)   │    │  (Test)  │    │  (GHCR)  │   │  (Sync)  │    │  (K8s)   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Deploy por Branch

| Ação                      | Resultado                                          |
| ------------------------- | -------------------------------------------------- |
| `git push origin develop` | CI → Build → GHCR → ArgoCD → Deploy Develop        |
| Merge PR para `main`      | CI → Build → Aguarda Aprovação → Deploy Production |

> O ArgoCD detecta automaticamente mudanças no Git e sincroniza o cluster.

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature` a partir de `develop`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request para `develop`

> ⚠️ PRs diretos para `main` não são permitidos. Use o fluxo: `feature/* → develop → main`

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

<div align="center">

**🏗️ Nexo Platform** - Enterprise-grade Architecture

_Desenvolvido com ❤️ para alta performance e escalabilidade_

[⬆ Voltar ao topo](#-nexo-platform)

</div>
