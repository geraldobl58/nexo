# 06 — CI/CD Pipeline

> Detalhamento completo da pipeline GitHub Actions: 10 stages, do código ao deploy.

---

## Visão Geral

A pipeline é definida em `.github/workflows/pipeline.yml` (~1000 linhas) e orquestra todo o fluxo:

```
Push/PR → AI Review → Pre-flight → Detect Changes → CI (lint+test+build)
  → Docker Build (multi-arch) → Deploy (Helm values) → Discord Notify
```

### Trigger

```yaml
on:
  push:
    branches: [develop, main]
    paths:
      - "apps/**"
      - "packages/**"
      - "pnpm-lock.yaml"
      - ".github/workflows/pipeline.yml"
  pull_request:
    branches: [develop, main]
  workflow_dispatch:
    inputs:
      force_all:
        description: "Force all builds"
        type: boolean
```

### Concorrência

```yaml
concurrency:
  group: pipeline-${{ github.ref }}-${{ github.sha }}
  cancel-in-progress: true
```

Apenas uma execução por branch+commit. Pushes subsequentes cancelam execuções anteriores.

---

## Stages

### Stage 1: AI Review (PRs only)

- **Condição:** Apenas Pull Requests
- **Ferramentas:** Danger.js + CodeRabbit
- **O que faz:** Análise automática do código, sugestões de melhoria, summary no PR
- **Obrigatório:** Não (informativo)

### Stage 2: Pre-flight

```yaml
outputs:
  should_skip    # true se [skip ci] ou bot commit
  environment    # develop | prod
  namespace      # nexo-develop | nexo-prod
  build_number   # Número sequencial (git rev-list --count)
```

**Mapeamento branch → ambiente:**

| Branch    | Ambiente | Namespace    |
| --------- | -------- | ------------ |
| `develop` | develop  | nexo-develop |
| `main`    | prod     | nexo-prod    |

### Stage 3: Detect Changes

Usa `dorny/paths-filter` + detecção manual de merge commits:

```yaml
filters:
  nexo-be: "apps/nexo-be/**"
  nexo-fe: "apps/nexo-fe/**"
  nexo-auth: "apps/nexo-auth/**"
  packages: "packages/**"
```

**Regra importante:** Mudanças em `packages/**` disparam build de **backend E frontend**.

### Stage 4: CI Backend

```
pnpm install → lint (continue-on-error) → test (continue-on-error) → build
```

- **Lint:** ESLint (não bloqueia deploy)
- **Test:** Jest (não bloqueia deploy)
- **Build:** `nest build` (deve passar)

### Stage 5: CI Frontend

```
pnpm install → lint (continue-on-error) → build
```

### Stage 6: CI Auth

```
Verifica existência do Dockerfile → OK
```

### Stage 7: Build Backend (Docker)

```yaml
- uses: docker/build-push-action@v6
  with:
    platforms: linux/amd64,linux/arm64
    push: true
    tags: |
      ghcr.io/geraldobl58/nexo-be:${{ branch }}
      ghcr.io/geraldobl58/nexo-be:${{ branch }}-${{ sha }}
    cache-from: type=registry,ref=ghcr.io/geraldobl58/nexo-be:buildcache
    cache-to: type=registry,ref=ghcr.io/geraldobl58/nexo-be:buildcache,mode=max
```

### Stage 8: Build Frontend (Docker)

Mesmo que o backend, mas com **build-args por ambiente**:

| Ambiente | `NEXT_PUBLIC_API_URL`                     | `NEXT_PUBLIC_KEYCLOAK_URL`                 |
| -------- | ----------------------------------------- | ------------------------------------------ |
| develop  | `https://develop.api.g3developer.online`  | `https://develop.auth.g3developer.online`  |
| prod     | `https://api.g3developer.online`          | `https://auth.g3developer.online`          |

> **Nota:** As variáveis `NEXT_PUBLIC_*` são embutidas no build time do Next.js, por isso cada ambiente gera uma imagem diferente.

### Stage 9: Deploy

