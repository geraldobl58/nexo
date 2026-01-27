# ☸️ Kubernetes (DOKS)

Guia para deploy e gerenciamento no DigitalOcean Kubernetes (DOKS).

## 🌊 DigitalOcean Kubernetes (DOKS)

O Nexo Platform roda em produção no **DOKS - DigitalOcean Kubernetes Service**.

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│          DigitalOcean Load Balancer (External)              │
│                     (nexo.com)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              NGINX Ingress Controller                       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ nexo-fe │ │ nexo-be │ │nexo-auth│
   │(Next.js)│ │(NestJS) │ │Keycloak │
   └─────────┘ └────┬────┘ └─────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │PostgreSQL│ │  Redis  │ │ Managed │
   │ Managed  │ │ Managed │ │Services │
   │    DB    │ │  Cache  │ │  (DO)   │
   └─────────┘ └─────────┘ └─────────┘
```

## 🔧 Estrutura dos Manifests

```
infra/
├── helm/                        # Helm Charts
│   ├── nexo-fe/
│   │   ├── Chart.yaml
│   │   ├── values.yaml          # Base values
│   │   ├── values-dev.yaml      # DEV overrides
│   │   ├── values-qa.yaml       # QA overrides
│   │   ├── values-staging.yaml  # STAGING overrides
│   │   ├── values-prod.yaml     # PROD overrides
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── ingress.yaml
│   │       ├── hpa.yaml
│   │       └── configmap.yaml
│   │
│   ├── nexo-be/
│   └── nexo-auth/
│
├── k8s/                         # Kustomize (fallback)
│   ├── base/
│   └── overlays/
│       ├── dev/
│       ├── qa/
│       ├── staging/
│       └── prod/
│
└── argocd/                      # ArgoCD GitOps
    ├── projects/                # AppProjects
    ├── applications/            # Applications
    └── applicationsets/         # ApplicationSets
```

## 🚀 Deploy via GitOps (ArgoCD)

### Como funciona

```
1. Developer faz push → GitHub
2. GitHub Actions builda imagem → GitHub Container Registry (GHCR)
3. GitHub Actions atualiza Helm values no Git
4. ArgoCD detecta mudança no Git
5. ArgoCD sincroniza com DOKS cluster
6. Pods são atualizados automaticamente
```

### Acessar ArgoCD

```bash
# URL: https://argocd.yourdomain.com
# User: admin
# Password: (definido nos secrets do GitHub)
```

### Sincronizar Aplicação

```bash
# Via CLI (se configurado)
argocd app sync nexo-be-develop

# Via UI
# Vá em Applications → nexo-be-develop → SYNC
```

## 📦 Ambientes e Namespaces

| Ambiente | Namespace       | Branch    | ArgoCD Auto-Sync |
| -------- | --------------- | --------- | ---------------- |
| DEV      | nexo-develop    | `develop` | ✅ Automático    |
| QA       | nexo-qa         | `qa`      | ✅ Automático    |
| STAGING  | nexo-staging    | `staging` | ❌ Manual        |
| PROD     | nexo-production | `main`    | ❌ Manual        |

## 🔍 Comandos Úteis

### Configurar kubectl para DOKS

```bash
# 1. Instalar doctl (DigitalOcean CLI)
brew install doctl  # macOS
# ou: snap install doctl  # Linux

# 2. Autenticar
doctl auth init

# 3. Baixar kubeconfig
doctl kubernetes cluster kubeconfig save <cluster-name>

# 4. Verificar conexão
kubectl get nodes
```

### Básicos

```bash
# Listar pods em DEV
kubectl get pods -n nexo-develop

# Listar todos os recursos em QA
kubectl get all -n nexo-qa

# Logs do backend em PROD
kubectl logs -f -l app.kubernetes.io/name=nexo-be -n nexo-production --tail=100

# Descrever pod (ver eventos)
kubectl describe pod <pod-name> -n nexo-develop
```

### Debug

```bash
# Shell no pod
kubectl exec -it <pod-name> -n nexo-develop -- sh

# Port-forward para teste local
kubectl port-forward svc/nexo-be 3001:3000 -n nexo-develop

# Ver eventos recentes
kubectl get events -n nexo-develop --sort-by='.lastTimestamp' | head -20

# Ver logs de um pod específico
kubectl logs <pod-name> -n nexo-develop --previous  # logs do container anterior
```

### Scaling

```bash
# Scale manual
kubectl scale deployment/nexo-be --replicas=5 -n nexo-production

# Ver HPA (Horizontal Pod Autoscaler)
kubectl get hpa -n nexo-production

# Detalhes do autoscaling
kubectl describe hpa nexo-be -n nexo-production

# Ver métricas de recursos
kubectl top pods -n nexo-production
kubectl top nodes
```

### Rollout

```bash
# Status do deploy
kubectl rollout status deployment/nexo-be -n nexo-production

# Histórico de deploys
kubectl rollout history deployment/nexo-be -n nexo-production

# Rollback para versão anterior
kubectl rollout undo deployment/nexo-be -n nexo-production

# Rollback para revisão específica
kubectl rollout undo deployment/nexo-be --to-revision=3 -n nexo-production

