# 08 — ArgoCD & GitOps

> Como o ArgoCD gerencia os deploys via GitOps.

---

## Visão Geral

O ArgoCD implementa o padrão **GitOps**: o estado desejado do cluster está definido no Git, e o ArgoCD sincroniza continuamente o cluster para refletir esse estado.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  GitHub      │     │  ArgoCD      │     │  DOKS        │
│  Actions     │────▶│              │────▶│  Cluster     │
│              │     │  Observa Git │     │              │
│ Atualiza     │     │  Sincroniza  │     │ Aplica       │
│ values-*.yaml│     │  cluster     │     │ manifests    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Fluxo Completo

1. Developer faz push para `develop`
2. GitHub Actions roda CI (lint, test, build)
3. Pipeline builda imagem Docker e faz push para GHCR
4. Pipeline atualiza `infra/helm/nexo-*/values-develop.yaml` com nova tag
5. Pipeline faz commit com `[skip ci]`
6. ArgoCD detecta mudança no repositório Git (~3 minutos)
7. ArgoCD renderiza Helm chart com novos values
8. ArgoCD aplica os manifests no cluster
9. Kubernetes faz rolling update dos pods

---

## Arquitetura ArgoCD

### ApplicationSet (Matrix Generator)

O Nexo usa **um único ApplicationSet** que gera **12 aplicações** (3 serviços × 4 ambientes):

```yaml
# infra/argocd/applicationsets/nexo-apps.yaml
generators:
  - matrix:
      generators:
        # Eixo 1: Ambientes (lab: develop + prod)
        - list:
            elements:
              - env: develop    branch: develop   namespace: nexo-develop

        # Eixo 2: Serviços
        - list:
            elements:
              - service: nexo-be
              - service: nexo-fe
              - service: nexo-auth
```

### Aplicações Geradas

| Aplicação           | Namespace    | Branch  | Sync Policy |
| ------------------- | ------------ | ------- | ----------- |
| `nexo-be-develop`   | nexo-develop | develop | Auto        |
| `nexo-fe-develop`   | nexo-develop | develop | Auto        |
| `nexo-auth-develop` | nexo-develop | develop | Auto        |
| `nexo-be-prod`      | nexo-prod    | main    | **Manual**  |
| `nexo-fe-prod`      | nexo-prod    | main    | **Manual**  |
| `nexo-auth-prod`    | nexo-prod    | main    | **Manual**  |