O deploy **não executa comandos no cluster**. Ele atualiza os Helm values no repositório:

```bash
# Função interna do pipeline
update_service() {
  local SERVICE=$1
  local VALUES_FILE="infra/helm/${SERVICE}/values-${ENV}.yaml"

  # Atualiza image.tag no values file
  awk -v new_tag="${BRANCH}-${COMMIT_SHA}" '...' "$VALUES_FILE"
}
```

**Commit format:**

```
#<build_number>: <commit_msg> | deploy(<env>): <services> → <sha> [skip ci]
```

O `[skip ci]` garante que o commit do deploy não re-trigger a pipeline.

**Quem faz o deploy real?** O ArgoCD detecta a mudança no values file e sincroniza o cluster automaticamente. Ver [08-argocd-gitops.md](08-argocd-gitops.md).

### Stage 10: Discord Notify

```bash
# Embed colorido por ambiente
{
  "embeds": [{
    "title": "Pipeline #<build>",
    "color": <cor_por_ambiente>,
    "fields": [
      { "name": "Backend",  "value": "✅ Success" },
      { "name": "Frontend", "value": "✅ Success" },
      { "name": "Auth",     "value": "⏭ Skipped" }
    ]
  }]
}
```

---

## Diagrama de Dependências

```
                    ┌──────────┐
                    │Pre-flight│
                    └────┬─────┘
                         │
                 ┌───────┼───────┐
                 │       │       │
          ┌──────▼──┐ ┌──▼───┐ ┌▼───────┐
          │CI Backend│ │CI FE │ │CI Auth │
          └────┬─────┘ └──┬───┘ └┬───────┘
               │          │      │
          ┌────▼─────┐ ┌──▼────┐ │
          │Build BE  │ │Build  │ │
          │(Docker)  │ │FE     │ │
          └────┬─────┘ └──┬────┘ │
               │          │      │
               └────┬─────┘      │
                    │             │
               ┌────▼────────────▼┐
               │Deploy             │
               │(update Helm vals) │
               └────┬──────────────┘
                    │
               ┌────▼──────┐
               │Discord    │
               │Notify     │
               └───────────┘
```

---

## Permissões Necessárias

```yaml
permissions:
  contents: write # Commit Helm values atualizados
  packages: write # Push imagens para GHCR
  pull-requests: write # AI Review comments
  issues: write # Danger.js reports
```

---

## Cache e Performance

| Cache         | Tipo            | Detalhes                                             |
| ------------- | --------------- | ---------------------------------------------------- |
| pnpm store    | `actions/cache` | Cache do pnpm store entre runs                       |
| Docker layers | Registry cache  | `cache-from/to: type=registry` no GHCR               |
| Turbo cache   | Nenhum          | Turborepo não usa remote cache (pode ser adicionado) |

---

## Variáveis Automáticas

| Variável                           | Fonte      | Uso                          |
| ---------------------------------- | ---------- | ---------------------------- |
| `GITHUB_TOKEN`                     | Automático | Auth para GHCR e commits     |
| `github.sha`                       | Automático | Tag de imagem                |
| `github.ref_name`                  | Automático | Mapeamento para ambiente     |
| `github.event.head_commit.message` | Automático | Mensagem no commit de deploy |

---

## Troubleshooting da Pipeline

### Build falhou mas deploy executou serviços que passaram

Cada serviço é independente. Se o backend falhou mas o frontend passou, apenas o frontend é deployado.

### Pipeline não disparou

Verificar:

1. O push foi em `develop` ou `main`?
2. Os arquivos alterados estão nos paths configurados?
3. O último commit contém `[skip ci]`?

### Imagem não aparece no GHCR

```bash
# Verificar permissões do token
gh api user/packages?package_type=container

# Verificar logs do build step no Actions
```

### Deploy commitou mas ArgoCD não sincronizou

Ver [08-argocd-gitops.md](08-argocd-gitops.md) e [12-troubleshooting.md](12-troubleshooting.md).

---

## Próximo Passo

→ [07 — Helm Charts](07-helm-charts.md)