# Restart pods (sem trocar imagem)
kubectl rollout restart deployment/nexo-be -n nexo-production
```

## 🛡️ Componentes Kubernetes

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexo-be
  namespace: nexo-production
  labels:
    app.kubernetes.io/name: nexo-be
    app.kubernetes.io/version: "1.0.0"
spec:
  replicas: 3
  selector:
    matchLabels:
      app.kubernetes.io/name: nexo-be
  template:
    metadata:
      labels:
        app.kubernetes.io/name: nexo-be
    spec:
      containers:
        - name: nexo-be
          image: ghcr.io/geraldobl58/nexo-be:v1.0.0
          ports:
            - containerPort: 3000
              name: http
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: nexo-secrets
                  key: database-url
            - name: NODE_ENV
              value: "production"
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nexo-be
  namespace: nexo-production
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: nexo-be
  ports:
    - port: 3000
      targetPort: 3000
      name: http
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nexo-ingress
  namespace: nexo-production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - nexo.com
        - api.nexo.com
      secretName: nexo-tls
  rules:
    - host: api.nexo.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nexo-be
                port:
                  number: 3000
    - host: nexo.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nexo-fe
                port:
                  number: 3000
```

### HorizontalPodAutoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nexo-be-hpa
  namespace: nexo-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nexo-be
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## 🐛 Troubleshooting

### Pod em CrashLoopBackOff

```bash
# 1. Ver logs do crash anterior
kubectl logs <pod-name> -n nexo-develop --previous

# 2. Descrever pod para ver eventos
kubectl describe pod <pod-name> -n nexo-develop

# 3. Verificar resources
kubectl top pod <pod-name> -n nexo-develop

# 4. Verificar secrets/configmaps
kubectl get secret nexo-secrets -n nexo-develop
kubectl get configmap nexo-config -n nexo-develop
```

### Pod em Pending

```bash
# Verificar eventos
kubectl describe pod <pod-name> -n nexo-develop

# Causas comuns:
# - Insufficient CPU/Memory (aumentar limites)
# - PVC não bound (verificar storage)
# - Node selector não encontrado (remover ou corrigir)
```

### Service não acessível

```bash
# Verificar endpoints
kubectl get endpoints nexo-be -n nexo-develop

# Se vazio, pods não estão passando readiness probe
kubectl get pods -l app.kubernetes.io/name=nexo-be -n nexo-develop

# Testar DNS interno
kubectl run -it --rm debug --image=busybox -n nexo-develop -- \
  nslookup nexo-be.nexo-develop.svc.cluster.local

# Testar conectividade
kubectl run -it --rm debug --image=curlimages/curl -n nexo-develop -- \
  curl http://nexo-be:3000/health
```

### Ingress não funciona

```bash
# Verificar ingress controller
kubectl get pods -n ingress-nginx

# Ver logs do controller
kubectl logs -f -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx

# Testar regras do ingress
kubectl describe ingress nexo-ingress -n nexo-production

# Verificar certificado TLS
kubectl get certificate -n nexo-production
kubectl describe certificate nexo-tls -n nexo-production
```

## 📊 Monitoramento

### DigitalOcean Insights

```bash
# Ver métricas no dashboard
# https://cloud.digitalocean.com/kubernetes/clusters/<cluster-id>/insights
```

### kubectl top

```bash
# Uso de recursos por pod
kubectl top pods -n nexo-production

# Uso de recursos por node
kubectl top nodes

# Ordenar por CPU
kubectl top pods -n nexo-production --sort-by=cpu

# Ordenar por memória
kubectl top pods -n nexo-production --sort-by=memory
```

## 🔒 Boas Práticas

### 1. Resources

Sempre defina `requests` e `limits`:

```yaml
resources:
  requests:
    memory: "256Mi" # Garantido - usado para scheduling
    cpu: "100m" # Garantido - usado para scheduling
  limits:
    memory: "512Mi" # Máximo - pod é killed se exceder
    cpu: "500m" # Máximo - throttled se exceder
```

### 2. Health Checks

Configure sempre `livenessProbe` e `readinessProbe`:

```yaml
livenessProbe: # Reinicia pod se falhar
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3

readinessProbe: # Remove do load balancer se falhar
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

### 3. Labels Consistentes

Use labels padronizados:

```yaml
labels:
  app.kubernetes.io/name: nexo-be
  app.kubernetes.io/version: "1.0.0"
  app.kubernetes.io/component: backend
  app.kubernetes.io/part-of: nexo-platform
  app.kubernetes.io/managed-by: argocd
```

### 4. Segurança

```yaml
# SecurityContext no pod
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

# SecurityContext no container
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

### 5. PodDisruptionBudget

Proteja contra interrupções:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: nexo-be-pdb
spec:
  minAvailable: 2 # Mínimo de 2 pods sempre disponíveis
  selector:
    matchLabels:
      app.kubernetes.io/name: nexo-be
```

## 🔗 Recursos

- [DigitalOcean Kubernetes Docs](https://docs.digitalocean.com/products/kubernetes/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Helm Charts](https://helm.sh/docs/topics/charts/)
- [ArgoCD Docs](https://argo-cd.readthedocs.io/)

## 🎯 Próximos Passos

- 🚀 [Deploy Guide](deploy.md) - CI/CD completo
- 🏗️ [Architecture](architecture.md) - Visão técnica do sistema
- 🔐 [GitHub Actions](github-actions.md) - Pipelines de CI/CD
- 🌊 [DigitalOcean Setup](digitalocean-setup.md) - Configuração inicial
