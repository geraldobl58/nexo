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
make setup

# Verificar status de tudo
make status

# Destruir ambiente completamente
make destroy
```

That's it! Apenas 3 comandos para gerenciar todo o CloudLab! 🚀

### Ferramentas Instaladas

| Ferramenta   | URL                            | Usuário | Senha           |
| ------------ | ------------------------------ | ------- | --------------- |
| ArgoCD       | http://argocd.nexo.local       | admin   | \*(veja status) |
| Grafana      | http://grafana.nexo.local      | admin   | nexo@local2026  |
| Prometheus   | http://prometheus.nexo.local   | -       | -               |
| AlertManager | http://alertmanager.nexo.local | -       | -               |

### Ambientes Locais (4 ambientes completos)

Todos os ambientes mapeados em `/etc/hosts` automaticamente:

```
# Develop
http://develop-be.nexo.local
http://develop-fe.nexo.local
http://develop-auth.nexo.local

# QA
http://qa-be.nexo.local
http://qa-fe.nexo.local
http://qa-auth.nexo.local

# Staging
http://staging-be.nexo.local
http://staging-fe.nexo.local
http://staging-auth.nexo.local

# Production (sem prefixo)
http://be.nexo.local
http://fe.nexo.local
http://auth.nexo.local
```

### O que o setup cria?

- ✅ **Cluster k3d** com 7 nodes (1 server + 6 agents)
- ✅ **4 namespaces** (nexo-develop, nexo-qa, nexo-staging, nexo-prod)
- ✅ **ArgoCD** para GitOps automático
- ✅ **Prometheus + Grafana + AlertManager** para observabilidade
- ✅ **12 aplicações** (3 serviços × 4 ambientes) gerenciadas pelo ArgoCD
- ✅ **16 domínios** configurados automaticamente no /etc/hosts
- ✅ **Dashboards do Grafana** com métricas de Kubernetes, pods, nodes e NGINX Ingress

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

### CloudLab - Gerenciamento Completo

```bash
# Setup completo (cluster + ArgoCD + observabilidade + apps)
make setup

# Verificar status de todos os componentes
make status

# Destruir ambiente completamente
make destroy

# Ou executar diretamente:
bash local/setup.sh       # Setup completo
bash local/status.sh      # Ver status detalhado
bash local/destroy.sh     # Destruir tudo
```

### Kubernetes - Operações Diárias

```bash
# Ver todos os pods
kubectl get pods --all-namespaces

# Ver pods de um ambiente específico
kubectl get pods -n nexo-develop
kubectl get pods -n nexo-qa
kubectl get pods -n nexo-staging
kubectl get pods -n nexo-prod

# Logs de um pod
kubectl logs -f <pod-name> -n <namespace>

# Explorar interativamente (requer k9s)
k9s
```

### ArgoCD - Gerenciamento de Apps

```bash
# Listar aplicações
kubectl get applications -n argocd

# Ver detalhes de uma app
kubectl describe application nexo-be-develop -n argocd

# Forçar sincronização manual (se necessário)
kubectl patch application nexo-be-develop -n argocd \
  --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{}}}'
```

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
├── local/               # 🏗️ CloudLab Local (tudo aqui!)
│   ├── argocd/          # ArgoCD projects + applicationsets
│   ├── helm/            # Helm charts (nexo-be, nexo-fe, nexo-auth)
│   ├── k8s/             # Manifests Kubernetes extras
│   ├── config/          # Configurações do cluster k3d
│   ├── scripts/         # Scripts auxiliares
│   ├── docs/            # Documentação detalhada do CloudLab
│   ├── setup.sh         # ⭐ Setup completo (1 comando!)
│   ├── status.sh        # ⭐ Verificar status
│   └── destroy.sh       # ⭐ Destruir tudo
├── documentation/       # 📚 Documentação geral do projeto
├── Makefile             # Comandos: setup, status, destroy
└── .github/
    └── workflows/       # CI/CD pipelines
```

---

## 🧪 Ambientes

Todos os ambientes rodam no **mesmo cluster K3D**, separados por **namespaces**:

| Namespace      | Branch    | URL                   | Deploy       | Auto-Sync |
| -------------- | --------- | --------------------- | ------------ | --------- |
| `nexo-develop` | `develop` | develop-\*.nexo.local | Automático   | Sim       |
| `nexo-qa`      | `qa`      | qa-\*.nexo.local      | Automático   | Sim       |
| `nexo-staging` | `staging` | staging-\*.nexo.local | Automático   | Sim       |
| `nexo-prod`    | `main`    | \*.nexo.local         | Automático\* | Sim       |

**Observação**: Todos os ambientes têm auto-sync habilitado no ArgoCD. Quando você faz push para a branch correspondente, o ArgoCD detecta a mudança e atualiza automaticamente o ambiente.

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
