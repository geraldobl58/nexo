# 🔧 Configuração do GitHub - Secrets, Variables e Environments

Este documento detalha **exatamente** como configurar o GitHub para o projeto Nexo Platform, incluindo todos os secrets, variables e environments necessários para CI/CD.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Repository Secrets](#repository-secrets)
3. [Repository Variables](#repository-variables)
4. [Environments](#environments)
5. [Environment Secrets](#environment-secrets)
6. [Environment Variables](#environment-variables)
7. [Passo a Passo](#passo-a-passo)
8. [Validação](#validação)

---

## Visão Geral

O projeto usa uma estratégia de configuração em camadas:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REPOSITORY LEVEL                                 │
│  (Compartilhados entre todos os environments)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  SECRETS:                          VARIABLES:                            │
│  - KUBECONFIG_*                    - REGISTRY                            │
│  - ARGOCD_AUTH_TOKEN               - ARGOCD_SERVER                       │
│  - GH_TOKEN                        - K8S_NAMESPACE_*                     │
│                                    - DOMAIN_*                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  ENVIRONMENT  │         │  ENVIRONMENT  │         │  ENVIRONMENT  │
│     dev       │         │      qa       │         │    staging    │
├───────────────┤         ├───────────────┤         ├───────────────┤
│ DATABASE_URL  │         │ DATABASE_URL  │         │ DATABASE_URL  │
│ JWT_SECRET    │         │ JWT_SECRET    │         │ JWT_SECRET    │
│ KEYCLOAK_*    │         │ KEYCLOAK_*    │         │ KEYCLOAK_*    │
└───────────────┘         └───────────────┘         └───────────────┘
```

---

## Repository Secrets

Vá em: **Settings → Secrets and variables → Actions → Secrets → New repository secret**

### Kubernetes

| Secret               | Descrição                        | Como obter |
| -------------------- | -------------------------------- | ---------- |
| `KUBECONFIG_DEV`     | Kubeconfig para ambiente DEV     | Ver abaixo |
| `KUBECONFIG_QA`      | Kubeconfig para ambiente QA      | Ver abaixo |
| `KUBECONFIG_STAGING` | Kubeconfig para ambiente STAGING | Ver abaixo |
| `KUBECONFIG_PROD`    | Kubeconfig para ambiente PROD    | Ver abaixo |

**Como obter o KUBECONFIG:**

```bash
# Do seu cluster Kubernetes (qualquer provider) (Local pode usar o mesmo kubeconfig)
kubectl config view --raw | base64

# Copie a saída e cole como valor do secret
```

### ArgoCD

| Secret              | Descrição            | Como obter |
| ------------------- | -------------------- | ---------- |
| `ARGOCD_AUTH_TOKEN` | Token de auth ArgoCD | Ver abaixo |

**Como obter o token do ArgoCD:**

```bash
# 1. Logar no ArgoCD
argocd login argocd.nexo.io --username admin --password <senha>

# 2. Criar token
argocd account generate-token --account admin

# Copie o token gerado
```

### GitHub Token

| Secret     | Descrição                         | Como obter                                                   |
| ---------- | --------------------------------- | ------------------------------------------------------------ |
| `GH_TOKEN` | Token do GitHub (para GHCR e API) | [Personal Access Tokens](https://github.com/settings/tokens) |

> **Permissões necessárias:** `write:packages`, `read:packages`, `delete:packages`

---

## Repository Variables

Vá em: **Settings → Secrets and variables → Actions → Variables → New repository variable**

### Registry

| Variable   | Valor                 | Descrição                 |
| ---------- | --------------------- | ------------------------- |
| `REGISTRY` | `ghcr.io/geraldobl58` | GitHub Container Registry |

### ArgoCD

| Variable        | Valor            | Descrição              |
| --------------- | ---------------- | ---------------------- |
| `ARGOCD_SERVER` | `argocd.nexo.io` | URL do servidor ArgoCD |

### Namespaces

| Variable                | Valor             | Descrição         |
| ----------------------- | ----------------- | ----------------- |
| `K8S_NAMESPACE_DEV`     | `nexo-develop`    | Namespace DEV     |
| `K8S_NAMESPACE_QA`      | `nexo-qa`         | Namespace QA      |
| `K8S_NAMESPACE_STAGING` | `nexo-staging`    | Namespace STAGING |
| `K8S_NAMESPACE_PROD`    | `nexo-production` | Namespace PROD    |

### Domínios

| Variable         | Valor             | Descrição       |
| ---------------- | ----------------- | --------------- |
| `DOMAIN_DEV`     | `dev.nexo.io`     | Domínio DEV     |
| `DOMAIN_QA`      | `qa.nexo.io`      | Domínio QA      |
| `DOMAIN_STAGING` | `staging.nexo.io` | Domínio STAGING |
| `DOMAIN_PROD`    | `nexo.io`         | Domínio PROD    |

---

## Environments

Vá em: **Settings → Environments → New environment**

Criar os seguintes environments:

| Environment | Branch Protection | Reviewers | Wait Timer |
| ----------- | ----------------- | --------- | ---------- |
| `dev`       | `develop`         | Não       | 0          |
| `qa`        | `qa`              | Não       | 0          |
| `staging`   | `staging`         | Opcional  | 0          |
| `prod`      | `main`            | Sim (2+)  | 5 min      |

### Configuração de cada Environment

#### Environment: dev

1. Clique em **New environment**
2. Nome: `dev`
3. Em **Deployment branches**: Selecione `Selected branches`
4. Adicione: `develop`
5. Salve

#### Environment: qa

1. Clique em **New environment**
2. Nome: `qa`
3. Em **Deployment branches**: Selecione `Selected branches`
4. Adicione: `qa`
5. Salve

#### Environment: staging

1. Clique em **New environment**
2. Nome: `staging`
3. Em **Deployment branches**: Selecione `Selected branches`
4. Adicione: `staging`
5. Salve

#### Environment: prod

1. Clique em **New environment**
2. Nome: `prod`
3. Em **Deployment branches**: Selecione `Selected branches`
4. Adicione: `main`
5. ✅ Marque **Required reviewers**
6. Adicione pelo menos 2 aprovadores
7. Opcional: Configure **Wait timer** (5 minutos)
8. Salve

---

## Environment Secrets

Para **cada environment**, configure os seguintes secrets:

Vá em: **Settings → Environments → [environment] → Environment secrets → Add secret**

### Secrets por Environment

| Secret                   | dev                    | qa                    | staging                 | prod                    |
| ------------------------ | ---------------------- | --------------------- | ----------------------- | ----------------------- |
| `DATABASE_URL`           | `postgres://...dev`    | `postgres://...qa`    | `postgres://...staging` | `postgres://...prod`    |
| `JWT_SECRET`             | `dev-jwt-secret-xxxxx` | `qa-jwt-secret-xxxxx` | `staging-jwt-secret`    | `prod-jwt-secret-xxxxx` |
| `KEYCLOAK_CLIENT_SECRET` | `dev-client-secret`    | `qa-client-secret`    | `staging-client-secret` | `prod-client-secret`    |

**Formato do DATABASE_URL:**

```
postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require

# Exemplo DEV:
postgresql://nexo:senha123@db-dev.nexo.io:5432/nexo_dev?sslmode=require
```

**Gerando JWT_SECRET:**

```bash
# Gerar secret seguro
openssl rand -base64 64
```

---

## Environment Variables

Para **cada environment**, configure as seguintes variables:

Vá em: **Settings → Environments → [environment] → Environment variables → Add variable**

### Variables por Environment

| Variable         | dev                        | qa                        | staging                        | prod                   |
| ---------------- | -------------------------- | ------------------------- | ------------------------------ | ---------------------- |
| `KEYCLOAK_URL`   | `https://auth.dev.nexo.io` | `https://auth.qa.nexo.io` | `https://auth.staging.nexo.io` | `https://auth.nexo.io` |
| `KEYCLOAK_REALM` | `nexo`                     | `nexo`                    | `nexo`                         | `nexo`                 |
| `LOG_LEVEL`      | `debug`                    | `debug`                   | `info`                         | `warn`                 |
| `ENABLE_DEBUG`   | `true`                     | `true`                    | `false`                        | `false`                |

---

## Passo a Passo

### 1. Criar Repository Secrets

```bash
# Via GitHub CLI (opcional)
gh secret set KUBECONFIG_DEV --body "$(kubectl config view --raw | base64)"
gh secret set KUBECONFIG_QA --body "$(kubectl config view --raw | base64)"
gh secret set KUBECONFIG_STAGING --body "$(kubectl config view --raw | base64)"
gh secret set KUBECONFIG_PROD --body "$(kubectl config view --raw | base64)"
gh secret set GH_TOKEN --body "ghp_xxxxx"
gh secret set ARGOCD_AUTH_TOKEN --body "eyJhbGciOiJIUzI1NiIsInR5cCI..."
```

### 2. Criar Repository Variables

```bash
# Via GitHub CLI (opcional)
gh variable set REGISTRY --body "ghcr.io/geraldobl58"
gh variable set ARGOCD_SERVER --body "argocd.nexo.io"
gh variable set K8S_NAMESPACE_DEV --body "nexo-develop"
gh variable set K8S_NAMESPACE_QA --body "nexo-qa"
gh variable set K8S_NAMESPACE_STAGING --body "nexo-staging"
gh variable set K8S_NAMESPACE_PROD --body "nexo-production"
gh variable set DOMAIN_DEV --body "dev.nexo.io"
gh variable set DOMAIN_QA --body "qa.nexo.io"
gh variable set DOMAIN_STAGING --body "staging.nexo.io"
gh variable set DOMAIN_PROD --body "nexo.io"
```

### 3. Criar Environments

Via UI do GitHub:

1. Settings → Environments
2. New environment para cada: `dev`, `qa`, `staging`, `prod`

### 4. Configurar Environment Secrets

Para cada environment, adicione os secrets específicos (DATABASE_URL, JWT_SECRET, etc.)

---

## Validação

### Verificar Secrets Configurados

```bash
# Listar secrets
gh secret list

# Listar variables
gh variable list

# Ver environments
gh api repos/:owner/:repo/environments | jq '.environments[].name'
```

### Testar Workflow

Após configurar tudo, faça um push para `develop`:

```bash
git checkout develop
echo "# test" >> README.md
git add .
git commit -m "test: verify CI/CD configuration"
git push origin develop
```

O workflow deve:

1. ✅ Fazer checkout do código
2. ✅ Login no GHCR
3. ✅ Build da imagem Docker
4. ✅ Push para GHCR
5. ✅ Deploy via ArgoCD

---

## Checklist Final

### Repository Secrets

- [ ] `KUBECONFIG_DEV`
- [ ] `KUBECONFIG_QA`
- [ ] `KUBECONFIG_STAGING`
- [ ] `KUBECONFIG_PROD`
- [ ] `ARGOCD_AUTH_TOKEN`
- [ ] `GH_TOKEN`

### Repository Variables

- [ ] `REGISTRY` = `ghcr.io/geraldobl58`
- [ ] `ARGOCD_SERVER` = `argocd.nexo.io`
- [ ] `K8S_NAMESPACE_DEV` = `nexo-develop`
- [ ] `K8S_NAMESPACE_QA` = `nexo-qa`
- [ ] `K8S_NAMESPACE_STAGING` = `nexo-staging`
- [ ] `K8S_NAMESPACE_PROD` = `nexo-production`
- [ ] `DOMAIN_DEV` = `dev.nexo.io`
- [ ] `DOMAIN_QA` = `qa.nexo.io`
- [ ] `DOMAIN_STAGING` = `staging.nexo.io`
- [ ] `DOMAIN_PROD` = `nexo.io`

### Environments

- [ ] `dev` (branch: develop)
- [ ] `qa` (branch: qa)
- [ ] `staging` (branch: staging)
- [ ] `prod` (branch: main, com reviewers)

### Environment Secrets (cada ambiente)

- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `KEYCLOAK_CLIENT_SECRET`

---

## Próximos Passos

1. [Configurar Kubernetes](./kubernetes.md) - Cluster Kubernetes
2. [Configurar ArgoCD](./argocd.md) - GitOps
3. [Ambiente Local](./local/README.md) - K3D para desenvolvimento
