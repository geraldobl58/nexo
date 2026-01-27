# 🏠 Ambientes Locais K3D - Configuração Completa

Este documento descreve como configurar **múltiplos ambientes** no cluster K3D local, espelhando os ambientes de produção.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Ambientes](#arquitetura-de-ambientes)
3. [URLs Locais](#urls-locais)
4. [Configuração do /etc/hosts](#configuração-do-etchosts)
5. [Namespaces](#namespaces)
6. [Configuração por Ambiente](#configuração-por-ambiente)
7. [Secrets Locais](#secrets-locais)

---

## Visão Geral

O ambiente local K3D simula **4 ambientes** que espelham produção:

| Ambiente    | Branch    | Namespace      | Domínio Base           |
| ----------- | --------- | -------------- | ---------------------- |
| **dev**     | `develop` | `nexo-dev`     | `*.dev.nexo.local`     |
| **qa**      | `qa`      | `nexo-qa`      | `*.qa.nexo.local`      |
| **staging** | `staging` | `nexo-staging` | `*.staging.nexo.local` |
| **prod**    | `main`    | `nexo-prod`    | `*.nexo.local`         |

---

## Arquitetura de Ambientes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    K3D Cluster (nexo-local)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     NGINX Ingress Controller                        │ │
│  │                    (LoadBalancer: 80/443)                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│           │              │              │              │                 │
│           ▼              ▼              ▼              ▼                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │   nexo-dev   │ │   nexo-qa    │ │ nexo-staging │ │  nexo-prod   │   │
│  │  (develop)   │ │     (qa)     │ │  (staging)   │ │    (main)    │   │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤   │
│  │ nexo-be      │ │ nexo-be      │ │ nexo-be      │ │ nexo-be      │   │
│  │ nexo-fe      │ │ nexo-fe      │ │ nexo-fe      │ │ nexo-fe      │   │
│  │ nexo-auth    │ │ nexo-auth    │ │ nexo-auth    │ │ nexo-auth    │   │
│  │ postgres     │ │ postgres     │ │ postgres     │ │ postgres     │   │
│  │ redis        │ │ redis        │ │ redis        │ │ redis        │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Compartilhados                                  │ │
│  │  argocd (30080) │ grafana (30030) │ prometheus (30090)             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## URLs Locais

### Ambiente DEV (develop)

| Serviço  | URL                        | Descrição      |
| -------- | -------------------------- | -------------- |
| Frontend | http://dev.nexo.local      | Next.js App    |
| API      | http://api.dev.nexo.local  | NestJS Backend |
| Auth     | http://auth.dev.nexo.local | Keycloak       |
| Postgres | localhost:5432             | Database (dev) |
| Redis    | localhost:6379             | Cache (dev)    |

### Ambiente QA (qa)

| Serviço  | URL                       | Descrição      |
| -------- | ------------------------- | -------------- |
| Frontend | http://qa.nexo.local      | Next.js App    |
| API      | http://api.qa.nexo.local  | NestJS Backend |
| Auth     | http://auth.qa.nexo.local | Keycloak       |
| Postgres | localhost:5433            | Database (qa)  |
| Redis    | localhost:6380            | Cache (qa)     |

### Ambiente STAGING (staging)

| Serviço  | URL                            | Descrição          |
| -------- | ------------------------------ | ------------------ |
| Frontend | http://staging.nexo.local      | Next.js App        |
| API      | http://api.staging.nexo.local  | NestJS Backend     |
| Auth     | http://auth.staging.nexo.local | Keycloak           |
| Postgres | localhost:5434                 | Database (staging) |
| Redis    | localhost:6381                 | Cache (staging)    |

### Ambiente PROD (main)

| Serviço  | URL                    | Descrição       |
| -------- | ---------------------- | --------------- |
| Frontend | http://nexo.local      | Next.js App     |
| API      | http://api.nexo.local  | NestJS Backend  |
| Auth     | http://auth.nexo.local | Keycloak        |
| Postgres | localhost:5435         | Database (prod) |
| Redis    | localhost:6382         | Cache (prod)    |

### Serviços Compartilhados

| Serviço      | URL                    | Descrição            |
| ------------ | ---------------------- | -------------------- |
| ArgoCD       | http://localhost:30080 | GitOps Dashboard     |
| Grafana      | http://localhost:30030 | Monitoring Dashboard |
| Prometheus   | http://localhost:30090 | Metrics              |
| Alertmanager | http://localhost:30093 | Alertas              |

---

## Configuração do /etc/hosts

Adicione as seguintes entradas no seu `/etc/hosts`:

```bash
# Editar /etc/hosts
sudo nano /etc/hosts
```

Adicione:

```
# Nexo Platform - Ambiente Local K3D
# ==================================

# DEV (develop)
127.0.0.1   dev.nexo.local
127.0.0.1   api.dev.nexo.local
127.0.0.1   auth.dev.nexo.local

# QA
127.0.0.1   qa.nexo.local
127.0.0.1   api.qa.nexo.local
127.0.0.1   auth.qa.nexo.local

# STAGING
127.0.0.1   staging.nexo.local
127.0.0.1   api.staging.nexo.local
127.0.0.1   auth.staging.nexo.local

# PROD (main)
127.0.0.1   nexo.local
127.0.0.1   api.nexo.local
127.0.0.1   auth.nexo.local
```

### Script Automático

```bash
# Adicionar entradas automaticamente
cd local/
make setup-hosts
```

---

## Namespaces

Criar os namespaces para cada ambiente:

```bash
# Criar todos os namespaces
kubectl create namespace nexo-dev
kubectl create namespace nexo-qa
kubectl create namespace nexo-staging
kubectl create namespace nexo-prod
kubectl create namespace argocd
kubectl create namespace monitoring
```

### Listar Namespaces

```bash
kubectl get namespaces | grep nexo
```

---

## Configuração por Ambiente

### DEV (develop)

**Namespace:** `nexo-dev`

**ConfigMap:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nexo-config
  namespace: nexo-dev
data:
  NODE_ENV: development
  LOG_LEVEL: debug
  API_URL: http://api.dev.nexo.local
  AUTH_URL: http://auth.dev.nexo.local
  FRONTEND_URL: http://dev.nexo.local
```

**Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nexo-secrets
  namespace: nexo-dev
type: Opaque
stringData:
  DATABASE_URL: postgresql://nexo:nexo123@postgres:5432/nexo_dev
  JWT_SECRET: dev-jwt-secret-change-in-production
  KEYCLOAK_CLIENT_SECRET: dev-keycloak-secret
  REDIS_URL: redis://redis:6379
```

### QA

**Namespace:** `nexo-qa`

**ConfigMap:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nexo-config
  namespace: nexo-qa
data:
  NODE_ENV: qa
  LOG_LEVEL: debug
  API_URL: http://api.qa.nexo.local
  AUTH_URL: http://auth.qa.nexo.local
  FRONTEND_URL: http://qa.nexo.local
```

**Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nexo-secrets
  namespace: nexo-qa
type: Opaque
stringData:
  DATABASE_URL: postgresql://nexo:nexo123@postgres:5432/nexo_qa
  JWT_SECRET: qa-jwt-secret-change-in-production
  KEYCLOAK_CLIENT_SECRET: qa-keycloak-secret
  REDIS_URL: redis://redis:6379
```

### STAGING

**Namespace:** `nexo-staging`

**ConfigMap:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nexo-config
  namespace: nexo-staging
data:
  NODE_ENV: staging
  LOG_LEVEL: info
  API_URL: http://api.staging.nexo.local
  AUTH_URL: http://auth.staging.nexo.local
  FRONTEND_URL: http://staging.nexo.local
```

**Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nexo-secrets
  namespace: nexo-staging
type: Opaque
stringData:
  DATABASE_URL: postgresql://nexo:nexo123@postgres:5432/nexo_staging
  JWT_SECRET: staging-jwt-secret-change-in-production
  KEYCLOAK_CLIENT_SECRET: staging-keycloak-secret
  REDIS_URL: redis://redis:6379
```

### PROD (main)

**Namespace:** `nexo-prod`

**ConfigMap:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nexo-config
  namespace: nexo-prod
data:
  NODE_ENV: production
  LOG_LEVEL: warn
  API_URL: http://api.nexo.local
  AUTH_URL: http://auth.nexo.local
  FRONTEND_URL: http://nexo.local
```

**Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nexo-secrets
  namespace: nexo-prod
type: Opaque
stringData:
  DATABASE_URL: postgresql://nexo:nexo123@postgres:5432/nexo_prod
  JWT_SECRET: prod-jwt-secret-change-in-production
  KEYCLOAK_CLIENT_SECRET: prod-keycloak-secret
  REDIS_URL: redis://redis:6379
```

---

## Secrets Locais

### Criar Secrets via Makefile

```bash
cd local/

# Criar secrets para todos os ambientes
make secrets-dev
make secrets-qa
make secrets-staging
make secrets-prod

# Ou todos de uma vez
make secrets-all
```

### Registry Secret (GHCR)

Para cada namespace, criar o secret do registry:

```bash
# DEV
kubectl create secret docker-registry ghcr-registry \
  --docker-server=nexo-registry.localhost:5111 \
  --docker-username=unused \
  --docker-password=unused \
  --namespace=nexo-dev

# QA
kubectl create secret docker-registry ghcr-registry \
  --docker-server=nexo-registry.localhost:5111 \
  --docker-username=unused \
  --docker-password=unused \
  --namespace=nexo-qa

# STAGING
kubectl create secret docker-registry ghcr-registry \
  --docker-server=nexo-registry.localhost:5111 \
  --docker-username=unused \
  --docker-password=unused \
  --namespace=nexo-staging

# PROD
kubectl create secret docker-registry ghcr-registry \
  --docker-server=nexo-registry.localhost:5111 \
  --docker-username=unused \
  --docker-password=unused \
  --namespace=nexo-prod
```

---

## Ingress por Ambiente

### DEV Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nexo-ingress
  namespace: nexo-dev
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  ingressClassName: nginx
  rules:
    - host: dev.nexo.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nexo-fe
                port:
                  number: 3000
    - host: api.dev.nexo.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nexo-be
                port:
                  number: 3001
    - host: auth.dev.nexo.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nexo-auth
                port:
                  number: 8080
```

---

## Comandos Úteis

```bash
cd local/

# Ver pods de um ambiente específico
kubectl get pods -n nexo-dev
kubectl get pods -n nexo-qa
kubectl get pods -n nexo-staging
kubectl get pods -n nexo-prod

# Ver logs de um serviço específico
kubectl logs -n nexo-dev -l app=nexo-be -f

# Port-forward para database específico
kubectl port-forward -n nexo-dev svc/postgres 5432:5432

# Aplicar configs de um ambiente
kubectl apply -f k8s/dev/
kubectl apply -f k8s/qa/
kubectl apply -f k8s/staging/
kubectl apply -f k8s/prod/
```

---

## Próximos Passos

1. [Setup Inicial](./README.md) - Criar cluster K3D
2. [ArgoCD Apps](./argocd.md) - Configurar GitOps
3. [Observabilidade](./observability.md) - Prometheus + Grafana
