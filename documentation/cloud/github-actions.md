# 🔄 GitHub Actions - Guia Completo

Este documento explica **passo a passo** como configurar e usar os pipelines de CI/CD do projeto Nexo.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura dos Workflows](#arquitetura-dos-workflows)
3. [Estratégia de Branches](#estratégia-de-branches)
4. [Como Habilitar GitHub Actions](#como-habilitar-github-actions)
5. [Configurar Secrets e Variables](#configurar-secrets-e-variables)
6. [Entendendo Cada Pipeline](#entendendo-cada-pipeline)
7. [Promoção de Ambientes](#promoção-de-ambientes)
8. [Executar Deploy Manual](#executar-deploy-manual)
9. [Monitorar Pipelines](#monitorar-pipelines)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O projeto usa **4 workflows** principais:

| Workflow    | Arquivo            | Trigger           | Função                         |
| ----------- | ------------------ | ----------------- | ------------------------------ |
| CI          | `ci-main.yml`      | Push em branches  | Lint, Test, Build, Push Docker |
| CD          | `cd-main.yml`      | Após CI ou manual | Deploy via ArgoCD              |
| CI Reusable | `_ci-reusable.yml` | Chamado pelo CI   | Lógica reutilizável de CI      |
| CD Reusable | `_cd-reusable.yml` | Chamado pelo CD   | Lógica reutilizável de CD      |

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PIPELINE CI/CD                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│   │  Push   │──►│  Lint   │──►│  Test   │──►│  Build  │──►│  Push   │      │
│   │ (Git)   │   │         │   │         │   │ Docker  │   │  GHCR   │      │
│   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └────┬────┘      │
│                                                                 │           │
│                         ┌───────────────────────────────────────┘           │
│                         ▼                                                   │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐                    │
│   │ ArgoCD  │◄──│ Update  │◄──│  CD     │◄──│ Trigger │                    │
│   │  Sync   │   │  Helm   │   │ Pipeline│   │  Auto   │                    │
│   └────┬────┘   └─────────┘   └─────────┘   └─────────┘                    │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────┐                                                               │
│   │  DOKS   │                                                               │
│   │ Deploy  │                                                               │
│   └─────────┘                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Arquitetura dos Workflows

### Estrutura de Arquivos

```
.github/
├── workflows/
│   ├── ci-main.yml          # Orquestrador CI
│   ├── cd-main.yml          # Orquestrador CD
│   ├── _ci-reusable.yml     # Workflow reutilizável CI
│   └── _cd-reusable.yml     # Workflow reutilizável CD
└── pull_request_template.md # Template de PR
```

### Por que Workflows Reutilizáveis?

- **DRY (Don't Repeat Yourself)**: Lógica centralizada
- **Manutenção**: Alterações em um único lugar
- **Consistência**: Todos os serviços seguem o mesmo padrão
- **Escalabilidade**: Fácil adicionar novos serviços

---

## Estratégia de Branches

### Fluxo GitFlow Obrigatório

```
feature/* → develop → qa → staging → main (production)
     │          │       │       │          │
     │          │       │       │          └─► Deploy Produção (manual + aprovação)
     │          │       │       └─► Deploy Staging (automático)
     │          │       └─► Deploy QA (automático)
     │          └─► Deploy Develop (automático)
     └─► Desenvolvimento local (sem deploy)
```

### Mapeamento Branch → Ambiente

| Branch      | Namespace         | Deploy     | Aprovação       |
| ----------- | ----------------- | ---------- | --------------- |
| `feature/*` | -                 | Nenhum     | -               |
| `develop`   | `nexo-develop`    | Automático | Não             |
| `qa`        | `nexo-qa`         | Automático | Não             |
| `staging`   | `nexo-staging`    | Automático | Não             |
| `main`      | `nexo-production` | Manual     | Sim (reviewers) |

### Regras de Branch Protection

Configure em **Settings → Branches → Add branch protection rule**:

#### Branch: `main`

```yaml
Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals: 2
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☑ Require review from Code Owners

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Status checks:
    - CI / 🔵 Backend
    - CI / 🟢 Frontend

☑ Require conversation resolution before merging
☑ Do not allow bypassing the above settings
```

#### Branch: `staging`

```yaml
Branch name pattern: staging

☑ Require a pull request before merging
  ☑ Require approvals: 1

☑ Require status checks to pass before merging
  Status checks:
    - CI / 🔵 Backend
    - CI / 🟢 Frontend
```

#### Branch: `qa`

```yaml
Branch name pattern: qa

☑ Require status checks to pass before merging
  Status checks:
    - CI / 🔵 Backend
    - CI / 🟢 Frontend
```

#### Branch: `develop`

```yaml
Branch name pattern: develop

☑ Require status checks to pass before merging
  Status checks:
    - CI / 🔵 Backend
    - CI / 🟢 Frontend
```

---

## Como Habilitar GitHub Actions

### Passo 1: Verificar se Actions está habilitado

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Actions** → **General**
3. Em "Actions permissions", selecione:
   - ☑ **Allow all actions and reusable workflows**
4. Em "Workflow permissions", selecione:
   - ☑ **Read and write permissions**
   - ☑ **Allow GitHub Actions to create and approve pull requests**
5. Clique em **Save**

### Passo 2: Verificar estrutura de arquivos

Confirme que os arquivos existem em `.github/workflows/`:

```bash
ls -la .github/workflows/
# Deve mostrar:
# ci-main.yml
# cd-main.yml
# _ci-reusable.yml
# _cd-reusable.yml
```

### Passo 3: Fazer primeiro push

```bash
# Qualquer push em develop ou main vai triggerar o CI
git checkout develop
git push origin develop
```

### Passo 4: Verificar execução

1. Vá em **Actions** no GitHub
2. Você deve ver o workflow "CI" em execução
3. Clique para ver os detalhes

---

## Configurar Secrets e Variables

> 📖 Veja o documento completo em [github-secrets.md](github-secrets.md)

### Resumo Rápido

**Settings → Secrets and variables → Actions**

#### Secrets (Aba "Secrets")

| Secret               | Descrição                      |
| -------------------- | ------------------------------ |
| `KUBECONFIG_DEV`     | Kubeconfig do cluster (base64) |
| `KUBECONFIG_QA`      | Kubeconfig do cluster (base64) |
| `KUBECONFIG_STAGING` | Kubeconfig do cluster (base64) |
| `KUBECONFIG_PROD`    | Kubeconfig do cluster (base64) |
| `ARGOCD_AUTH_TOKEN`  | Token do ArgoCD                |

#### Variables (Aba "Variables")

| Variable                | Valor                 |
| ----------------------- | --------------------- |
| `REGISTRY`              | `ghcr.io/geraldobl58` |
| `ARGOCD_SERVER`         | `argocd.nexo.io`      |
| `K8S_NAMESPACE_DEV`     | `nexo-develop`        |
| `K8S_NAMESPACE_QA`      | `nexo-qa`             |
| `K8S_NAMESPACE_STAGING` | `nexo-staging`        |
| `K8S_NAMESPACE_PROD`    | `nexo-production`     |

---

## Entendendo Cada Pipeline

### CI Pipeline (`ci-main.yml`)

**Trigger**: Push em `develop`, `qa`, `staging`, `main`

**Jobs**:

1. **🔍 Detect Changes**: Identifica quais apps mudaram
2. **🔵 Backend**: Roda CI para `nexo-be` se mudou
3. **🟢 Frontend**: Roda CI para `nexo-fe` se mudou
4. **🟡 Nexo Auth**: Roda CI para `nexo-auth` se mudou
5. **🔧 Lint Infra**: Valida Helm charts e YAML
6. **📊 Summary**: Gera relatório final

**Fluxo de cada serviço** (via `_ci-reusable.yml`):

```
Setup → Lint → Test → Build Docker → Push GHCR → Security Scan
```

### CD Pipeline (`cd-main.yml`)

**Trigger**:

- Automático após CI bem-sucedido (em branches configuradas)
- Manual via `workflow_dispatch`

**Jobs**:

1. **🔧 Prepare**: Define serviços, ambiente e tag
2. **🔵 Deploy Backend**: Deploy nexo-be via ArgoCD
3. **🟢 Deploy Frontend**: Deploy nexo-fe via ArgoCD
4. **🟡 Deploy Auth**: Deploy nexo-auth via ArgoCD
5. **📊 Summary**: Gera relatório final

**Fluxo de cada serviço** (via `_cd-reusable.yml`):

```
Validate Helm → [Approval] → Update ArgoCD → Sync → Verify Health
```

---

## Promoção de Ambientes

### Como promover código entre ambientes

#### Develop → QA

```bash
# 1. Criar PR de develop para qa
git checkout qa
git pull origin qa
git merge develop
git push origin qa

# Ou via GitHub:
# Criar Pull Request: develop → qa
# Merge após CI passar
```

#### QA → Staging

```bash
# 1. Criar PR de qa para staging
git checkout staging
git pull origin staging
git merge qa
git push origin staging
```

#### Staging → Production

```bash
# 1. Criar PR de staging para main
# 2. Aguardar aprovação de 2 reviewers
# 3. Merge após aprovação
# 4. CD vai aguardar aprovação no GitHub Environment
# 5. Aprovar deploy no GitHub Actions
```

### Diagrama de Promoção

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   develop   │────►│     qa      │────►│   staging   │────►│    main     │
│             │ PR  │             │ PR  │             │ PR  │             │
│ (auto-sync) │     │ (auto-sync) │     │ (auto-sync) │     │ (approval)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│nexo-develop │     │   nexo-qa   │     │nexo-staging │     │nexo-prod    │
│ (namespace) │     │ (namespace) │     │ (namespace) │     │ (namespace) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Executar Deploy Manual

### Via GitHub UI

1. Vá em **Actions** → **CD**
2. Clique em **Run workflow**
3. Selecione:
   - **Branch**: branch de origem
   - **Serviço**: `nexo-be`, `nexo-fe`, `nexo-auth` ou `all`
   - **Ambiente**: `dev`, `qa`, `staging` ou `prod`
   - **Tag da imagem**: deixe vazio para usar a última
4. Clique em **Run workflow**

### Via GitHub CLI

```bash
# Instalar gh cli
brew install gh

# Autenticar
gh auth login

# Executar workflow
gh workflow run cd-main.yml \
  --ref develop \
  -f service=all \
  -f environment=dev \
  -f image_tag=""
```

### Via API

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/geraldobl58/nexo/actions/workflows/cd-main.yml/dispatches \
  -d '{"ref":"develop","inputs":{"service":"all","environment":"dev"}}'
```

---

## Monitorar Pipelines

### Via GitHub UI

1. Acesse **Actions** no repositório
2. Veja a lista de execuções
3. Clique em uma execução para ver detalhes
4. Clique em um job para ver logs

### Via GitHub CLI

```bash
# Listar execuções recentes
gh run list

# Ver status de uma execução específica
gh run view <run-id>

# Ver logs de uma execução
gh run view <run-id> --log

# Assistir execução em tempo real
gh run watch <run-id>
```

### Notificações

Configure notificações em **Settings → Notifications**:

- ☑ **Actions**: Get notified when workflow runs complete

---

## Troubleshooting

### CI falhou no Lint

```
Error: ESLint found problems
```

**Solução**:

```bash
# Rodar lint localmente
pnpm lint

# Corrigir automaticamente
pnpm lint --fix

# Commit e push
git add . && git commit -m "fix: lint errors" && git push
```

### CI falhou no Build Docker

```
Error: failed to solve: failed to compute cache key
```

**Solução**:

- Verifique se todos os arquivos necessários estão no `.dockerignore`
- Verifique se o `Dockerfile` está correto

### CD falhou no ArgoCD Sync

```
Error: argocd app sync failed
```

**Solução**:

1. Verifique o ArgoCD diretamente:
   ```bash
   argocd app get nexo-be-dev
   argocd app sync nexo-be-dev
   ```
2. Verifique os logs do pod no namespace

### Push para GHCR falhou

```
Error: denied: permission_denied
```

**Solução**:

1. Verifique se o `GITHUB_TOKEN` tem permissão de escrita
2. Vá em **Settings → Actions → General → Workflow permissions**
3. Selecione **Read and write permissions**

### Workflow não triggera

**Possíveis causas**:

1. Arquivo de workflow com sintaxe inválida
2. Branch não está configurada nos triggers
3. Actions está desabilitado

**Solução**:

```bash
# Validar sintaxe
yamllint .github/workflows/

# Verificar triggers no arquivo
cat .github/workflows/ci-main.yml | grep -A10 "on:"
```

---

## Próximos Passos

1. Configure os [Secrets](github-secrets.md)
2. Configure a [DigitalOcean](digitalocean-setup.md)
3. Entenda os [Ambientes](environments.md)
4. Consulte o [Troubleshooting](troubleshooting.md) se tiver problemas
