# 📋 Resumo: Workflows GitHub Actions

## ✅ Pipeline Único: pipeline.yml

**O único workflow necessário** é o [.github/workflows/pipeline.yml](.github/workflows/pipeline.yml)

### O que ele faz:

#### 1. **AI Code Review** (PRs apenas)

- 🤖 CodeRabbit review automático
- ⚠️ Danger.js para validações
- 📝 Comentários inline nos PRs

#### 2. **CI - Continuous Integration**

- 🔍 Detecção inteligente de mudanças por serviço
- 🧪 Tests + Lint (nexo-be, nexo-fe)
- 🏗️ Build validation

#### 3. **Build & Push Images**

- 🐳 Docker multi-arch (amd64 + arm64)
- 📦 Push para **ghcr.io** (GitHub Container Registry)
- 🏷️ Tags: `branch-sha` + `branch-latest`
- ♻️ Cache layers para builds rápidos

#### 4. **Deploy Automático**

- 📝 Atualiza `values-{env}.yaml` com nova image tag
- 🔄 Commit com `[skip ci]` para evitar loops
- 🎯 Deploy apenas nos serviços alterados
- 🌍 Ambientes:
  - `develop` → nexo-develop
  - `qa` → nexo-qa
  - `staging` → nexo-staging
  - `main` → nexo-prod

#### 5. **Notificações Discord**

- ✅ Status do deploy
- 📊 Resumo dos serviços (success/failure/skipped)
- 🔗 Link para a pipeline

### Triggers

```yaml
on:
  push:
    branches: [develop, qa, staging, main]
    paths: ["apps/**", "packages/**"]

  pull_request:
    branches: [develop, qa, staging, main]

  workflow_dispatch:
    inputs:
      force_all: # Forçar build de todos os serviços
```

### Secrets Necessários

```bash
# GitHub Settings → Secrets and variables → Actions

GHCR_TOKEN          # Token para push no ghcr.io
DISCORD_WEBHOOK     # Webhook do Discord para notificações
```

> ℹ️ `GITHUB_TOKEN` é fornecido automaticamente pelo GitHub

---

## 📦 Release Workflow: release.yml

**Workflow separado** para releases de produção com **tags semver**.

### Quando usar:

```bash
# Criar tag de release
git tag v1.0.0
git push origin v1.0.0
```

### O que ele faz:

1. **Cria GitHub Release** com release notes automáticas
2. **Build & Push** todas as imagens com tags:
   - `v1.0.0`
   - `v1.0`
   - `v1`
   - `latest`
3. **Atualiza values-prod.yaml** com a versão
4. **Notifica Discord** sobre o release

### Para que serve:

- ✅ Releases oficiais com versionamento semver
- ✅ Imagens tagged para rollback fácil
- ✅ Release notes automáticas do GitHub
- ✅ Deploy controlado em produção

---

## ❌ Workflows Removidos (Obsoletos)

### .ci.yml.old

**Por que foi removido:**

- ✅ Redundante - pipeline.yml já faz CI completo
- ✅ Não usa pnpm monorepo
- ✅ Não detecta mudanças por serviço
- ✅ Não faz deploy automático

### .deploy-local.yml.old

**Por que foi removido:**

- ✅ Usava Harbor (removido)
- ✅ Self-hosted runners desnecessários
- ✅ Pipeline.yml já faz deploy automático
- ✅ Não suporta multi-ambiente

---

## 🔄 Workflow Completo

### Desenvolvimento (branch develop)

```bash
git checkout develop
# Fazer mudanças em apps/nexo-be
git add .
git commit -m "feat: nova feature X"
git push origin develop
```

**O que acontece:**

1. ✅ Pipeline detecta mudança em `nexo-be`
2. ✅ Roda CI (lint + test + build)
3. ✅ Build Docker image → `ghcr.io/geraldobl58/nexo-be:develop-abc123`
4. ✅ Push para ghcr.io
5. ✅ Atualiza `infra/helm/nexo-be/values-develop.yaml`
6. ✅ ArgoCD detecta mudança e faz sync automático
7. ✅ Discord notifica sobre o deploy
8. ✅ App atualizada em http://develop.api.g3developer.online

### Pull Request

```bash
git checkout -b feature/nova-feature
# Fazer mudanças
git push origin feature/nova-feature
# Criar PR no GitHub
```

**O que acontece:**

1. ✅ CodeRabbit revisa código automaticamente
2. ✅ Danger.js valida PR
3. ✅ CI roda tests e build
4. ✅ Status checks no PR
5. ❌ **Não faz deploy** (apenas validação)

### QA (branch qa)

```bash
# Merge develop → qa (testes de qualidade)
git checkout qa
git merge develop
git push origin qa
```

**O que acontece:**

