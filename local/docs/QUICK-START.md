# 🚀 Nexo CloudLab - Guia Rápido de Uso

## ⚡ 3 Comandos Principais

```bash
make setup    # Criar ambiente completo (10-15 min)
make status   # Ver status de tudo
make destroy  # Destruir ambiente
```

---

## 🏁 Primeiro Uso (Setup)

### 1. Instalar Dependências (uma vez)

```bash
# macOS
brew install k3d kubectl helm k9s docker

# Verificar
k3d version && kubectl version --client && helm version
```

### 2. Criar CloudLab Completo

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo
make setup
```

**Aguarde ~10-15 minutos.** O script cria:

- ✅ Cluster k3d (7 nodes)
- ✅ ArgoCD
- ✅ Prometheus + Grafana
- ✅ 4 ambientes (develop, qa, staging, prod)
- ✅ 12 aplicações
- ✅ 16 domínios no /etc/hosts

### 3. Verificar Status

```bash
make status
```

---

## 🌐 URLs Principais

**Ferramentas:**

- 🎯 **ArgoCD:** http://argocd.nexo.local (admin / senha no status)
- 📊 **Grafana:** http://grafana.nexo.local (admin / nexo@local2026)
- 🔍 **Prometheus:** http://prometheus.nexo.local
- 🚨 **AlertManager:** http://alertmanager.nexo.local

**Aplicações Develop:**

- 🖥️ **Backend:** http://develop-be.nexo.local
- 🌐 **Frontend:** http://develop-fe.nexo.local
- 🔐 **Auth:** http://develop-auth.nexo.local

**Outros ambientes:**

- QA: `qa-*.nexo.local`
- Staging: `staging-*.nexo.local`
- Prod: `*.nexo.local` (sem prefixo)

---

## 📊 Comandos de Status

### Ver Tudo

```bash
make status
```

### Ver Pods de um Ambiente

```bash
# Develop
kubectl get pods -n nexo-develop

# QA
kubectl get pods -n nexo-qa

# Staging
kubectl get pods -n nexo-staging

# Prod
kubectl get pods -n nexo-prod

# Todos os ambientes
kubectl get pods --all-namespaces | grep nexo
```

### Ver Aplicações ArgoCD

```bash
kubectl get applications -n argocd
```

### Ver Logs de um Pod

```bash
# Listar pods
kubectl get pods -n nexo-develop

# Ver logs (substitua <pod-name>)
kubectl logs -f <pod-name> -n nexo-develop

# Exemplo:
kubectl logs -f nexo-be-7d8f9b5c4-xk2l9 -n nexo-develop
```

---

## 🔧 Operações Comuns

### Reiniciar um Pod

```bash
kubectl delete pod <pod-name> -n <namespace>
# ArgoCD recria automaticamente
```

### Forçar Sync ArgoCD

```bash
# Via kubectl (exemplo para nexo-be develop)
kubectl patch application nexo-be-develop -n argocd \
  --type merge \
  --patch '{"operation":{"initiatedBy":{"username":"admin"},"sync":{}}}'

# Ou via UI ArgoCD
# http://argocd.nexo.local → selecionar app → SYNC
```

### Escalar Aplicação

```bash
# Exemplo: 3 réplicas do backend em develop
kubectl scale deployment nexo-be -n nexo-develop --replicas=3

# Nota: ArgoCD pode reverter se Helm chart tem valor diferente
```

### Ver Recursos de um Namespace

```bash
kubectl get all -n nexo-develop
```

---

## 🐛 Troubleshooting Rápido

### Apps com Status "Degraded"

**Causa:** ImagePullBackOff (imagens privadas)

**Solução:**

```bash
# Opção 1: Criar token GitHub
# Ir em: https://github.com/settings/tokens/new?scopes=read:packages
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"
bash local/scripts/create-ghcr-secrets.sh $GITHUB_TOKEN

