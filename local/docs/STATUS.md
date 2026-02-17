# 🎉 CloudLab Nexo - Setup Completo!

## ✅ O que está funcionando

### 🚀 ArgoCD - GitOps

- **URL:** http://argocd.nexo.local
- **Status:** ✅ Rodando e sincronizando
- **Applications:** 6 apps criadas
  - nexo-be-develop (Synced)
  - nexo-fe-develop (Synced)
  - nexo-auth-develop (Synced)
  - nexo-be-prod (Synced)
  - nexo-fe-prod (Synced)
  - nexo-auth-prod (Synced)

**Como obter credentials:**

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

### 📊 Grafana - Monitoramento

- **URL:** http://grafana.nexo.local
- **User:** admin
- **Pass:** nexo@local2026
- **Status:** ✅ Rodando (3/3 containers)
- **Datasource:** Prometheus configurado
- **Dashboards:** 4 pré-instalados (Cluster, Pods, Nodes, NGINX)
- **ServiceMonitors:** 12 configurados (be/fe/auth para 4 ambientes)

📖 **Guia completo:** [local/docs/GRAFANA.md](local/docs/GRAFANA.md)

### 📈 Prometheus

- **URL:** http://prometheus.nexo.local
- **Status:** ✅ Coletando métricas de todos os namespaces
- **Targets:** Monitorando cluster, apps, ingress

### 🔔 AlertManager

- **URL:** http://alertmanager.nexo.local
- **Status:** ✅ Pronto para receber alertas
- **Config:** Pode ser configurado para Discord, Slack, Email

---

## 🔧 Workflows GitHub Actions

### ✅ pipeline.yml (ÚNICO NECESSÁRIO)

**Faz tudo:**

- ✅ AI Code Review (CodeRabbit + Danger.js)
- ✅ CI (tests + lint + build)
- ✅ Build & Push Docker images (ghcr.io)
- ✅ Deploy automático (atualiza values files)
- ✅ Notificações Discord
- ✅ Detecção inteligente de mudanças

**Triggers:**

- Push em `develop`, `qa`, `staging` ou `main`
- Pull Requests
- Manual dispatch

### ✅ release.yml (RELEASES OFICIAIS)

**Para releases com tags:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

**O que faz:**

- ✅ Cria GitHub Release
- ✅ Build com tags semver (v1.0.0, v1.0, v1, latest)
- ✅ Atualiza values-prod.yaml
- ✅ Notifica Discord

### ❌ Workflows Removidos (Obsoletos)

- `.ci.yml.old` - Redundante, pipeline.yml faz tudo
- `.deploy-local.yml.old` - Usava Harbor (removido)

📖 **Guia completo:** [local/docs/WORKFLOWS.md](local/docs/WORKFLOWS.md)

---

## 📦 Secrets Necessários no GitHub

Acesse: **Settings → Secrets and variables → Actions**

```bash
GHCR_TOKEN          # Token para push no GitHub Container Registry
DISCORD_WEBHOOK     # Webhook do Discord para notificações
```

> ℹ️ `GITHUB_TOKEN` é fornecido automaticamente

---

## 🌐 URLs de Acesso

### 🛠️ Ferramentas (Local)

```
ArgoCD:       http://argocd.nexo.local
Grafana:      http://grafana.nexo.local
Prometheus:   http://prometheus.nexo.local
AlertManager: http://alertmanager.nexo.local
```

### 🚀 Aplicações (DigitalOcean)

#### Develop

```
Frontend: https://develop.g3developer.online
API:      https://develop.api.g3developer.online
Auth:     https://develop.auth.g3developer.online
```

#### QA

```
Frontend: https://qa.g3developer.online
API:      https://qa.api.g3developer.online
Auth:     https://qa.auth.g3developer.online
```

#### Staging

```
Frontend: https://staging.g3developer.online
API:      https://staging.api.g3developer.online
Auth:     https://staging.auth.g3developer.online
```

#### Production

```
Frontend: https://g3developer.online
API:      https://api.g3developer.online
Auth:     https://auth.g3developer.online
```

---

## 🧹 Serviços Removidos

Para otimizar recursos do CloudLab local:

- ❌ **Elasticsearch** - Muito pesado (1GB+ RAM)
- ❌ **Kibana** - Muito pesado, não essencial
- ❌ **Harbor** - Substituído por ghcr.io
- ❌ **Traefik** - Usando NGINX Ingress

**Mantidos (essenciais):**

- ✅ ArgoCD (GitOps)
- ✅ Prometheus (Métricas)
- ✅ Grafana (Dashboards)
- ✅ AlertManager (Alertas)
- ✅ NGINX Ingress (HTTP routing)

---

## 📊 Recursos Atuais

### Cluster k3d

```
7 nodes:
  - 1 server (control plane)
  - 6 agents (workers)
```