1. ✅ Pipeline detecta push em qa
2. ✅ CI + Build + Push
3. ✅ Build Docker image → `ghcr.io/geraldobl58/nexo-be:qa-abc123`
4. ✅ Atualiza `infra/helm/nexo-be/values-qa.yaml`
5. ✅ ArgoCD detecta e faz sync
6. ✅ Deploy em https://qa.api.g3developer.online
7. ✅ Discord notifica sobre o deploy

### Staging (branch staging)

```bash
# Merge qa → staging (homologação final)
git checkout staging
git merge qa
git push origin staging
```

**O que acontece:**

1. ✅ Pipeline detecta push em staging
2. ✅ CI + Build + Push
3. ✅ Build Docker image → `ghcr.io/geraldobl58/nexo-be:staging-abc123`
4. ✅ Atualiza `infra/helm/nexo-be/values-staging.yaml`
5. ✅ ArgoCD detecta e faz sync
6. ✅ Deploy em https://staging.api.g3developer.online
7. ✅ Discord notifica sobre o deploy

### Produção (branch main)

```bash
# Merge staging → main (produção)
git checkout main
git merge staging
git push origin main
```

**O que acontece:**

1. ✅ Pipeline detecta push em main
2. ✅ CI + Build + Push
3. ✅ Atualiza `values-prod.yaml`
4. ✅ ArgoCD detecta e faz sync
5. ✅ Deploy em https://api.g3developer.online
6. ✅ Discord notifica sobre o deploy

### Release Oficial

```bash
# Criar tag semver
git tag v1.0.0
git push origin v1.0.0
```

**O que acontece:**

1. ✅ GitHub Release criado
2. ✅ Build de todas as imagens
3. ✅ Push com tags: v1.0.0, v1.0, v1, latest
4. ✅ Atualiza values-prod.yaml
5. ✅ Discord notifica release

---

## 📊 Resumo Visual - Fluxo de Deployment

```
Feature → Develop → QA → Staging → Production
  ↓         ↓       ↓       ↓          ↓
  PR      nexo-   nexo-   nexo-     nexo-
review   develop   qa    staging    prod
```

### Pipeline por Branch

```
┌──────────────────────────────────────────────────────────┐
│                    Git Push (any branch)                 │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌────────────────────────────────────────────────────────────┐
│   pipeline.yml                                             │
│                                                            │
│  1. Detect changes (nexo-be, nexo-fe, nexo-auth)          │
│  2. CI (test + lint + build) - apenas serviços alterados  │
│  3. Build Docker images (multi-arch: amd64 + arm64)       │
│  4. Push to ghcr.io/{service}:{branch}-{sha}              │
│  5. Update infra/helm/{service}/values-{env}.yaml         │
│  6. Commit & push [skip ci]                               │
│  7. Discord notification                                  │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ↓
┌────────────────────────────────────────────────────────────┐
│   ArgoCD (auto-sync enabled for all environments)         │
│                                                            │
│  1. Detect changes in repo                                │
│  2. Sync application (prune: true, selfHeal: true)        │
│  3. Deploy to Kubernetes                                  │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ↓
┌────────────────────────────────────────────────────────────┐
│   Kubernetes Cluster (DigitalOcean)                       │
│                                                            │
│   Namespaces:                                             │
│   • nexo-develop  (develop branch)                        │
│   • nexo-qa       (qa branch)                             │
│   • nexo-staging  (staging branch)                        │
│   • nexo-prod     (main branch)                           │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Decisões de Design

### Por que um único pipeline.yml?

- ✅ **Simplicidade** - Um arquivo para manter
- ✅ **Detecção inteligente** - Build apenas o que mudou
- ✅ **DRY** - Evita duplicação de código
- ✅ **Rápido** - Builds paralelos por serviço
- ✅ **GitOps** - ArgoCD detecta mudanças automaticamente

### Por que release.yml separado?

- ✅ **Versionamento** - Tags semver oficiais
- ✅ **Release notes** - GitHub Release automático
- ✅ **Rollback** - Imagens tagged para voltar versões
- ✅ **Controle** - Deploy manual via tags

### Por que remover deploy-local.yml?

- ❌ Harbor não é mais usado (ghcr.io)
- ❌ Self-hosted runners não são necessários
- ❌ Pipeline.yml já faz tudo de forma melhor
- ❌ Mantinha duplicação de lógica

---

## 🔧 Manutenção

### Adicionar novo serviço

Edite `pipeline.yml`:

```yaml
# STAGE 2: Detect Changes
- list:
    elements:
      # ... existentes ...
      - service: nexo-new-service
        path: infra/helm/nexo-new-service
```

### Adicionar novo ambiente

1. Crie values file: `infra/helm/{service}/values-{env}.yaml`
2. Edite `pipeline.yml` matriz de ambientes
3. Edite `infra/argocd/applicationsets/nexo-apps.yaml`

### Trocar registry

```yaml
# Em pipeline.yml
env:
  REGISTRY: outro-registry.io # Ex: docker.io, registry.gitlab.com
```

---

**Pipeline único, simples e poderoso! 🚀**