# Opção 2: Tornar packages públicos
# Acessar: https://github.com/geraldobl58?tab=packages
# Mudar visibilidade para "Public"
```

### Dashboard do Grafana Não Aparece

**Aguarde 2-3 minutos e atualize a página (Ctrl+F5)**

Verificar:

```bash
kubectl get pods -n monitoring | grep grafana
kubectl logs -n monitoring deployment/kube-prometheus-stack-grafana -f
```

### ArgoCD Não Sincroniza

```bash
# Ver detalhes da aplicação
kubectl describe application nexo-be-develop -n argocd

# Ver logs do ArgoCD Server
kubectl logs -n argocd deployment/argocd-server -f

# Forçar refresh
kubectl patch application nexo-be-develop -n argocd \
  --type merge \
  --patch '{"operation":{"initiatedBy":{"username":"admin"},"sync":{}}}'
```

### Cluster Não Responde

```bash
# Verificar se cluster existe
k3d cluster list

# Reiniciar cluster
k3d cluster stop nexo-local
k3d cluster start nexo-local

# Ou destruir e recriar
make destroy
make setup
```

---

## 🧹 Limpeza

### Destruir Ambiente Completamente

```bash
make destroy
```

**Confirme com:** `yes`

**Remove:**

- Cluster k3d
- Entradas do /etc/hosts
- Contexto do kubeconfig
- Opcionalmente: volumes persistentes

**NÃO remove:**

- Código fonte
- Configurações do projeto
- Imagens Docker em cache

---

## 🔍 Explorar com k9s

k9s é uma interface TUI (Text User Interface) para Kubernetes:

```bash
k9s
```

**Atalhos úteis:**

- `:pods` - Ver pods
- `:services` - Ver services
- `:deployments` - Ver deployments
- `:namespaces` - Ver namespaces
- `/` - Filtrar
- `l` - Ver logs do pod selecionado
- `d` - Deletar recurso
- `s` - Abrir shell no pod
- `?` - Ajuda completa
- `:q` - Sair

**Filtrar por namespace:**

```bash
k9s -n nexo-develop
```

---

## 📝 Fluxo de Desenvolvimento

### 1. Fazer Mudança no Código

```bash
# Editar código em apps/nexo-be, apps/nexo-fe, etc.
vim apps/nexo-be/src/app.module.ts
```

### 2. Commitar e Fazer Push

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin develop
```

### 3. CI/CD Automático

- GitHub Actions roda testes
- Build da imagem Docker
- Push para ghcr.io
- ArgoCD detecta mudança
- Deploy automático no ambiente develop

### 4. Verificar Deploy

```bash
# Via make status
make status

# Ou verificar ArgoCD
open http://argocd.nexo.local

# Ou ver logs
kubectl logs -f deployment/nexo-be -n nexo-develop
```

---

## 🎯 Comandos Kubernetes Úteis

### Pods

```bash
# Listar pods
kubectl get pods -n nexo-develop

# Descrever pod
kubectl describe pod <pod-name> -n nexo-develop

# Entrar no pod
kubectl exec -it <pod-name> -n nexo-develop -- /bin/sh

# Ver logs
kubectl logs -f <pod-name> -n nexo-develop

# Ver logs de container específico
kubectl logs -f <pod-name> -c <container-name> -n nexo-develop
```

### Services

```bash
# Listar services
kubectl get svc -n nexo-develop

# Port-forward para acessar service localmente
kubectl port-forward svc/nexo-be 8080:3000 -n nexo-develop
# Acessar em: http://localhost:8080
```

### Deployments

```bash
# Listar deployments
kubectl get deployments -n nexo-develop

# Escalar deployment
kubectl scale deployment nexo-be --replicas=3 -n nexo-develop

# Ver histórico de rollout
kubectl rollout history deployment/nexo-be -n nexo-develop

# Rollback para versão anterior
kubectl rollout undo deployment/nexo-be -n nexo-develop
```

### Ingress

