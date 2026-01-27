# 🌿 Estratégia de Branches e Fluxo GitOps

Guia completo para configuração de branches protegidas e fluxo de desenvolvimento.

## 📊 Visão Geral do Fluxo

```
feature/* ──┐
bugfix/*  ──┼──> develop ──> qa ──> staging ──> main (production)
hotfix/*  ──┘                                      │
                                                   └──> hotfix/* (emergência)
```

### Ambientes e Branches

| Branch      | Ambiente    | Propósito                          | Deploy     |
| ----------- | ----------- | ---------------------------------- | ---------- |
| `main`      | Production  | Código em produção                 | Automático |
| `staging`   | Staging     | Validação final pré-produção       | Automático |
| `qa`        | QA          | Testes de qualidade                | Automático |
| `develop`   | Development | Integração de features             | Automático |
| `feature/*` | -           | Desenvolvimento de funcionalidades | -          |
| `bugfix/*`  | -           | Correções de bugs                  | -          |
| `hotfix/*`  | -           | Correções urgentes em produção     | -          |

---

## 🔒 Configuração de Branch Protection no GitHub

### Passo 1: Acessar Configurações

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Branches**
3. Clique em **Add branch protection rule**

### Passo 2: Configurar Branch `main` (Production)

**Branch name pattern:** `main`

✅ **Marque as seguintes opções:**

- [x] **Require a pull request before merging**
  - [x] Require approvals: `2`
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Status checks: `ci`, `test`, `lint`, `security-scan`
- [x] **Require conversation resolution before merging**
- [x] **Require signed commits** (opcional, mas recomendado)
- [x] **Require linear history**
- [x] **Do not allow bypassing the above settings**
- [x] **Restrict who can push to matching branches**
  - Apenas: `release-bot`, `admin-team`
- [x] **Allow force pushes**: ❌ (desabilitado)
- [x] **Allow deletions**: ❌ (desabilitado)

### Passo 3: Configurar Branch `staging`

**Branch name pattern:** `staging`

✅ **Marque as seguintes opções:**

- [x] **Require a pull request before merging**
  - [x] Require approvals: `1`
  - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] **Require status checks to pass before merging**
  - Status checks: `ci`, `test`, `lint`
- [x] **Require conversation resolution before merging**
- [x] **Restrict who can push to matching branches**
  - Apenas merges de: `qa`

### Passo 4: Configurar Branch `qa`

**Branch name pattern:** `qa`

✅ **Marque as seguintes opções:**

- [x] **Require a pull request before merging**
  - [x] Require approvals: `1`
- [x] **Require status checks to pass before merging**
  - Status checks: `ci`, `test`
- [x] **Restrict who can push to matching branches**
  - Apenas merges de: `develop`

### Passo 5: Configurar Branch `develop`

**Branch name pattern:** `develop`

✅ **Marque as seguintes opções:**

- [x] **Require a pull request before merging**
  - [x] Require approvals: `1`
- [x] **Require status checks to pass before merging**
  - Status checks: `ci`, `lint`
- [x] **Require conversation resolution before merging**

---

## 📜 Ruleset Avançado (GitHub Enterprise / Pro)

Se você tiver GitHub Enterprise ou Pro, pode criar **Rulesets** mais avançados:

### Via GitHub UI

1. **Settings** → **Rules** → **Rulesets**
2. **New ruleset** → **New branch ruleset**

### Via GitHub API / Terraform

```hcl
# terraform/github-branch-protection.tf
resource "github_branch_protection" "main" {
  repository_id = github_repository.nexo.node_id
  pattern       = "main"

  required_pull_request_reviews {
    required_approving_review_count = 2
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = true
  }

  required_status_checks {
    strict   = true
    contexts = ["ci", "test", "lint", "security-scan"]
  }

  enforce_admins = true
  allows_force_pushes = false
  allows_deletions    = false
}
```

---

## 🔄 Fluxo de Trabalho Completo

### 1. Desenvolvimento de Feature

```bash
# 1. Atualize develop
git checkout develop
git pull origin develop

# 2. Crie sua branch
git checkout -b feature/user-profile

# 3. Desenvolva e faça commits
git add .
git commit -m "feat(user): add profile page with avatar"

# 4. Push
git push origin feature/user-profile

# 5. Abra PR para develop (via GitHub)
```

### 2. Promoção develop → qa

```bash
# Após aprovação da feature, ela é mergeada em develop
# CI/CD faz deploy automático no ambiente DEV

# Para promover para QA:
git checkout qa
git pull origin qa
git merge develop
git push origin qa

# OU via GitHub: Abra PR develop → qa
```

