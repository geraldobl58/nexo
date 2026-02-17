# 04 — Configuração do GitHub

> Configuração completa do repositório GitHub: secrets, branch protection, GHCR e permissões.

---

## Visão Geral

O GitHub é o ponto central do fluxo de desenvolvimento:

```
Developer → Push/PR → GitHub Actions → GHCR → Helm values update → ArgoCD sync
```

Componentes usados:

- **GitHub Repository** — Código-fonte + IaC (Helm values)
- **GitHub Actions** — Pipeline CI/CD (10 stages)
- **GitHub Container Registry (GHCR)** — Imagens Docker
- **Branch Protection** — Regras por ambiente
- **Webhooks** — Discord notifications

---

## 1. Configuração do Repositório

### Criação

```bash
# Se ainda não existe
gh repo create geraldobl58/nexo --private
```

### Settings (Repository → Settings)

| Setting                   | Valor                       |
| ------------------------- | --------------------------- |
| Default branch            | `develop`                   |
| Visibility                | Private                     |
| Wikis                     | Desativado                  |
| Issues                    | Ativado                     |
| Pull Requests             | Merge commit + Squash merge |
| Auto-delete head branches | ✅ Ativado                  |

---

## 2. Secrets e Variables

### Repository Secrets (Settings → Secrets and variables → Actions → Secrets)

Estes secrets são usados pela pipeline CI/CD:

| Secret            | Descrição                            | Como obter                                                                   |
| ----------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| `DISCORD_WEBHOOK` | Webhook do Discord para notificações | Discord → Server Settings → Integrations → Webhooks → New Webhook → Copy URL |

### Permissões Automáticas (sem secret manual)

| Recurso      | Detalhes                                                           |
| ------------ | ------------------------------------------------------------------ |
| **GHCR**     | Autenticado automaticamente via `GITHUB_TOKEN` (padrão do Actions) |
| **Git Push** | O `GITHUB_TOKEN` tem `contents: write` configurado no workflow     |

> **Nota:** Não é necessário criar `GHCR_TOKEN` ou `CR_PAT` separados. A pipeline usa o `GITHUB_TOKEN` integrado com as permissões definidas no workflow.

---

## 3. GitHub Container Registry (GHCR)

### Como funciona

A pipeline faz push automático das imagens para o GHCR:

```
ghcr.io/geraldobl58/nexo-be:<tag>
ghcr.io/geraldobl58/nexo-fe:<tag>
ghcr.io/geraldobl58/nexo-auth:<tag>
```

**Tags geradas:**

- `<branch>` — Tag de branch (ex: `develop`, `main`)
- `<branch>-<sha>` — Tag com commit SHA (ex: `develop-abc1234`)

### Visibilidade dos Pacotes

Por padrão, imagens em repos privados são privadas. Para o cluster Kubernetes puxar as imagens:

1. **GitHub → Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Criar token com scope `read:packages`
3. Usar esse token no script `create-secrets.sh` como `GHCR_TOKEN`

### Verificar Imagens

```bash
# Via GitHub CLI
gh api user/packages?package_type=container | jq '.[].name'

# Ou acessar:
# https://github.com/geraldobl58?tab=packages
```

---

## 4. Branch Protection Rules

### Settings → Branches → Add rule

#### Branch `main` (Produção)

| Regra                               | Valor                       |
| ----------------------------------- | --------------------------- |
| Branch name pattern                 | `main`                      |
| Require pull request before merging | ✅                          |
| Required approvals                  | 1                           |
| Dismiss stale reviews               | ✅                          |
| Require status checks to pass       | ✅                          |
| Required checks                     | `ci-backend`, `ci-frontend` |
| Require branches to be up to date   | ✅                          |
| Restrict who can push               | Maintainers only            |
| Allow force pushes                  | ❌                          |
| Allow deletions                     | ❌                          |

#### Branch `develop`

| Regra               | Valor     |
| ------------------- | --------- |
| Branch name pattern | `develop` |
| Allow force pushes  | ❌        |

---

## 5. Environments (Settings → Environments)

Criar os seguintes environments no GitHub:

### `develop`

- **Protection rules:** Nenhuma (deploy automático)
- **Secrets:** Nenhum adicional

### `prod`

- **Protection rules:**
  - ✅ Required reviewers: Adicionar pelo menos 1 reviewer
  - ✅ Wait timer: 5 minutos (opcional, para dar tempo de cancelar)
- **Secrets:** Nenhum adicional

> **Nota:** A proteção do ambiente `prod` é redundante com a branch protection do `main` e o sync manual do ArgoCD. São três camadas de segurança.

---

## 6. GitHub Actions — Permissions

O workflow já define as permissões necessárias:

```yaml
permissions:
  contents: write # Push de Helm values atualizados
  packages: write # Push de imagens para GHCR
  pull-requests: write # Comentários do AI Review
  issues: write # Danger.js reports
```

### Actions Settings (Settings → Actions → General)

| Setting                            | Valor                      |
| ---------------------------------- | -------------------------- |
| Actions permissions                | Allow all actions          |
| Workflow permissions               | Read and write permissions |
| Allow GitHub Actions to create PRs | ✅                         |

---

## 7. Webhook do Discord

### Criar Webhook no Discord

1. Abrir Discord → Servidor → Canal de notificações
2. **Edit Channel** → **Integrations** → **Webhooks**
3. **New Webhook** → Nomear "Nexo Pipeline"
4. **Copy Webhook URL**
5. Adicionar como secret `DISCORD_WEBHOOK_URL` no GitHub

### Formato das Notificações

A pipeline envia embeds coloridos por ambiente:

| Ambiente | Cor                     |
| -------- | ----------------------- |
| develop  | 🟢 Verde (`#00ff00`)    |
| prod     | 🔴 Vermelho (`#ff0000`) |

Cada notificação inclui: status por serviço (✅/❌/⏭), commit, link do pipeline.

---

## 8. Fluxo de Trabalho Git

### Branching Model

```
main (produção)
  ↑ PR (requer aprovação)
develop (desenvolvimento ativo)
  ↑ feature branches
feature/nome-da-feature
```

### Fluxo Típico

```bash
# 1. Criar feature branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver e commitar
git add .
git commit -m "feat: implementar nova funcionalidade"

# 3. Push e criar PR para develop
git push origin feature/nova-funcionalidade
# Criar PR no GitHub → Merge para develop

# 4. Pipeline roda automaticamente → deploy em nexo-develop

# 5. Promover para prod (PR develop → main, requer aprovação)
```

### Convenção de Commits

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
ci: pipeline
```

---

## 9. Checklist de Configuração

- [ ] Repositório criado e privado
- [ ] Branches criadas: `develop`, `main`
- [ ] Default branch: `develop`
- [ ] Branch protection configurada (todas as branches)
- [ ] Secret `DISCORD_WEBHOOK_URL` adicionado
- [ ] Actions permissions: Read and write
- [ ] GHCR PAT criado para o cluster (scope `read:packages`)
- [ ] Environments criados (develop, prod)
- [ ] Environment `prod` com required reviewers

---

## Próximo Passo

→ [05 — Configuração da DigitalOcean](05-digitalocean-setup.md)
