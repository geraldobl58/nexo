# 07 — Helm Charts

> Estrutura, templates e values dos Helm charts para deploy no Kubernetes.

---

## Visão Geral

Cada serviço tem seu próprio Helm chart em `infra/helm/`:

```
infra/helm/
├── nexo-be/
│   ├── Chart.yaml
│   ├── values.yaml              # Valores default (produção)
│   ├── values-develop.yaml      # Override para develop
│   ├── values-prod.yaml         # Override para prod
│   └── templates/
│       ├── _helpers.tpl
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── hpa.yaml
│       ├── pdb.yaml
│       ├── serviceaccount.yaml
│       └── servicemonitor.yaml
│
├── nexo-fe/                     # Mesma estrutura
│   ├── Chart.yaml
│   ├── values*.yaml
│   └── templates/
│
└── nexo-auth/                   # Mesma estrutura
    ├── Chart.yaml
    ├── values*.yaml
    └── templates/
```

---

## Estratégia de Values

Cada serviço usa **dois values files** simultaneamente:

```
values.yaml          → Valores base/default (todos os ambientes)
values-<env>.yaml    → Override específico do ambiente
```

O ArgoCD aplica ambos via ApplicationSet:

```yaml
helm:
  valueFiles:
    - values.yaml
    - values-{{ env }}.yaml
```

**Precedência:** `values-<env>.yaml` sobrescreve `values.yaml`.

---

## nexo-be (Backend)

### Chart.yaml

```yaml
apiVersion: v2
name: nexo-be
description: Nexo Platform - Backend API (NestJS)
version: 1.0.0
appVersion: "1.0.0"
```

### Recursos Kubernetes Gerados

| Template              | Recurso                       | Condição                 |
| --------------------- | ----------------------------- | ------------------------ |
| `deployment.yaml`     | Deployment                    | Sempre                   |
| `service.yaml`        | Service (ClusterIP)           | Sempre                   |
| `ingress.yaml`        | Ingress (NGINX)               | `ingress.enabled`        |
| `hpa.yaml`            | HorizontalPodAutoscaler       | `autoscaling.enabled`    |
| `pdb.yaml`            | PodDisruptionBudget           | `pdb.enabled`            |
| `serviceaccount.yaml` | ServiceAccount                | `serviceAccount.create`  |
| `servicemonitor.yaml` | ServiceMonitor (desabilitado) | `serviceMonitor.enabled` |

### Deployment — Detalhes Importantes

```yaml
# Secrets de banco injetados via envFrom
envFrom:
  - secretRef:
      name: nexo-db-secret # Contém DATABASE_URL

# Image pull secret para GHCR
imagePullSecrets:
  - name: ghcr-secret

# Security context (non-root)
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
```

### Values por Ambiente

| Config                      | develop                                   | prod                              |
| --------------------------- | ----------------------------------------- | --------------------------------- |
| `replicaCount`              | 1                                         | 1                                 |
| `image.tag`                 | `develop-<sha>`                           | `main-<sha>`                      |
| `ingress.host`              | `develop.api.g3developer.online`          | `api.g3developer.online`          |
| `env.NODE_ENV`              | `development`                             | `production`                      |
| `env.SWAGGER_ENABLED`       | `"true"`                                  | `"false"`                         |
| `env.LOG_LEVEL`             | `debug`                                   | `warn`                            |
| `env.METRICS_ENABLED`       | `"true"`                                  | `"true"`                          |
| `env.KEYCLOAK_URL`          | `https://develop.auth.g3developer.online` | `https://auth.g3developer.online` |
| `autoscaling.enabled`       | `false`                                   | `false`                           |
| `resources.requests.cpu`    | `50m`                                     | `50m`                             |
| `resources.requests.memory` | `128Mi`                                   | `128Mi`                           |

---

## nexo-fe (Frontend)

### Diferenças do Backend

```yaml
# Container port
container:
  port: 3000 # Next.js standalone

# Environment
env:
  API_URL: http://nexo-be-<env>:3000 # URL interno (SSR)
  NEXT_PUBLIC_API_URL: https://<env>.api.g3developer.online # URL externo (client)
  NEXT_PUBLIC_KEYCLOAK_URL: https://<env>.auth.g3developer.online
  NEXT_PUBLIC_KEYCLOAK_REALM: nexo
  NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: nexo-web

# Liveness/Readiness
livenessProbe:
  httpGet:
    path: /
    port: 3000

# Recursos menores que o backend
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Values por Ambiente

| Config                    | develop                                  | prod                             |
| ------------------------- | ---------------------------------------- | -------------------------------- |
| `ingress.host`            | `develop.g3developer.online`             | `app.g3developer.online`         |
| `env.API_URL`             | `http://nexo-be-develop:3000`            | `http://nexo-be-prod:3000`       |
| `env.NEXT_PUBLIC_API_URL` | `https://develop.api.g3developer.online` | `https://api.g3developer.online` |