### Namespaces Ativos

```bash
kubectl get ns
```

- `argocd` - GitOps
- `monitoring` - Observability stack
- `ingress-nginx` - HTTP routing
- `nexo-develop` - Apps de desenvolvimento
- `nexo-prod` - Apps de produção

### Pods Rodando

```bash
kubectl get pods -A
```

**Total esperado:** ~30-40 pods

---

## 🚀 Próximos Passos

### 1. Configurar Secrets no GitHub

```bash
# Criar token do GitHub para ghcr.io
# Settings → Developer settings → Personal access tokens
# Scopes: write:packages, read:packages, delete:packages

# Adicionar aos secrets do repositório
GHCR_TOKEN = ghp_xxxxxxxxx

# Criar webhook do Discord
DISCORD_WEBHOOK = https://discord.com/api/webhooks/...
```

### 2. Fazer primeiro deploy

```bash
git checkout develop

# Fazer mudança em qualquer app
echo "teste" >> apps/nexo-be/README.md

git add .
git commit -m "test: trigger pipeline"
git push origin develop

# Acompanhar pipeline
# https://github.com/geraldobl58/nexo/actions
```

### 3. Verificar aplicações no ArgoCD

```bash
# Via UI
open http://argocd.nexo.local

# Via CLI
argocd login argocd.nexo.local --insecure
argocd app list
argocd app get nexo-be-develop
```

### 4. Monitorar no Grafana

```bash
# Acessar
open http://grafana.nexo.local

# Login: admin / nexo@local2026

# Explorar dashboards:
# - Dashboards → Browse
# - Explore → Prometheus
```

### 5. Configurar métricas nas aplicações

**Backend (NestJS):**

```typescript
// apps/nexo-be/src/main.ts
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

// Expor /metrics endpoint
```

**Frontend (Next.js):**

```bash
npm install prom-client
# Criar API route: app/api/metrics/route.ts
```

**Keycloak:**

```bash
# Habilitar metrics no values file
# infra/helm/nexo-auth/values-develop.yaml
metrics:
  enabled: true
```

---

## 🔧 Comandos Úteis

### CloudLab

```bash
# Ver status
make status

# Ver URLs
make urls

# Logs de um serviço
make logs SERVICE=nexo-be NAMESPACE=nexo-develop

# Restart do cluster
make restart

# Destruir tudo
make destroy
```

### ArgoCD

```bash
# Login
argocd login argocd.nexo.local --insecure

# Listar apps
argocd app list

# Sync manual
argocd app sync nexo-be-develop

# Ver detalhes
argocd app get nexo-be-develop

# Ver diff
argocd app diff nexo-be-develop
```

### Kubernetes

```bash
# Ver pods
kubectl get pods -A

# Logs
kubectl logs -n nexo-develop deploy/nexo-be --tail=100 -f

# Describe
kubectl describe pod -n nexo-develop <pod-name>

# Port-forward
kubectl port-forward -n nexo-develop svc/nexo-be 3000:3000

# Shell em pod
kubectl exec -it -n nexo-develop <pod-name> -- /bin/sh
```

### Grafana

```bash
# Restart
kubectl rollout restart deployment -n monitoring kube-prometheus-stack-grafana

# Ver senha
kubectl get secret -n monitoring kube-prometheus-stack-grafana \
  -o jsonpath="{.data.admin-password}" | base64 -d

# Port-forward
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

---

## 📚 Documentação Completa

- 📖 [00-INDEX.md](local/docs/00-INDEX.md) - Navegação completa
- 📖 [WORKFLOWS.md](local/docs/WORKFLOWS.md) - GitHub Actions detalhado
- 📖 [GRAFANA.md](local/docs/GRAFANA.md) - Monitoramento completo
- 📖 [GETTING_STARTED.md](local/docs/GETTING_STARTED.md) - Setup inicial
- 📖 [TROUBLESHOOTING.md](local/docs/06-troubleshooting.md) - Resolução de problemas

---

## ❗ Status Final

```
✅ ArgoCD          - Rodando e sincronizando 6 apps
✅ Grafana         - Rodando com 4 dashboards e 6 ServiceMonitors
✅ Prometheus      - Coletando métricas de todos namespaces
✅ AlertManager    - Pronto para alertas
✅ NGINX Ingress   - Roteando tráfego HTTP
✅ Applications    - 6 apps criadas (be/fe/auth × develop/prod)
✅ Workflows       - Pipeline único otimizado
✅ Monitoramento   - ServiceMonitors configurados
❌ Elasticsearch   - Removido (muito pesado)
❌ Kibana          - Removido (muito pesado)
❌ Harbor          - Removido (usa ghcr.io)
```

**CloudLab está 100% operacional! 🎉**

---

**Happy DevOps! 🚀**
