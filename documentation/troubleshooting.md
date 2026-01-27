# 🔧 Troubleshooting - Guia de Solução de Problemas

Este documento cobre os **erros mais comuns** e suas soluções.

---

## 📋 Índice

1. [Erros de CI/CD](#erros-de-cicd)
2. [Erros de ArgoCD](#erros-de-argocd)
3. [Erros de Ingress](#erros-de-ingress)
4. [Erros de Certificado TLS](#erros-de-certificado-tls)
5. [Erros de Resource Limit](#erros-de-resource-limit)
6. [Erros de Kubernetes](#erros-de-kubernetes)
7. [Erros de Database](#erros-de-database)
8. [Erros de Docker](#erros-de-docker)
9. [Comandos de Debug](#comandos-de-debug)

---

## Erros de CI/CD

### ❌ CI: "ESLint found problems"

**Sintoma**:

```
Error: ESLint found problems in your code
```

**Causa**: Código não passa no linting.

**Solução**:

```bash
# Rodar lint localmente
pnpm lint

# Corrigir automaticamente
pnpm lint --fix

# Commit e push
git add . && git commit -m "fix: lint errors" && git push
```

---

### ❌ CI: "pnpm install failed"

**Sintoma**:

```
ERR_PNPM_LOCKFILE_OUTDATED
```

**Causa**: `pnpm-lock.yaml` desatualizado.

**Solução**:

```bash
# Regenerar lockfile
pnpm install

# Commit e push
git add pnpm-lock.yaml && git commit -m "chore: update lockfile" && git push
```

---

### ❌ CI: "Docker build failed"

**Sintoma**:

```
ERROR: failed to solve: failed to compute cache key
```

**Causa**: Arquivo referenciado no Dockerfile não existe.

**Solução**:

1. Verifique se todos os arquivos estão no `.dockerignore`
2. Verifique o `COPY` no Dockerfile
3. Teste localmente:

```bash
docker build -t test -f apps/nexo-be/Dockerfile .
```

---

### ❌ CI: "Push to GHCR denied"

**Sintoma**:

```
Error: denied: permission_denied: write_package
```

**Causa**: Token sem permissão de escrita.

**Solução**:

1. Vá em **Settings → Actions → General**
2. Em "Workflow permissions", selecione:
   - ☑ **Read and write permissions**
3. Clique em **Save**

---

### ❌ CD: "ArgoCD sync failed"

**Sintoma**:

```
Error: argocd app sync failed
```

**Causa**: Problema no sync do ArgoCD.

**Solução**:

```bash
# Verificar status da aplicação
argocd app get nexo-be-dev

# Ver logs de sync
argocd app logs nexo-be-dev

# Forçar sync
argocd app sync nexo-be-dev --force

# Se persistir, verificar no ArgoCD UI
```

---

### ❌ CD: "Workflow not triggered"

**Sintoma**: Push foi feito mas workflow não executou.

**Causa**: Várias possíveis.

**Solução**:

1. Verifique se Actions está habilitado:
   - **Settings → Actions → General**
2. Verifique os paths no trigger:
   ```yaml
   paths:
     - "apps/**" # Push deve ser nesse path
   ```
3. Verifique se a branch está nos triggers:
   ```yaml
   branches:
     - main
     - develop
   ```

---

## Erros de ArgoCD

### ❌ "Application is OutOfSync"

**Sintoma**: ArgoCD mostra status `OutOfSync`.

**Causa**: Manifests no Git diferem do cluster.

**Solução**:

```bash
# Verificar diff
argocd app diff nexo-be-dev

# Sync manual
argocd app sync nexo-be-dev

# Se for intencional (HPA mudou réplicas), ignorar:
# Adicione no Application:
spec:
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas
```

---

### ❌ "Unable to get cluster server"

**Sintoma**:

```
Unable to get cluster: REST client error: cluster "https://kubernetes.default.svc" not found
```

**Causa**: Cluster não registrado no ArgoCD.

**Solução**:

```bash
# Adicionar cluster
argocd cluster add do-nyc1-nexo-cluster

# Verificar
argocd cluster list
```

---

### ❌ "Repository not accessible"

**Sintoma**:

```
Repository not accessible: authentication required
```

**Causa**: ArgoCD não tem acesso ao repositório.

**Solução**:

```bash
# Adicionar repositório
argocd repo add https://github.com/geraldobl58/nexo.git \
  --username git \
  --password $GITHUB_TOKEN

# Ou via SSH
argocd repo add git@github.com:geraldobl58/nexo.git \
  --ssh-private-key-path ~/.ssh/id_rsa
```

---

### ❌ "ComparisonError"

**Sintoma**:

```
ComparisonError: failed to compare: ...
```

**Causa**: Helm template inválido.

**Solução**:

```bash
# Testar template localmente
helm template nexo-be infra/helm/nexo-be \
  -f infra/helm/nexo-be/values-dev.yaml

# Lint o chart
helm lint infra/helm/nexo-be
```

---

## Erros de Ingress

### ❌ "502 Bad Gateway"

**Sintoma**: Ingress retorna 502.

**Causa**: Backend não está respondendo.

**Solução**:

```bash
# Verificar se pods estão rodando
kubectl get pods -n nexo-develop -l app=nexo-be

# Verificar endpoints
kubectl get endpoints nexo-be -n nexo-develop

# Verificar logs do pod
kubectl logs -f -l app=nexo-be -n nexo-develop

# Testar conectividade
kubectl run -it --rm debug --image=curlimages/curl -- \
  curl http://nexo-be.nexo-develop.svc:3000/health
```

---

### ❌ "503 Service Unavailable"

**Sintoma**: Ingress retorna 503.

**Causa**: Nenhum pod disponível.

**Solução**:

```bash
# Verificar se deployment existe
kubectl get deploy nexo-be -n nexo-develop

# Verificar eventos
kubectl describe deploy nexo-be -n nexo-develop

# Verificar se pods estão em CrashLoop
kubectl get pods -n nexo-develop
```

---

### ❌ "404 Not Found"

**Sintoma**: Ingress retorna 404.

**Causa**: Path não configurado ou host incorreto.

**Solução**:

```bash
# Verificar regras do Ingress
kubectl describe ingress nexo-ingress -n nexo-develop

# Verificar se o host está correto
curl -H "Host: dev.nexo.io" http://LOAD_BALANCER_IP/health
```

---

### ❌ "Ingress Controller not found"

**Sintoma**:

```
Error: no ingress controller found
```

**Causa**: NGINX Ingress não instalado.

**Solução**:

```bash
# Verificar se está instalado
kubectl get pods -n ingress-nginx

# Se não estiver, instalar:
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

---

## Erros de Certificado TLS

### ❌ "Certificate not ready"

**Sintoma**: Certificate mostra `Ready: False`.

**Causa**: Cert-Manager não conseguiu emitir certificado.

**Solução**:

```bash
# Verificar status do Certificate
kubectl describe certificate nexo-tls -n nexo-develop

# Verificar CertificateRequest
kubectl get certificaterequest -n nexo-develop

# Verificar Order
kubectl get order -n nexo-develop

# Verificar Challenge
kubectl describe challenge -n nexo-develop
```

---

### ❌ "ACME challenge failed"

**Sintoma**:

```
Waiting for HTTP-01 challenge propagation
```

**Causa**: Let's Encrypt não consegue acessar o challenge.

**Solução**:

1. Verifique se o DNS aponta para o Load Balancer:

```bash
dig +short dev.nexo.io
# Deve retornar o IP do Load Balancer
```

2. Verifique se o Ingress Controller está acessível:

```bash
curl -v http://dev.nexo.io/.well-known/acme-challenge/test
```

3. Verifique se a porta 80 está aberta no firewall/Load Balancer.

---

### ❌ "Rate limit exceeded"

**Sintoma**:

```
Error creating new order :: too many certificates already issued
```

**Causa**: Let's Encrypt tem limite de 50 certificados/semana/domínio.

**Solução**:

1. Use o issuer `letsencrypt-staging` para testes
2. Aguarde o rate limit expirar (1 semana)
3. Use wildcard certificate para múltiplos subdomínios

---

## Erros de Resource Limit

### ❌ "OOMKilled"

**Sintoma**: Pod reinicia com `Reason: OOMKilled`.

**Causa**: Pod excedeu o limite de memória.

**Solução**:

```bash
# Verificar uso atual
kubectl top pod -n nexo-develop

# Aumentar limit no values.yaml
resources:
  limits:
    memory: 1Gi  # Aumentar

# Aplicar mudança
helm upgrade nexo-be infra/helm/nexo-be -n nexo-develop
```

---

### ❌ "Insufficient CPU/Memory"

**Sintoma**: Pod fica em `Pending`.

**Causa**: Cluster não tem recursos suficientes.

**Solução**:

```bash
# Verificar recursos disponíveis
kubectl describe nodes | grep -A 5 "Allocated resources"

# Opções:
# 1. Reduzir requests no values.yaml
# 2. Adicionar mais nodes ao cluster
# 3. Remover pods não essenciais
```

---

### ❌ "CPU Throttling"

**Sintoma**: Aplicação lenta mas não reinicia.

**Causa**: CPU sendo throttled por exceder limite.

**Solução**:

```bash
# Verificar throttling
kubectl top pod -n nexo-develop

# Aumentar CPU limit
resources:
  limits:
    cpu: 2000m  # Aumentar
```

---

### ❌ "Evicted"

**Sintoma**: Pod mostra status `Evicted`.

**Causa**: Node sob pressão de recursos.

**Solução**:

```bash
# Verificar eventos do node
kubectl describe node <node-name> | grep -A 10 "Conditions"

# Limpar pods evicted
kubectl delete pods --field-selector=status.phase=Failed -n nexo-develop

# Adicionar mais nodes ou reduzir resource requests
```

---

## Erros de Kubernetes

### ❌ "CrashLoopBackOff"

**Sintoma**: Pod fica em `CrashLoopBackOff`.

**Causa**: Container crasha repetidamente.

**Solução**:

```bash
# Ver logs do crash
kubectl logs <pod-name> -n nexo-develop --previous

# Descrever pod
kubectl describe pod <pod-name> -n nexo-develop

# Causas comuns:
# - Variável de ambiente faltando
# - Database não acessível
# - Porta já em uso
```

---

### ❌ "ImagePullBackOff"

**Sintoma**: Pod fica em `ImagePullBackOff`.

**Causa**: Kubernetes não consegue baixar a imagem.

**Solução**:

```bash
# Verificar nome da imagem
kubectl describe pod <pod-name> -n nexo-develop | grep "Image:"

# Verificar se secret do GHCR existe
kubectl get secret ghcr-registry -n nexo-develop

# Criar secret do GHCR se não existir
kubectl create secret docker-registry ghcr-registry \
  --docker-server=ghcr.io \
  --docker-username=geraldobl58 \
  --docker-password=<GITHUB_TOKEN> \
  -n nexo-develop
```

---

### ❌ "CreateContainerConfigError"

**Sintoma**: Pod mostra `CreateContainerConfigError`.

**Causa**: Secret ou ConfigMap não existe.

**Solução**:

```bash
# Verificar qual secret está faltando
kubectl describe pod <pod-name> -n nexo-develop

# Criar secret faltante
kubectl create secret generic nexo-secrets \
  --from-literal=database-url=postgresql://... \
  -n nexo-develop
```

---

### ❌ "PVC Pending"

**Sintoma**: PVC fica em `Pending`.

**Causa**: StorageClass não existe ou cota excedida.

**Solução**:

```bash
# Verificar StorageClasses disponíveis
kubectl get storageclass

# Verificar eventos do PVC
kubectl describe pvc postgres-data -n nexo-develop

# Na DigitalOcean, usar:
storageClassName: do-block-storage
```

---

## Erros de Database

### ❌ "Connection refused"

**Sintoma**:

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causa**: PostgreSQL não está rodando ou acessível.

**Solução**:

```bash
# Verificar se pod do Postgres está rodando
kubectl get pods -n nexo-develop -l app=postgres

# Verificar logs
kubectl logs -f -l app=postgres -n nexo-develop

# Verificar Service
kubectl get svc postgres -n nexo-develop
```

---

### ❌ "Authentication failed"

**Sintoma**:

```
Error: password authentication failed for user "nexo"
```

**Causa**: Credenciais incorretas.

**Solução**:

```bash
# Verificar secret
kubectl get secret nexo-secrets -n nexo-develop -o yaml

# Verificar se DATABASE_URL está correto
kubectl exec -it <backend-pod> -n nexo-develop -- env | grep DATABASE
```

---

### ❌ "Database does not exist"

**Sintoma**:

```
Error: database "nexo_develop" does not exist
```

**Causa**: Database não foi criado.

**Solução**:

```bash
# Conectar no Postgres
kubectl exec -it <postgres-pod> -n nexo-develop -- psql -U postgres

# Criar database
CREATE DATABASE nexo_develop;
GRANT ALL PRIVILEGES ON DATABASE nexo_develop TO nexo;
```

---

## Erros de Docker

### ❌ "No space left on device"

**Sintoma**:

```
Error: no space left on device
```

**Causa**: Disco cheio com imagens antigas.

**Solução**:

```bash
# Limpar imagens não usadas
docker system prune -a

# Limpar volumes não usados
docker volume prune

# Verificar espaço
docker system df
```

---

### ❌ "Port already in use"

**Sintoma**:

```
Error: address already in use :::3000
```

**Causa**: Porta ocupada por outro processo.

**Solução**:

```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou parar containers Docker
docker-compose down
```

---

## Comandos de Debug

### Logs

```bash
# Logs de um pod
kubectl logs <pod-name> -n nexo-develop

# Logs com follow
kubectl logs -f <pod-name> -n nexo-develop

# Logs de todos os pods de um app
kubectl logs -f -l app=nexo-be -n nexo-develop --tail=100

# Logs do container anterior (se crashou)
kubectl logs <pod-name> -n nexo-develop --previous
```

### Eventos

```bash
# Eventos do namespace
kubectl get events -n nexo-develop --sort-by='.lastTimestamp'

# Eventos de um pod
kubectl describe pod <pod-name> -n nexo-develop
```

### Recursos

```bash
# Uso de CPU/Memory dos pods
kubectl top pods -n nexo-develop

# Uso de CPU/Memory dos nodes
kubectl top nodes

# Recursos alocados nos nodes
kubectl describe nodes | grep -A 5 "Allocated resources"
```

### Conectividade

```bash
# Testar DNS
kubectl run -it --rm debug --image=busybox -- nslookup nexo-be.nexo-develop.svc.cluster.local

# Testar HTTP
kubectl run -it --rm debug --image=curlimages/curl -- curl http://nexo-be:3000/health

# Shell em um pod
kubectl exec -it <pod-name> -n nexo-develop -- sh
```

### ArgoCD

```bash
# Status de todas as apps
argocd app list

# Detalhes de uma app
argocd app get nexo-be-dev

# Logs de sync
argocd app logs nexo-be-dev

# Diff entre Git e cluster
argocd app diff nexo-be-dev
```

---

## Checklist de Problemas

Antes de pedir ajuda, verifique:

- [ ] Logs do pod mostram erro específico?
- [ ] Pod está em Running ou outro status?
- [ ] Secrets e ConfigMaps existem?
- [ ] Database está acessível?
- [ ] DNS está configurado corretamente?
- [ ] Ingress Controller está rodando?
- [ ] Certificate foi emitido?
- [ ] ArgoCD mostra Synced?
- [ ] CI passou com sucesso?
- [ ] Imagem foi pushed para o registry?

---

## Próximos Passos

1. Revise os [GitHub Actions](github-actions.md) para entender o CI/CD
2. Consulte os [Ambientes](environments.md) para diferenças entre envs
3. Veja o [Kubernetes](kubernetes.md) para detalhes de manifests