### 3. Promoção qa → staging

```bash
# Após testes de QA aprovados:
git checkout staging
git pull origin staging
git merge qa
git push origin staging

# OU via GitHub: Abra PR qa → staging
```

### 4. Promoção staging → main (Release)

```bash
# Após validação final em staging:
git checkout main
git pull origin main
git merge staging
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# OU via GitHub: Abra PR staging → main
```

### 5. Hotfix (Emergência em Produção)

```bash
# 1. Crie branch a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Aplique a correção
git add .
git commit -m "fix(security): patch XSS vulnerability"

# 3. Push e abra PR para main
git push origin hotfix/critical-security-fix

# 4. Após merge em main, backport para outras branches
git checkout staging && git merge main
git checkout qa && git merge staging
git checkout develop && git merge qa
```

---

## 🤖 GitHub Actions - CI/CD por Branch

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, staging, qa, develop]
  pull_request:
    branches: [main, staging, qa, develop]

jobs:
  # Sempre executa
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test

  # Deploy baseado na branch
  deploy:
    needs: ci
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Set environment
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "ENV=prod" >> $GITHUB_ENV
          elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
            echo "ENV=staging" >> $GITHUB_ENV
          elif [ "${{ github.ref }}" == "refs/heads/qa" ]; then
            echo "ENV=qa" >> $GITHUB_ENV
          elif [ "${{ github.ref }}" == "refs/heads/develop" ]; then
            echo "ENV=dev" >> $GITHUB_ENV
          fi

      - name: Deploy to ${{ env.ENV }}
        run: |
          echo "Deploying to ${{ env.ENV }}"
          # ArgoCD sync ou kubectl apply
```

---

## 📋 CODEOWNERS

Crie o arquivo `.github/CODEOWNERS`:

```
# Owners padrão
* @tech-leads

# Backend
/apps/nexo-be/ @backend-team @tech-leads

# Frontend
/apps/nexo-fe/ @frontend-team @tech-leads

# Infraestrutura
/infra/ @devops-team @tech-leads
/k8s/ @devops-team @tech-leads

# Documentação
/documentation/ @tech-leads

# CI/CD - requer aprovação de DevOps
/.github/ @devops-team
/Makefile @devops-team @tech-leads
```

---

## 🏷️ Convenção de Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo        | Descrição               |
| ----------- | ----------------------- |
| `feat:`     | Nova funcionalidade     |
| `fix:`      | Correção de bug         |
| `docs:`     | Documentação            |
| `style:`    | Formatação (sem lógica) |
| `refactor:` | Refatoração             |
| `test:`     | Testes                  |
| `chore:`    | Manutenção              |
| `ci:`       | CI/CD                   |
| `perf:`     | Performance             |
| `build:`    | Build system            |

**Exemplos:**

```bash
git commit -m "feat(auth): add OAuth2 login with Google"
git commit -m "fix(api): resolve memory leak in cache service"
git commit -m "docs: update deployment guide"
git commit -m "chore(deps): upgrade nestjs to v10"
```

---

## 🔐 Secrets e Variáveis por Ambiente

Configure secrets diferentes para cada ambiente no GitHub:

1. **Settings** → **Secrets and variables** → **Actions**
2. Crie secrets com prefixo do ambiente:

| Secret                 | Ambiente |
| ---------------------- | -------- |
| `DEV_DATABASE_URL`     | develop  |
| `QA_DATABASE_URL`      | qa       |
| `STAGING_DATABASE_URL` | staging  |
| `PROD_DATABASE_URL`    | main     |
| `DEV_KEYCLOAK_SECRET`  | develop  |
| `PROD_KEYCLOAK_SECRET` | main     |

---

## ✅ Checklist de Configuração

- [ ] Branches criadas: `main`, `staging`, `qa`, `develop`
- [ ] Branch protection configurada para cada branch
- [ ] CODEOWNERS criado
- [ ] GitHub Actions configurado
- [ ] Secrets por ambiente configurados
- [ ] Times definidos no GitHub: `tech-leads`, `backend-team`, `frontend-team`, `devops-team`
- [ ] Webhook do ArgoCD configurado (opcional)

---

## 📚 Próximos Passos

- [Deployment Guide](deploy.md) - CI/CD completo
- [Kubernetes Guide](kubernetes.md) - Deploy em K8s
- [Architecture](architecture.md) - Visão técnica
