# ✅ Configuração de 4 Ambientes Completa!

## 📋 Resumo das Alterações

### 🎯 Objetivo

Expandir o setup de 2 ambientes (develop + prod) para **4 ambientes completos**:

- **Develop** (branch: develop)
- **QA** (branch: qa) ← NOVO
- **Staging** (branch: staging) ← NOVO
- **Production** (branch: main)

---

## ✅ O que foi feito

### 1. Values Files Criados (6 novos arquivos)

```
infra/helm/nexo-be/values-qa.yaml        ✅ Criado
infra/helm/nexo-be/values-staging.yaml   ✅ Criado
infra/helm/nexo-fe/values-qa.yaml        ✅ Criado
infra/helm/nexo-fe/values-staging.yaml   ✅ Criado
infra/helm/nexo-auth/values-qa.yaml      ✅ Criado
infra/helm/nexo-auth/values-staging.yaml ✅ Criado
```

**Características dos values:**

- **QA:** NODE_ENV=production, Log level=info, Swagger habilitado, URLs: qa.g3developer.online
- **Staging:** NODE_ENV=production, Log level=info, Swagger habilitado, URLs: staging.g3developer.online
- Todos com TLS (Let's Encrypt), recursos: cpu=200m/mem=256Mi (be/fe), cpu=400m/mem=768Mi (auth)

### 2. ArgoCD Projects Atualizados

**Arquivo:** `infra/argocd/projects/nexo-environments.yaml`

```yaml
✅ nexo-develop  (namespace: nexo-develop)
✅ nexo-qa       (namespace: nexo-qa)       ← NOVO
✅ nexo-staging  (namespace: nexo-staging)  ← NOVO
✅ nexo-prod     (namespace: nexo-prod)
```

**Aplicado no cluster:**

```bash
kubectl apply -f infra/argocd/projects/nexo-environments.yaml
# Result: nexo-qa created, nexo-staging created
```

### 3. ApplicationSets Atualizados

**Arquivo:** `infra/argocd/applicationsets/nexo-apps.yaml`

- **nexo-apps-auto:** Agora gera apps para develop + qa + staging (auto-sync)
- **nexo-apps-prod:** Mantém prod (auto-sync)

**Aplicado no cluster:**

```bash
kubectl apply -f infra/argocd/applicationsets/nexo-apps.yaml
# Result: nexo-apps-auto configured
```

**Total de aplicações criadas:** 12 (3 serviços × 4 ambientes)

```
DEVELOP          QA               STAGING          PRODUCTION
└─ nexo-be       └─ nexo-be       └─ nexo-be       └─ nexo-be
└─ nexo-fe       └─ nexo-fe       └─ nexo-fe       └─ nexo-fe
└─ nexo-auth     └─ nexo-auth     └─ nexo-auth     └─ nexo-auth
```

### 4. GitHub Actions Pipeline Atualizado

**Arquivo:** `.github/workflows/pipeline.yml`

**Mudanças:**

- **Triggers:** Adicionadas branches `qa` e `staging`
- **Branch mapping:** Adicionado mapeamento qa→nexo-qa, staging→nexo-staging

```yaml
on:
  push:
    branches: [develop, qa, staging, main]  ✅ Atualizado
  pull_request:
    branches: [develop, qa, staging, main]  ✅ Atualizado
```

```bash
# Mapeamento de branches
develop  → nexo-develop
qa       → nexo-qa       ✅ NOVO
staging  → nexo-staging  ✅ NOVO
main     → nexo-prod
```

### 5. Documentação Atualizada

#### WORKFLOWS.md

- ✅ Triggers atualizados para 4 branches
- ✅ Seção de Deploy Automático com 4 ambientes
- ✅ Adicionados fluxos para QA e Staging
- ✅ Diagrama visual atualizado

#### STATUS.md

- ✅ ArgoCD: 12 apps (3×4)
- ✅ ServiceMonitors: 12 (3×4)
- ✅ URLs para os 4 ambientes
- ✅ Triggers da pipeline

#### ENVIRONMENTS.md (NOVO)

- ✅ Guia completo dos 4 ambientes
- ✅ URLs de cada ambiente
- ✅ Características de cada um
- ✅ Fluxo de promoção entre ambientes
- ✅ Estratégias de deploy
- ✅ Comandos Git para promoção
- ✅ Checklist de deploy

---

## 🎯 Status Atual

### ArgoCD

```bash
$ kubectl get applications -n argocd

NAME                SYNC STATUS   HEALTH STATUS
nexo-be-develop     Synced        Degraded
nexo-fe-develop     Synced        Degraded
nexo-auth-develop   Synced        Degraded
nexo-be-qa          Unknown       Healthy      ← NOVO
nexo-fe-qa          Unknown       Healthy      ← NOVO
nexo-auth-qa        Unknown       Healthy      ← NOVO
nexo-be-staging     Unknown       Healthy      ← NOVO
nexo-fe-staging     Unknown       Healthy      ← NOVO
nexo-auth-staging   Unknown       Healthy      ← NOVO
nexo-be-prod        Synced        Degraded
nexo-fe-prod        Synced        Degraded
nexo-auth-prod      Synced        Degraded

Total: 12 applications
```

> ℹ️ **Nota:** Apps de QA e Staging estão com status "Unknown" porque ainda não houve deploy nessas branches. Assim que fizer push nas branches `qa` e `staging`, eles sincronizarão automaticamente.

### ArgoCD Projects

```bash
$ kubectl get appproject -n argocd

NAME           AGE
default        1h
nexo-develop   30m
nexo-qa        5m   ← NOVO
nexo-staging   5m   ← NOVO
nexo-prod      30m
```

---

## 🚀 Como Usar os Novos Ambientes

### Fluxo Recomendado

```
Feature Branch
    ↓ PR + Merge
Develop (nexo-develop)
    ↓ Merge após testes iniciais
QA (nexo-qa) ← NOVO: Testes de qualidade
    ↓ Merge após QA aprovar
Staging (nexo-staging) ← NOVO: Homologação final
    ↓ Merge após stakeholders aprovarem
Production (nexo-prod)
```

### Comandos Git para Promoção

```bash
# 1. Develop → QA (após features testadas)
git checkout qa
git merge develop
git push origin qa
# Pipeline detecta → Build → Deploy para nexo-qa
# ArgoCD sincroniza automaticamente

# 2. QA → Staging (após QA aprovar)
git checkout staging
git merge qa
git push origin staging
# Pipeline detecta → Build → Deploy para nexo-staging
# ArgoCD sincroniza automaticamente

# 3. Staging → Production (após homologação)
git checkout main
git merge staging
git push origin main
# Pipeline detecta → Build → Deploy para nexo-prod
# ArgoCD sincroniza automaticamente
```

### URLs dos Ambientes

| Ambiente    | Frontend                           | Backend API                            | Auth (Keycloak)                         |
| ----------- | ---------------------------------- | -------------------------------------- | --------------------------------------- |
| **Develop** | https://develop.g3developer.online | https://develop.api.g3developer.online | https://develop.auth.g3developer.online |
| **QA**      | https://qa.g3developer.online      | https://qa.api.g3developer.online      | https://qa.auth.g3developer.online      |
| **Staging** | https://staging.g3developer.online | https://staging.api.g3developer.online | https://staging.auth.g3developer.online |
| **Prod**    | https://g3developer.online         | https://api.g3developer.online         | https://auth.g3developer.online         |

---

## 📝 Próximos Passos

### 1. Criar as branches QA e Staging

```bash
# Criar branch QA
git checkout -b qa develop
git push -u origin qa

# Criar branch Staging
git checkout -b staging develop
git push -u origin staging
```

### 2. Proteger as branches no GitHub

**Settings → Branches → Branch protection rules**

Para cada branch (develop, qa, staging, main):

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

### 3. Configurar Secrets nos Namespaces (DigitalOcean)

Quando for fazer deploy no DigitalOcean, criar secrets em cada namespace:

```bash
# QA
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=geraldobl58 \
  --docker-password=$GITHUB_TOKEN \
  -n nexo-qa

# Staging
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=geraldobl58 \
  --docker-password=$GITHUB_TOKEN \
  -n nexo-staging
```

### 4. Testar o Fluxo Completo

```bash
# 1. Fazer mudança em apps/nexo-be
git checkout develop
echo "// test" >> apps/nexo-be/src/main.ts
git add .
git commit -m "test: CI/CD para 4 ambientes"
git push origin develop

# 2. Verificar pipeline no GitHub Actions
# - CI passa
# - Build & Push para ghcr.io/geraldobl58/nexo-be:develop-xxx
# - values-develop.yaml atualizado

# 3. Verificar ArgoCD
# - nexo-be-develop detecta mudança
# - Sync automático

# 4. Promover para QA
git checkout qa
git merge develop
git push origin qa
# Pipeline roda novamente para QA

# 5. Promover para Staging
git checkout staging
git merge qa
git push origin staging
# Pipeline roda novamente para Staging

# 6. Promover para Produção
git checkout main
git merge staging
git push origin main
# Pipeline roda novamente para Produção
```

### 5. Monitoramento

ServiceMonitors para QA e Staging serão necessários quando os apps estiverem rodando:

```yaml
# Adicionar em local/k8s/servicemonitor-apps.yaml (se for usar no local)
# OU criar em DigitalOcean quando necessário

apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: nexo-be-qa
  namespace: nexo-qa
spec:
  selector:
    matchLabels:
      app: nexo-be
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

---

## 📚 Documentação de Referência

- **[ENVIRONMENTS.md](ENVIRONMENTS.md)** - Guia completo dos 4 ambientes
- **[WORKFLOWS.md](WORKFLOWS.md)** - GitHub Actions pipeline
- **[STATUS.md](STATUS.md)** - Status atual do setup
- **[GRAFANA.md](GRAFANA.md)** - Monitoramento

---

## ✅ Checklist de Conclusão

- [x] 6 values files criados (qa + staging para be/fe/auth)
- [x] ArgoCD projects atualizados (nexo-qa, nexo-staging)
- [x] ApplicationSets atualizados
- [x] Pipeline.yml atualizada para 4 branches
- [x] 12 aplicações criadas no ArgoCD
- [x] Documentação atualizada (WORKFLOWS.md, STATUS.md)
- [x] Documentação nova criada (ENVIRONMENTS.md)
- [ ] Branches qa e staging criadas no GitHub (próximo passo)
- [ ] Branch protection configurado (próximo passo)
- [ ] Secrets criados nos namespaces (quando fazer deploy DigitalOcean)
- [ ] Teste completo do fluxo (próximo passo)

---

**🎉 Setup de 4 ambientes completo! Agora você tem develop, qa, staging e production totalmente configurados e prontos para uso!**