> **Nota:** `API_URL` (sem `NEXT_PUBLIC_`) é usado pelo Next.js em Server-Side Rendering e aponta para o service name interno do cluster. `NEXT_PUBLIC_API_URL` é embutido no build e usado pelo client-side JavaScript. Os domínios externos usam o formato com pontos para subdomínios multi-nível (ex: `develop.api.g3developer.online`).

---

## nexo-auth (Keycloak)

### Diferenças dos Outros Serviços

```yaml
# Container com duas portas
container:
  port: 8080 # HTTP principal
  managementPort: 9000 # Health + metrics

# Secrets de banco e admin via envFrom
envFrom:
  - secretRef:
      name: nexo-auth-db-secret # KC_DB, KC_DB_URL, KC_DB_USERNAME, KC_DB_PASSWORD
  - secretRef:
      name: nexo-auth-admin-secret # KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD

# Keycloak-specific env
env:
  KC_HEALTH_ENABLED: "true"
  KC_METRICS_ENABLED: "true"
  KC_HOSTNAME_STRICT: "false"
  KC_PROXY_HEADERS: "xforwarded"

# Health checks na porta de management
livenessProbe:
  httpGet:
    path: /health/live
    port: 9000
  initialDelaySeconds: 90 # Keycloak demora para iniciar

readinessProbe:
  httpGet:
    path: /health/ready
    port: 9000
  initialDelaySeconds: 60

# Ingress com buffer maior (Keycloak gera headers grandes)
ingress:
  annotations:
    nginx.ingress.kubernetes.io/proxy-buffer-size: "128k"

# Recursos maiores
resources:
  requests:
    cpu: 250m
    memory: 768Mi
  limits:
    cpu: 1000m
    memory: 1536Mi
```

### Values por Ambiente

| Config                | develop                           | prod                              |
| --------------------- | --------------------------------- | --------------------------------- |
| `command`             | `["start-dev"]`                   | `["start"]`                       |
| `ingress.host`        | `develop.auth.g3developer.online` | `auth.g3developer.online`         |
| `env.KC_HOSTNAME`     | —                                 | `https://auth.g3developer.online` |
| `autoscaling.enabled` | `false`                           | `false`                           |
| `replicaCount`        | 1                                 | 1                                 |

> **Nota:** Keycloak é stateful (sessões), por isso mantém 1 réplica. Para HA, seria necessário configurar distributed cache (Infinispan).

---

## Templates Compartilhados

### `_helpers.tpl`

Define helpers reutilizáveis:

```yaml
{{- define "<chart>.fullname" -}}
# Gera nome como: nexo-be-develop, nexo-fe-prod
{{- end }}

{{- define "<chart>.labels" -}}
# Labels padrão: app.kubernetes.io/name, version, managed-by
{{- end }}

{{- define "<chart>.selectorLabels" -}}
# Labels para selectors: app.kubernetes.io/name, instance
{{- end }}
```

### Ingress

Todos os charts usam a mesma estrutura de Ingress:

```yaml
annotations:
  nginx.ingress.kubernetes.io/ssl-redirect: "true"
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### HPA (Horizontal Pod Autoscaler)

```yaml
# Configurável por ambiente
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

### PDB (PodDisruptionBudget)

```yaml
pdb:
  enabled: true
  minAvailable: 1 # Pelo menos 1 pod sempre disponível
```

---

## Como a Pipeline Atualiza os Values

O stage de deploy da pipeline atualiza `image.tag` no values file:

```yaml
# Antes (values-develop.yaml)
image:
  tag: "develop-abc1234"

# Depois (pipeline atualiza com novo SHA)
image:
  tag: "develop-def5678"
```

O ArgoCD detecta a mudança no Git e sincroniza automaticamente.

---

## Desenvolvimento de Charts

### Validar Templates Localmente

```bash
# Render sem instalar
helm template nexo-be infra/helm/nexo-be/ \
  -f infra/helm/nexo-be/values.yaml \
  -f infra/helm/nexo-be/values-develop.yaml

# Validar sintaxe
helm lint infra/helm/nexo-be/

# Dry-run
helm upgrade --install nexo-be-develop infra/helm/nexo-be/ \
  -f infra/helm/nexo-be/values.yaml \
  -f infra/helm/nexo-be/values-develop.yaml \
  -n nexo-develop \
  --dry-run
```

---

## Próximo Passo

→ [08 — ArgoCD & GitOps](08-argocd-gitops.md)