> **Nota:** Ambientes adicionais (QA, staging) podem ser adicionados futuramente no ApplicationSet. Veja [09 — Ambientes](09-environments.md#adicionando-ambientes-qa-staging).

### Sync Policies

```yaml
# develop → Auto sync
syncPolicy:
  automated:
    prune: true       # Remove recursos que não existem mais no Git
    selfHeal: true     # Reverte mudanças manuais no cluster
  retry:
    limit: 3
    backoff:
      duration: 5s
      factor: 2
      maxDuration: 3m

# prod → Manual sync (sem automated)
syncPolicy:
  retry:
    limit: 3
    backoff:
      duration: 5s
      factor: 2
      maxDuration: 3m
```

> **Segurança Prod:** O sync manual garante que deploys em produção requerem ação consciente. Isso complementa a branch protection do `main` e o required reviewer do environment `prod` no GitHub.

---

## Projects

Cada ambiente tem seu próprio `AppProject` para isolamento de segurança:

```yaml
# infra/argocd/projects/nexo-environments.yaml
# 2 projetos: nexo-develop, nexo-prod

spec:
  sourceRepos:
    - "https://github.com/geraldobl58/nexo.git"
  destinations:
    - namespace: nexo-<env>
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ""
      kind: Namespace
```

**Restrições:**

- Cada projeto só pode deployar no **seu namespace**
- Só aceita fonte do **repositório nexo**
- Só pode criar **Namespaces** como cluster-level resources

---

## Acessar ArgoCD

### Via Port Forward

```bash
kubectl port-forward svc/argocd-server -n argocd 8443:443
# Acessar https://localhost:8443
```

### Credenciais

```bash
# Usuário: admin
# Senha:
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""
```

### Via ArgoCD CLI

```bash
# Login
argocd login localhost:8443 --username admin --password <senha> --insecure

# Listar aplicações
argocd app list

# Status de uma aplicação
argocd app get nexo-be-develop

# Sync manual (necessário para prod)
argocd app sync nexo-be-prod

# Sync forçado
argocd app sync nexo-be-develop --force

# Refresh (re-ler Git sem sync)
argocd app get nexo-be-develop --refresh
```

---

## Fluxo de Deploy por Ambiente

### develop (Automático)

```
1. Push para branch develop
2. Pipeline roda CI
3. Pipeline builda e pusha imagem
4. Pipeline atualiza values-<env>.yaml (image.tag)
5. Pipeline commita com [skip ci]
6. ArgoCD detecta mudança (polling ~3min)
7. ArgoCD renderiza Helm → aplica no cluster
8. Rolling update dos pods
```

### prod (Manual)

```
1. PR de develop → main (requer aprovação)
2. Merge aprovado
3. Pipeline roda CI
4. Pipeline builda e pusha imagem
5. Pipeline atualiza values-prod.yaml
6. Pipeline commita com [skip ci]
7. ArgoCD detecta mudança mas NÃO sincroniza
8. Operador acessa ArgoCD UI/CLI
9. Revisa diff dos manifests
10. Clica "Sync" manualmente
11. Rolling update dos pods
```

---

## Troubleshooting ArgoCD

### Aplicação "OutOfSync"

```bash
# Ver diferenças
argocd app diff nexo-be-develop

# Forçar sync
argocd app sync nexo-be-develop
```

### Aplicação "Unknown"

```bash
# Refresh forcado
argocd app get nexo-be-develop --refresh --hard-refresh

# Se persistir, pode ser problema de conexão com o repo
argocd repo list
```

### Aplicação "Degraded"

```bash
# Ver eventos dos pods
kubectl get events -n nexo-develop --sort-by='.lastTimestamp'
kubectl describe pod -l app.kubernetes.io/name=nexo-be -n nexo-develop
```

### "ComparisonError"

```bash
# Geralmente problema de cache do repo-server
kubectl rollout restart deployment argocd-repo-server -n argocd
```

### Rollback

```bash
# Listar histórico de sync
argocd app history nexo-be-prod

# Rollback para revisão anterior
argocd app rollback nexo-be-prod <REVISION_NUMBER>

# Ou: reverter o commit no Git (preferível no GitOps)
git revert <commit-sha>
git push origin main
```

---

## Configurações Avançadas

### Preservar Recursos ao Deletar App

```yaml
syncPolicy:
  preserveResourcesOnDeletion: true
```

Garante que deletar a Application no ArgoCD **não** deleta os pods/services no cluster. Útil para evitar downtime acidental.

### Ignorar Diferenças

Para campos que o Kubernetes modifica automaticamente (ex: `metadata.managedFields`):

```yaml
ignoreDifferences:
  - group: apps
    kind: Deployment
    jsonPointers:
      - /spec/replicas # Ignorar se HPA estiver gerenciando
```

### Notificações ArgoCD (Opcional)

O ArgoCD suporta notificações nativas (Slack, Discord, etc.) via `argocd-notifications`. Atualmente, as notificações são feitas pela pipeline GitHub Actions via Discord webhook.

---

## Diagrama: Git como Single Source of Truth

```
┌─────────────────────────────────────────────────────┐
│                  GitHub Repository                   │
│                                                      │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │ apps/           │  │ infra/helm/              │  │
│  │   nexo-be/      │  │   nexo-be/values-*.yaml  │  │
│  │   nexo-fe/      │  │   nexo-fe/values-*.yaml  │  │
│  │   nexo-auth/    │  │   nexo-auth/values-*.yaml│  │
│  │                 │  │                          │  │
│  │ (código-fonte)  │  │ (estado do cluster)      │  │
│  └────────┬────────┘  └──────────┬───────────────┘  │
│           │                      │                   │
│           │    Pipeline CI       │                   │
│           │    Build+Push        │    Pipeline CD    │
│           │    imagens GHCR      │    Update tags    │
│           └──────────────────────┘                   │
│                                  │                   │
└──────────────────────────────────┼───────────────────┘
                                   │
                            ArgoCD sync
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │    DOKS Cluster           │
                    │    (estado real)          │
                    └──────────────────────────┘
```

---

## Próximo Passo

→ [09 — Ambientes](09-environments.md)
