# 🌿 Estratégia de Branches - Nexo Platform

## 📋 Branches Necessárias

### ✅ Branches Principais (já existentes)

```bash
main       # Produção (prod.nexo.local + g3developer.online)
develop    # Desenvolvimento (develop.nexo.local)
```

### ❌ Branches a Criar

```bash
qa         # Quality Assurance (qa.nexo.local)
staging    # Homologação (staging.nexo.local)
```

---

## 🚀 Como Criar as Branches

### 1. Branch QA

```bash
# A partir da develop
git checkout develop
git pull origin develop

# Criar e publicar qa
git checkout -b qa
git push -u origin qa

# Proteger branch no GitHub
# Settings > Branches > Add rule
# Branch name pattern: qa
# ✅ Require pull request before merging
# ✅ Require status checks to pass (CI)
```

### 2. Branch Staging

```bash
# A partir da develop
git checkout develop
git pull origin develop

# Criar e publicar staging
git checkout -b staging
git push -u origin staging

# Proteger branch no GitHub
# Settings > Branches > Add rule
# Branch name pattern: staging
# ✅ Require pull request before merging
# ✅ Require status checks to pass (CI)
```

---

## 🔄 GitFlow - Fluxo Completo

```
feature/nova-funcionalidade
    │
    ├──► develop (PR) ─────► Deploy automático: develop.nexo.local
    │         │
    │         ├──► qa (PR) ─────► Deploy automático: qa.nexo.local
    │         │      │
    │         │      ├──► staging (PR) ─────► Deploy automático: staging.nexo.local
    │         │      │         │
    │         │      │         ├──► main (PR + Aprovação) ─────► Deploy manual: prod.nexo.local + g3developer.online
    │         │      │         │
    └─────────┴──────┴─────────┘
```

---

## 📊 Mapeamento Branch → Ambiente

