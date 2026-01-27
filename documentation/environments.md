# 🌍 Ambientes (Environments)

Este documento descreve as diferenças entre cada ambiente de deploy.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Develop](#develop)
3. [QA](#qa)
4. [Staging](#staging)
5. [Production](#production)
6. [Comparativo](#comparativo)
7. [Variáveis por Ambiente](#variáveis-por-ambiente)
8. [Resource Limits](#resource-limits)
9. [Fluxo de Promoção](#fluxo-de-promoção)

---

## Visão Geral

Todos os ambientes rodam no **mesmo cluster Kubernetes (DOKS)**, separados por **namespaces**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOKS CLUSTER (nexo-cluster)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │  nexo-develop   │  │    nexo-qa      │  │  nexo-staging   │            │
│   │   (namespace)   │  │   (namespace)   │  │   (namespace)   │            │
│   │                 │  │                 │  │                 │            │
│   │  ┌───┐ ┌───┐   │  │  ┌───┐ ┌───┐   │  │  ┌───┐ ┌───┐   │            │
│   │  │BE │ │FE │   │  │  │BE │ │FE │   │  │  │BE │ │FE │   │            │
│   │  └───┘ └───┘   │  │  └───┘ └───┘   │  │  └───┘ └───┘   │            │
│   │  ┌───┐ ┌───┐   │  │  ┌───┐ ┌───┐   │  │  ┌───┐ ┌───┐   │            │
│   │  │DB │ │KC │   │  │  │DB │ │KC │   │  │  │DB │ │KC │   │            │
│   │  └───┘ └───┘   │  │  └───┘ └───┘   │  │  └───┘ └───┘   │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │                    nexo-production                          │          │
│   │                      (namespace)                            │          │
│   │                                                             │          │
│   │   ┌───┐ ┌───┐ ┌───┐    ┌───┐ ┌───┐ ┌───┐                  │          │
│   │   │BE │ │BE │ │BE │    │FE │ │FE │ │FE │                  │          │
│   │   └───┘ └───┘ └───┘    └───┘ └───┘ └───┘                  │          │
│   │   ┌────────┐  ┌───┐  ┌───────────┐                         │          │
│   │   │  DB    │  │KC │  │  Redis    │                         │          │
│   │   │ (PVC)  │  └───┘  └───────────┘                         │          │
│   │   └────────┘                                                │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Develop

### Propósito

Ambiente de **integração contínua** para desenvolvedores testarem features antes de promoção.

### Características

| Aspecto       | Configuração       |
| ------------- | ------------------ |
| **Branch**    | `develop`          |
| **Namespace** | `nexo-develop`     |
| **URL**       | `dev.nexo.io`      |
| **Deploy**    | Automático após CI |
| **Aprovação** | Não                |
| **Réplicas**  | 1 por serviço      |
| **HPA**       | Desabilitado       |
| **Debug**     | Habilitado         |
| **Swagger**   | Habilitado         |
| **Logs**      | Debug level        |

### Valores Helm

```yaml
# values-dev.yaml
replicaCount: 1

autoscaling:
  enabled: false

resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

env:
  NODE_ENV: development
  LOG_LEVEL: debug
  SWAGGER_ENABLED: "true"
```

### Quando Usar

- ✅ Testar features em ambiente real
- ✅ Integração com outros serviços
- ✅ Debugging de problemas
- ❌ Testes de carga
- ❌ Demonstrações para clientes

---

## QA

### Propósito

Ambiente de **Quality Assurance** para testes manuais e automatizados.

### Características

| Aspecto       | Configuração          |
| ------------- | --------------------- |
| **Branch**    | `qa`                  |
| **Namespace** | `nexo-qa`             |
| **URL**       | `qa.nexo.io`          |
| **Deploy**    | Automático após merge |
| **Aprovação** | Não                   |
| **Réplicas**  | 1-2 por serviço       |
| **HPA**       | Básico                |
| **Debug**     | Info level            |
| **Swagger**   | Habilitado            |
| **Logs**      | Info level            |

### Valores Helm

```yaml
# values-qa.yaml
replicaCount: 1

autoscaling:
  enabled: true
  minReplicas: 1
  maxReplicas: 2
  targetCPUUtilizationPercentage: 80

resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

env:
  NODE_ENV: qa
  LOG_LEVEL: info
  SWAGGER_ENABLED: "true"
```

### Quando Usar

- ✅ Testes de aceitação (QA team)
- ✅ Testes automatizados E2E
- ✅ Validação de bugs corrigidos
- ✅ Testes de regressão
- ❌ Testes de carga
- ❌ Ambiente de produção

---

## Staging

### Propósito

Ambiente de **pré-produção**, idêntico à produção para validação final.

### Características

| Aspecto       | Configuração      |
| ------------- | ----------------- |
| **Branch**    | `staging`         |
| **Namespace** | `nexo-staging`    |
| **URL**       | `staging.nexo.io` |
| **Deploy**    | Automático        |
| **Aprovação** | Não               |
| **Réplicas**  | 2 por serviço     |
| **HPA**       | Habilitado        |
| **Debug**     | Desabilitado      |
| **Swagger**   | Desabilitado      |
| **Logs**      | Warn level        |

### Valores Helm

```yaml
# values-staging.yaml
replicaCount: 2

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 4
  targetCPUUtilizationPercentage: 70

resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi

env:
  NODE_ENV: staging
  LOG_LEVEL: warn
  SWAGGER_ENABLED: "false"
```

### Quando Usar

- ✅ Validação final antes de produção
- ✅ Testes de performance
- ✅ Demonstrações para stakeholders
- ✅ Treinamento de usuários
- ❌ Desenvolvimento ativo
- ❌ Dados de produção

---

## Production

### Propósito

Ambiente de **produção** com dados reais e usuários.

### Características

| Aspecto       | Configuração      |
| ------------- | ----------------- |
| **Branch**    | `main`            |
| **Namespace** | `nexo-production` |
| **URL**       | `nexo.io`         |
| **Deploy**    | Manual            |
| **Aprovação** | 2 reviewers       |
| **Réplicas**  | 3+ por serviço    |
| **HPA**       | Agressivo         |
| **Debug**     | Desabilitado      |
| **Swagger**   | Desabilitado      |
| **Logs**      | Error level       |

### Valores Helm

```yaml
# values-prod.yaml
replicaCount: 3

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 2Gi

podDisruptionBudget:
  enabled: true
  minAvailable: 2

affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app.kubernetes.io/name: nexo-be
        topologyKey: kubernetes.io/hostname

env:
  NODE_ENV: production
  LOG_LEVEL: error
  SWAGGER_ENABLED: "false"
```

### Quando Usar

- ✅ Usuários reais
- ✅ Dados de produção
- ⚠️ Mudanças apenas com aprovação
- ⚠️ Rollback preparado

---

## Comparativo

### Tabela Resumo

| Aspecto            | Develop   | QA    | Staging   | Production   |
| ------------------ | --------- | ----- | --------- | ------------ |
| **Branch**         | `develop` | `qa`  | `staging` | `main`       |
| **Deploy**         | Auto      | Auto  | Auto      | Manual       |
| **Aprovação**      | ❌        | ❌    | ❌        | ✅ 2 pessoas |
| **Réplicas**       | 1         | 1-2   | 2-4       | 3-10         |
| **CPU Request**    | 100m      | 100m  | 250m      | 500m         |
| **Memory Request** | 256Mi     | 256Mi | 512Mi     | 1Gi          |
| **HPA**            | ❌        | ✅    | ✅        | ✅ Agressivo |
| **PDB**            | ❌        | ❌    | ✅        | ✅           |
| **Swagger**        | ✅        | ✅    | ❌        | ❌           |
| **Debug**          | ✅        | Info  | ❌        | ❌           |
| **Log Level**      | debug     | info  | warn      | error        |

### Resource Quotas por Namespace

```yaml
# nexo-develop
resources:
  requests.cpu: "2"
  requests.memory: "4Gi"
  limits.cpu: "4"
  limits.memory: "8Gi"

# nexo-qa
resources:
  requests.cpu: "2"
  requests.memory: "4Gi"
  limits.cpu: "4"
  limits.memory: "8Gi"

# nexo-staging
resources:
  requests.cpu: "4"
  requests.memory: "8Gi"
  limits.cpu: "8"
  limits.memory: "16Gi"

# nexo-production
resources:
  requests.cpu: "8"
  requests.memory: "16Gi"
  limits.cpu: "16"
  limits.memory: "32Gi"
```

---

## Variáveis por Ambiente

### Backend (nexo-be)

| Variável          | Develop                    | QA                    | Staging                      | Production                    |
| ----------------- | -------------------------- | --------------------- | ---------------------------- | ----------------------------- |
| `NODE_ENV`        | development                | qa                    | staging                      | production                    |
| `LOG_LEVEL`       | debug                      | info                  | warn                         | error                         |
| `SWAGGER_ENABLED` | true                       | true                  | false                        | false                         |
| `DATABASE_URL`    | postgres://...nexo_develop | postgres://...nexo_qa | postgres://...nexo_staging   | postgres://...nexo_production |
| `REDIS_URL`       | redis://redis:6379/0       | redis://redis:6379/1  | redis://redis:6379/2         | redis://redis:6379/3          |
| `KEYCLOAK_URL`    | http://keycloak:8080       | http://keycloak:8080  | https://auth.staging.nexo.io | https://auth.nexo.io          |

### Frontend (nexo-fe)

| Variável              | Develop               | QA                     | Staging                     | Production          |
| --------------------- | --------------------- | ---------------------- | --------------------------- | ------------------- |
| `NEXT_PUBLIC_API_URL` | http://localhost:3001 | https://api.qa.nexo.io | https://api.staging.nexo.io | https://api.nexo.io |
| `NEXT_PUBLIC_ENV`     | development           | qa                     | staging                     | production          |
| `NEXTAUTH_URL`        | http://localhost:3000 | https://qa.nexo.io     | https://staging.nexo.io     | https://nexo.io     |

---

## Resource Limits

### Por que definir limits?

1. **Previsibilidade**: Evita que um pod consuma todos os recursos do node
2. **Fair scheduling**: Kubernetes distribui pods de forma justa
3. **Custo**: Evita escalar nodes desnecessariamente
4. **Estabilidade**: Previne OOM kills cascading

### Recomendações por Serviço

#### nexo-be (NestJS)

```yaml
# Develop/QA
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

# Production
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 2Gi
```

#### nexo-fe (Next.js)

```yaml
# Develop/QA
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

# Production
resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi
```

#### nexo-auth (Keycloak)

```yaml
# Develop/QA
resources:
  requests:
    cpu: 200m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi

# Production
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 2Gi
```

#### PostgreSQL

```yaml
# Develop/QA
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

# Production
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 2Gi
```

---

## Fluxo de Promoção

### Diagrama

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  feature/*  │────►│   develop   │────►│     qa      │────►│   staging   │
│             │ PR  │             │ PR  │             │ PR  │             │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                                                                    │ PR + Approval
                                                                    ▼
                                                           ┌─────────────┐
                                                           │    main     │
                                                           │ (production)│
                                                           └─────────────┘
```

### Passos para Promoção

#### 1. feature/\* → develop

```bash
# Criar PR no GitHub
# Após aprovação e merge, deploy automático em nexo-develop
```

#### 2. develop → qa

```bash
# Criar PR: develop → qa
# Após merge, deploy automático em nexo-qa
```

#### 3. qa → staging

```bash
# Criar PR: qa → staging
# Após merge, deploy automático em nexo-staging
```

#### 4. staging → main (production)

```bash
# Criar PR: staging → main
# Requer 2 aprovações
# Após merge, CD aguarda aprovação no GitHub Environment
# Aprovar manualmente no GitHub Actions
```

### Rollback

```bash
# Via ArgoCD
argocd app rollback nexo-be-prod

# Via Helm
helm rollback nexo-be 1 -n nexo-production

# Via kubectl
kubectl rollout undo deployment/nexo-be -n nexo-production
```

---

## Próximos Passos

1. Configure os [GitHub Secrets](github-secrets.md) para cada ambiente
2. Revise o [Kubernetes](kubernetes.md) para detalhes de manifests
3. Consulte o [Troubleshooting](troubleshooting.md) se tiver problemas