```bash
# Listar ingress
kubectl get ingress -n nexo-develop

# Ver detalhes
kubectl describe ingress nexo-be -n nexo-develop
```

### Secrets

```bash
# Listar secrets
kubectl get secrets -n nexo-develop

# Ver secret (base64 encoded)
kubectl get secret <secret-name> -n nexo-develop -o yaml

# Decodificar secret
kubectl get secret <secret-name> -n nexo-develop -o jsonpath='{.data.password}' | base64 -d
```

### ConfigMaps

```bash
# Listar configmaps
kubectl get configmaps -n nexo-develop

# Ver configmap
kubectl describe configmap <configmap-name> -n nexo-develop
```

---

## 🔐 Gerenciar Secrets do GitHub Registry

### Criar Secret (uma vez por namespace)

```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"
bash local/scripts/create-ghcr-secrets.sh $GITHUB_TOKEN
```

### Verificar Secret

```bash
# Verificar se secret existe
kubectl get secret ghcr-secret -n nexo-develop

# Ver detalhes
kubectl describe secret ghcr-secret -n nexo-develop
```

### Deletar e Recriar Secret

```bash
# Deletar secret
kubectl delete secret ghcr-secret -n nexo-develop

# Recriar
bash local/scripts/create-ghcr-secrets.sh <NOVO_TOKEN>
```

---

## 📈 Monitoramento

### Grafana

```bash
# Acessar
open http://grafana.nexo.local

# Login: admin / nexo@local2026
```

**Dashboards disponíveis:**

- Kubernetes Cluster (visão geral)
- Kubernetes Pods (detalhes de pods)
- Node Exporter (hardware)
- NGINX Ingress (HTTP traffic)

### Prometheus

```bash
# Acessar
open http://prometheus.nexo.local
```

**Queries úteis:**

```promql
# CPU usage por pod
rate(container_cpu_usage_seconds_total{namespace="nexo-develop"}[5m])

# Memory usage por pod
container_memory_usage_bytes{namespace="nexo-develop"}

# Pods em execução
kube_pod_status_phase{namespace="nexo-develop", phase="Running"}

# HTTP requests
sum(rate(http_requests_total{namespace="nexo-develop"}[5m]))
```

---

## 📚 Documentação Adicional

- **CHANGELOG.md** - Todas as mudanças recentes
- **GRAFANA-DASHBOARDS.md** - Guia completo de dashboards
- **local/docs/** - Documentação detalhada (27 arquivos)
- **README.md** - Visão geral do projeto

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

1. **Apps degradadas:** Ver seção "Troubleshooting Rápido" acima
2. **Cluster não inicia:** `make destroy && make setup`
3. **Dashboards não aparecem:** Aguardar 2-3 min e F5
4. **ArgoCD não sincroniza:** Forçar sync manual

### Comandos de Diagnóstico

```bash
# Status completo
make status

# Ver todos os recursos
kubectl get all --all-namespaces

# Ver eventos do cluster
kubectl get events --all-namespaces --sort-by='.lastTimestamp'

# Ver logs de um recurso com problemas
kubectl logs -f <pod-name> -n <namespace>

# Descrever recurso detalhadamente
kubectl describe pod <pod-name> -n <namespace>
```

---

## 🎓 Dicas Finais

1. **Use k9s** para explorar o cluster visualmente
2. **Execute `make status`** regularmente para ver o estado
3. **Verifique ArgoCD** http://argocd.nexo.local para ver deploys
4. **Monitore Grafana** http://grafana.nexo.local para métricas
5. **Leia os logs** quando algo não funciona: `kubectl logs -f <pod>`
6. **Documente mudanças** que fizer no cluster
7. **Faça backup** antes de mudanças grandes: `kubectl get all --all-namespaces -o yaml > backup.yaml`

---

**Última atualização:** 17 de fevereiro de 2026  
**Versão CloudLab:** 2.0.0  
**Cluster:** k3d (nexo-local)