| Branch    | Namespace    | URLs                                                 | Deploy     | TLS/HTTPS                       |
| --------- | ------------ | ---------------------------------------------------- | ---------- | ------------------------------- |
| `develop` | nexo-local   | develop.nexo.local<br>develop.api.nexo.local         | Automático | Não (HTTP local)                |
| `qa`      | nexo-qa      | qa.nexo.local<br>qa.api.nexo.local                   | Automático | Não (HTTP local)                |
| `staging` | nexo-staging | staging.nexo.local<br>staging.api.nexo.local         | Automático | Não (HTTP local)                |
| `main`    | nexo-prod    | prod.nexo.local<br>**g3developer.online** (produção) | Manual     | Sim (Let's Encrypt em produção) |

---

## 🎯 Quando Usar Cada Branch

### 🔧 `feature/*` ou `fix/*`

- **Propósito:** Desenvolvimento de novas funcionalidades ou correções
- **Base:** Sempre criar a partir de `develop`
- **Merge:** PR para `develop` após conclusão
- **Exemplo:**
  ```bash
  git checkout develop
  git pull
  git checkout -b feature/nova-api
  # ... desenvolver ...
  git push -u origin feature/nova-api
  # Abrir PR para develop
  ```

### 🚀 `develop`

- **Propósito:** Integração contínua de features
- **Ambiente:** develop.nexo.local (cloudlab local)
- **Deploy:** Automático via GitHub Actions
- **Testes:** Integração, funcionalidade
- **Quando usar:** Desenvolvimento ativo, testes rápidos

### 🧪 `qa`

- **Propósito:** Testes de qualidade intensivos
- **Ambiente:** qa.nexo.local (cloudlab local)
- **Deploy:** Automático após PR de develop
- **Testes:** QA completo, testes E2E, validação de bugs
- **Quando usar:** Após features estabilizadas em develop

### 🎭 `staging`

- **Propósito:** Homologação final, mirror de produção
- **Ambiente:** staging.nexo.local (cloudlab local)
- **Deploy:** Automático após PR de qa
- **Testes:** UAT (User Acceptance Testing), performance, smoke tests
- **Quando usar:** Validação final antes de produção

### 🌐 `main`

- **Propósito:** Código em produção
- **Ambiente:** g3developer.online (produção real) + prod.nexo.local (cloudlab)
- **Deploy:** Manual com aprovação obrigatória
- **Testes:** Smoke tests em produção, monitoramento
- **Quando usar:** Releases oficiais (tags v1.0.0)

---

## ⚙️ Configuração ArgoCD

Após criar as branches, configure os ApplicationSets no ArgoCD:

### Arquivo: `local/argocd/applicationsets/nexo-apps.yaml`

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: nexo-apps
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - env: develop
            branch: develop
            namespace: nexo-local
          - env: qa
            branch: qa
            namespace: nexo-qa
          - env: staging
            branch: staging
            namespace: nexo-staging
          - env: prod
            branch: main
            namespace: nexo-prod

  template:
    metadata:
      name: "nexo-{{env}}"
    spec:
      project: nexo
      source:
        repoURL: https://github.com/seu-usuario/nexo.git
        targetRevision: "{{branch}}"
        path: local/helm
      destination:
        server: https://kubernetes.default.svc
        namespace: "{{namespace}}"
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

---

## 🔒 Branch Protection Rules

Configure no GitHub (`Settings > Branches`):

### Para `develop`, `qa`, `staging`:

```
✅ Require pull request before merging
✅ Require approvals (1)
✅ Require status checks to pass before merging
   - CI (tests)
   - CI (lint)
   - CI (security-scan)
✅ Require branches to be up to date
✅ Require conversation resolution before merging
```

### Para `main` (produção):

```
✅ Require pull request before merging
✅ Require approvals (2+)
✅ Require status checks to pass before merging
   - CI (tests)
   - CI (lint)
   - CI (security-scan)
✅ Require branches to be up to date
✅ Require conversation resolution before merging
✅ Include administrators
✅ Require review from Code Owners
```

---

## 🔄 Workflow de Release

### Release para QA

```bash
git checkout develop
git pull
# Garantir que develop está estável
git checkout qa
git merge develop
git push
# ArgoCD deploys automaticamente para qa.nexo.local
```

### Release para Staging

```bash
git checkout qa
git pull
# Garantir que QA passou em todos os testes
git checkout staging
git merge qa
git push
# ArgoCD deploys automaticamente para staging.nexo.local
```

### Release para Produção

```bash
git checkout staging
git pull
# Garantir que staging está 100% validado

# Criar tag de versão
git tag -a v1.0.0 -m "Release v1.0.0"

# Merge para main
git checkout main
git merge staging
git push
git push --tags

# GitHub Actions aguarda aprovação manual
# Após aprovação: Deploy para g3developer.online
```

---

## 📝 Convenção de Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: nova funcionalidade
fix: correção de bug
docs: alterações na documentação
style: formatação, ponto e vírgula, etc
refactor: refatoração de código
test: adição ou correção de testes
chore: atualização de build, configs, etc
perf: melhorias de performance
ci: mudanças no CI/CD
```

**Exemplos:**

```bash
git commit -m "feat: adicionar endpoint de listagem de usuários"
git commit -m "fix: corrigir erro 500 ao criar propriedade"
git commit -m "docs: atualizar README com novas instruções"
git commit -m "chore: atualizar versão do NestJS para 11.1.0"
```

---

## 🚨 Hotfix Flow

Para correções urgentes em produção:

```bash
# Criar hotfix a partir de main
git checkout main
git pull
git checkout -b hotfix/corrigir-erro-critico

# Fazer correção
# ... código ...

# Commit e push
git commit -m "fix: corrigir erro crítico de autenticação"
git push -u origin hotfix/corrigir-erro-critico

# Abrir PRs para:
# 1. main (produção) - aprovação rápida
# 2. staging
# 3. qa
# 4. develop

# Após merge em main:
git checkout main
git pull
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push --tags
```

---

## 📊 Status Atual

### Branches Existentes

```bash
git branch -a
```

Você deve ver:

```
* develop
  main
  remotes/origin/develop
  remotes/origin/main
```

### Após Criação das Novas Branches

```
* develop
  qa
  staging
  main
  remotes/origin/develop
  remotes/origin/qa
  remotes/origin/staging
  remotes/origin/main
```

---

## ✅ Checklist de Setup

- [ ] Criar branch `qa` a partir de `develop`
- [ ] Criar branch `staging` a partir de `develop`
- [ ] Configurar branch protection rules no GitHub
- [ ] Criar namespaces no cloudlab:
  ```bash
  kubectl create namespace nexo-qa
  kubectl create namespace nexo-staging
  ```
- [ ] Atualizar ArgoCD ApplicationSet com novos ambientes
- [ ] Atualizar `/etc/hosts` com URLs de qa e staging (já automático via script)
- [ ] Testar deploy em cada ambiente
- [ ] Documentar processo para equipe

---

## 🎓 Referências

- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ArgoCD ApplicationSets](https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/)

---

**Próximo passo:** Execute os comandos acima para criar `qa` e `staging` branches! 🚀
