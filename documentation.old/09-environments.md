# 09 — Ambientes

> Os 2 ambientes da plataforma Nexo (lab): branches, domínios, namespaces e promoção de código.

---

## Visão Geral

| Ambiente    | Branch    | Namespace      | Domínio Frontend             | Domínio API                      | Domínio Auth                      | Auto Sync |
| ----------- | --------- | -------------- | ---------------------------- | -------------------------------- | --------------------------------- | --------- |
| **develop** | `develop` | `nexo-develop` | `develop.g3developer.online` | `develop.api.g3developer.online` | `develop.auth.g3developer.online` | ✅        |
| **prod**    | `main`    | `nexo-prod`    | `app.g3developer.online`     | `api.g3developer.online`         | `auth.g3developer.online`         | ❌ Manual |

> **Nota:** Este é um ambiente de laboratório/estudo com recursos mínimos (3 nodes × 1vCPU/2GB).
> QA e staging foram removidos para economizar recursos. Podem ser reativados futuramente
> adicionando entries no ApplicationSet e criando os values files correspondentes.

---

## Propósito de Cada Ambiente

### develop

- **Pra quem:** Desenvolvedores
- **Objetivo:** Validar código recém-commitado
- **Deploy:** Automático a cada push em `develop`
- **Dados:** Pode ser destruído/recriado livremente
- **Swagger:** Habilitado
- **Logs:** Level `debug`
- **Réplicas:** 1 por serviço
- **Keycloak:** Modo `start-dev` (hot-reload de themes)

### prod

- **Pra quem:** Usuários finais / demonstração
- **Objetivo:** Ambiente de produção (deploy manual)
- **Deploy:** Manual (ArgoCD sync manual + PR aprovado)
- **Dados:** Produção
- **Swagger:** Desabilitado
- **Logs:** Level `warn`
- **Réplicas:** 1 por serviço (lab)
- **PDB:** minAvailable 1

---

## Promoção de Código

O código flui de `develop` até `prod` através de PR:

```
feature/xyz
    │
    ▼ (PR → merge)
develop  ────── CI/CD ──────►  nexo-develop  (auto-deploy)
    │
    ▼ (PR + aprovação)
main     ────── CI/CD ──────►  nexo-prod     (manual sync)
```

### Comandos de Promoção

```bash
# develop → prod (via PR no GitHub)
# 1. Criar PR: develop → main
# 2. Revisão e aprovação
# 3. Merge
# 4. Sync manual no ArgoCD
```

> **Dica:** Para adicionar ambientes intermediários (qa, staging), basta
> adicionar entries no ApplicationSet (`infra/argocd/applicationsets/nexo-apps.yaml`)
> e criar os values files correspondentes (`values-qa.yaml`, `values-staging.yaml`).

---

## Isolamento por Namespace

Cada ambiente é isolado em seu próprio namespace Kubernetes:

```yaml
# Namespaces ativos
apiVersion: v1
kind: Namespace
metadata:
  name: nexo-develop
  labels:
    name: nexo
    environment: develop
---
apiVersion: v1
kind: Namespace
metadata:
  name: nexo-prod
  labels:
    name: nexo
    environment: prod
```

### O que cada namespace contém

```
nexo-<env>/
├── Deployment: nexo-be-<env>
├── Deployment: nexo-fe-<env>
├── Deployment: nexo-auth-<env>
├── Service: nexo-be-<env>
├── Service: nexo-fe-<env>
├── Service: nexo-auth-<env>
├── Ingress: nexo-be-<env>
├── Ingress: nexo-fe-<env>
├── Ingress: nexo-auth-<env>
├── Secret: nexo-db-secret
├── Secret: nexo-auth-db-secret
├── Secret: nexo-auth-admin-secret
└── Secret: ghcr-secret
```

---

## Banco de Dados

Todos os ambientes compartilham o **mesmo cluster DO Managed Database**, mas usam **bancos separados**:

```
DO Managed PostgreSQL
├── nexo_app        ← Usado por nexo-be (todos os ambientes)
└── nexo_keycloak   ← Usado por nexo-auth (todos os ambientes)
```

> ⚠ **Para produção real**, considere criar bancos separados por ambiente (`nexo_app_prod`, `nexo_app_dev`, etc.) ou clusters de banco separados.

---

## TLS por Ambiente

> **Nota:** TLS é gerenciado automaticamente via cert-manager + Let's Encrypt (`letsencrypt-prod` ClusterIssuer).
> Todos os ambientes usam HTTPS com certificados gerados automaticamente para `*.g3developer.online`.

---

## Comunicação Inter-Serviço

Dentro de cada namespace, os serviços se comunicam via **service names** internos (nunca pelo domínio externo):

```
nexo-fe → nexo-be:  http://nexo-be-<env>:3000  (via API_URL)
nexo-be → nexo-auth: http://nexo-auth-<env>:8080 (via KEYCLOAK_INTERNAL_URL)
```

O frontend client-side (browser) usa os domínios externos:

```
Browser → nexo-fe:  https://develop.g3developer.online
Browser → nexo-be:  https://develop.api.g3developer.online  (via NEXT_PUBLIC_API_URL)
Browser → nexo-auth: https://develop.auth.g3developer.online (via NEXT_PUBLIC_KEYCLOAK_URL)
```

---

## Recursos por Ambiente (Lab)

> Recursos mínimos para ambiente de laboratório (3 nodes × 1vCPU / 2GB RAM).

### CPU e Memória

| Serviço               | develop      | prod         |
| --------------------- | ------------ | ------------ |
| **nexo-be** request   | 50m / 128Mi  | 50m / 128Mi  |
| **nexo-be** limit     | 250m / 256Mi | 250m / 256Mi |
| **nexo-fe** request   | 50m / 128Mi  | 50m / 128Mi  |
| **nexo-fe** limit     | 250m / 256Mi | 250m / 256Mi |
| **nexo-auth** request | 50m / 384Mi  | 50m / 384Mi  |
| **nexo-auth** limit   | 300m / 768Mi | 300m / 768Mi |

### Autoscaling

| Config | develop | prod |
| ------ | ------- | ---- |
| HPA    | ❌      | ❌   |
| PDB    | ❌      | ✅   |

> Para produção real com mais nodes, aumente os recursos e habilite HPA.

---

## Adicionando Ambientes (QA, Staging)

Se futuramente quiser adicionar ambientes intermediários:

1. Adicione entries no ApplicationSet (`infra/argocd/applicationsets/nexo-apps.yaml`):
   ```yaml
   - env: qa
     namespace: nexo-qa
     branch: qa
   ```
2. Crie um ArgoCD project em `infra/argocd/projects/nexo-environments.yaml`
3. Crie os values files: `values-qa.yaml` em cada chart Helm
4. Crie os secrets no namespace: `kubectl create namespace nexo-qa` + secrets
5. Fluxo de branches: `develop → qa → staging → main`

---

## Próximo Passo

→ [10 — Observabilidade](10-observability.md)
