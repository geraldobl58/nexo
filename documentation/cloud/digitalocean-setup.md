# 🌊 DigitalOcean Setup - Guia Completo

Este documento é um **tutorial passo a passo** para configurar toda a infraestrutura na DigitalOcean.

> 📝 **Nível**: Escrito para alguém **júnior** conseguir seguir sem ajuda.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Criar Conta na DigitalOcean](#criar-conta-na-digitalocean)
3. [Criar API Token](#criar-api-token)
4. [Instalar doctl CLI](#instalar-doctl-cli)
5. [Criar Cluster Kubernetes (DOKS)](#criar-cluster-kubernetes-doks)
6. [Configurar kubectl](#configurar-kubectl)
7. [Instalar NGINX Ingress Controller](#instalar-nginx-ingress-controller)
8. [Instalar Cert-Manager](#instalar-cert-manager)
9. [Instalar ArgoCD](#instalar-argocd)
10. [Configurar DNS](#configurar-dns)
11. [Verificação Final](#verificação-final)
12. [Custos Estimados](#custos-estimados)

---

## Pré-requisitos

Antes de começar, você precisa ter instalado:

```bash
# macOS
brew install kubectl helm doctl

# Verificar instalação
kubectl version --client
helm version
doctl version
```

---

## Criar Conta na DigitalOcean

1. Acesse [digitalocean.com](https://www.digitalocean.com/)
2. Clique em **Sign Up**
3. Crie sua conta (email ou GitHub)
4. Adicione um método de pagamento

> 💡 **Dica**: Use o link de referral para ganhar $200 de crédito: [digitalocean.com/referral](https://www.digitalocean.com/)

---

## Criar API Token

O API Token permite controlar sua conta via CLI e GitHub Actions.

### Passo a Passo

1. Acesse [cloud.digitalocean.com](https://cloud.digitalocean.com/)
2. No menu lateral, clique em **API** (ou vá direto: [API Tokens](https://cloud.digitalocean.com/account/api/tokens))
3. Clique em **Generate New Token**
4. Configure:
   - **Token name**: `nexo-platform`
   - **Expiration**: `No expiry` (ou 90 days para mais segurança)
   - **Scopes**:
     - ☑ **Read**
     - ☑ **Write**
5. Clique em **Generate Token**
6. **COPIE O TOKEN IMEDIATAMENTE** (ele não será mostrado novamente!)

### Salvar Token Localmente

```bash
# Salve em um arquivo seguro (não commite!)
echo "dop_v1_seu_token_aqui" > ~/.do-token
chmod 600 ~/.do-token

# Autentique o doctl
doctl auth init
# Cole o token quando solicitado

# Verificar autenticação
doctl account get
```

**Saída esperada**:

```
Email                    Team       Status
seuemail@exemplo.com     personal   active
```

---

## Instalar doctl CLI

O `doctl` é a CLI oficial da DigitalOcean.

### macOS

```bash
brew install doctl
```

### Linux

```bash
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.100.0/doctl-1.100.0-linux-amd64.tar.gz
tar xf doctl-1.100.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

### Autenticar

```bash
doctl auth init
# Cole seu API Token

# Testar
doctl account get
```

---

## Criar Cluster Kubernetes (DOKS)

### Via CLI (Recomendado)

```bash
# Listar versões disponíveis
doctl kubernetes options versions

# Listar regiões
doctl kubernetes options regions

# Listar tamanhos de nodes
doctl kubernetes options sizes

# Criar cluster com 1 node pool
doctl kubernetes cluster create nexo-cluster \
  --region nyc1 \
  --version 1.29.1-do.0 \
  --node-pool "name=nexo-pool;size=s-2vcpu-4gb;count=2;auto-scale=true;min-nodes=2;max-nodes=5" \
  --wait

# Aguarde ~10 minutos
```

### Via UI

1. Vá em [Kubernetes](https://cloud.digitalocean.com/kubernetes/clusters)
2. Clique em **Create Cluster**
3. Configure:
   - **Kubernetes version**: `1.29.x` (mais recente)
   - **Datacenter region**: `NYC1` (ou mais próximo)
   - **VPC Network**: `default-nyc1`
   - **Cluster capacity**:
     - **Node pool name**: `nexo-pool`
     - **Machine type**: **Basic** → `$24/month per node` (2 vCPU, 4 GB RAM)
     - **Node count**: `2`
     - ☑ **Autoscale**: Min `2`, Max `5`
   - **Cluster name**: `nexo-cluster`
4. Clique em **Create Cluster**
5. Aguarde ~10 minutos para provisionar

### Verificar Criação

```bash
# Listar clusters
doctl kubernetes cluster list

# Saída esperada:
# ID                      Name            Region    Version         Auto Upgrade    Status
# xxxxxxxx-xxxx-xxxx     nexo-cluster    nyc1      1.29.1-do.0     false           running
```

---

## Configurar kubectl

### Baixar Kubeconfig

```bash
# Obter kubeconfig e salvar localmente
doctl kubernetes cluster kubeconfig save nexo-cluster

# Verificar contexto
kubectl config current-context
# Saída: do-nyc1-nexo-cluster

# Testar conexão
kubectl get nodes
```

**Saída esperada**:

```
NAME                      STATUS   ROLES    AGE   VERSION
nexo-pool-xxxxx-xxxxx     Ready    <none>   5m    v1.29.1
nexo-pool-xxxxx-yyyyy     Ready    <none>   5m    v1.29.1
```

### Gerar Kubeconfig para GitHub Actions

```bash
# Gerar em base64 (para GitHub Secrets)
doctl kubernetes cluster kubeconfig show nexo-cluster | base64 | tr -d '\n'

# No macOS, copiar direto para clipboard
doctl kubernetes cluster kubeconfig show nexo-cluster | base64 | tr -d '\n' | pbcopy

# Cole no GitHub:
# Settings → Secrets → KUBECONFIG_DEV, KUBECONFIG_QA, KUBECONFIG_STAGING, KUBECONFIG_PROD
```

---

## Instalar NGINX Ingress Controller

O Ingress Controller cria um **Load Balancer** automaticamente.

```bash
# Adicionar repo do NGINX
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Criar namespace
kubectl create namespace ingress-nginx

# Instalar NGINX Ingress
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/do-loadbalancer-name"="nexo-lb" \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/do-loadbalancer-size-unit"="1" \
  --set controller.resources.requests.cpu=100m \
  --set controller.resources.requests.memory=128Mi \
  --set controller.resources.limits.cpu=500m \
  --set controller.resources.limits.memory=256Mi

# Aguardar Load Balancer ficar pronto
kubectl -n ingress-nginx get svc ingress-nginx-controller --watch
```

**Saída esperada** (após ~2 minutos):

```
NAME                       TYPE           EXTERNAL-IP      PORT(S)
ingress-nginx-controller   LoadBalancer   xxx.xxx.xxx.xxx  80:31080/TCP,443:31443/TCP
```

> 📝 **Anote o EXTERNAL-IP** - você vai precisar para configurar o DNS.

### Verificar Load Balancer no Painel

1. Vá em [Networking → Load Balancers](https://cloud.digitalocean.com/networking/load_balancers)
2. Você deve ver `nexo-lb` com status **Active**

---

## Instalar Cert-Manager

O Cert-Manager gerencia certificados TLS automáticos com Let's Encrypt.

```bash
# Adicionar repo
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Instalar CRDs
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.crds.yaml

# Instalar Cert-Manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set resources.requests.cpu=50m \
  --set resources.requests.memory=64Mi \
  --set resources.limits.cpu=200m \
  --set resources.limits.memory=128Mi

# Verificar instalação
kubectl -n cert-manager get pods
```

**Saída esperada**:

```
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-xxxxxxxxxx-xxxxx              1/1     Running   0          1m
cert-manager-cainjector-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
cert-manager-webhook-xxxxxxxxxx-xxxxx      1/1     Running   0          1m
```

### Criar ClusterIssuer para Let's Encrypt

```bash
# Criar arquivo
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: seu-email@exemplo.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: seu-email@exemplo.com
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
      - http01:
          ingress:
            class: nginx
EOF

# Verificar
kubectl get clusterissuer
```

> ⚠️ **Importante**: Substitua `seu-email@exemplo.com` pelo seu email real.

---

## Instalar ArgoCD

```bash
# Criar namespace
kubectl create namespace argocd

# Instalar ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Aguardar pods ficarem prontos
kubectl -n argocd get pods --watch
```

**Saída esperada** (após ~2 minutos):

```
NAME                                  READY   STATUS    RESTARTS   AGE
argocd-application-controller-0       1/1     Running   0          2m
argocd-dex-server-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
argocd-redis-xxxxxxxxxx-xxxxx         1/1     Running   0          2m
argocd-repo-server-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
argocd-server-xxxxxxxxxx-xxxxx        1/1     Running   0          2m
```

### Obter Senha Inicial

```bash
# Obter senha do admin
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo

# Saída: xxxxxxxxxxx (sua senha)
```

### Expor ArgoCD via Ingress

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - argocd.nexo.io
      secretName: argocd-tls
  rules:
    - host: argocd.nexo.io
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 443
EOF
```

### Gerar Token para GitHub Actions

```bash
# Instalar ArgoCD CLI
brew install argocd

# Login (use port-forward primeiro)
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
argocd login localhost:8080 --username admin --password <senha-obtida-acima> --insecure

# Gerar token
argocd account generate-token --account admin --id github-actions

# Copie o token e adicione no GitHub Secrets como ARGOCD_AUTH_TOKEN
```

---

## Configurar DNS

### Obter IP do Load Balancer

```bash
kubectl -n ingress-nginx get svc ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### Configurar Records no seu provedor DNS

| Tipo | Nome      | Valor                 | TTL |
| ---- | --------- | --------------------- | --- |
| A    | `@`       | `IP_DO_LOAD_BALANCER` | 300 |
| A    | `*`       | `IP_DO_LOAD_BALANCER` | 300 |
| A    | `dev`     | `IP_DO_LOAD_BALANCER` | 300 |
| A    | `qa`      | `IP_DO_LOAD_BALANCER` | 300 |
| A    | `staging` | `IP_DO_LOAD_BALANCER` | 300 |
| A    | `argocd`  | `IP_DO_LOAD_BALANCER` | 300 |

### Via DigitalOcean DNS (Opcional)

Se seu domínio usar DNS da DigitalOcean:

```bash
# Adicionar domínio
doctl compute domain create nexo.io

# Adicionar records
doctl compute domain records create nexo.io --record-type A --record-name @ --record-data IP_LOAD_BALANCER
doctl compute domain records create nexo.io --record-type A --record-name dev --record-data IP_LOAD_BALANCER
doctl compute domain records create nexo.io --record-type A --record-name qa --record-data IP_LOAD_BALANCER
doctl compute domain records create nexo.io --record-type A --record-name staging --record-data IP_LOAD_BALANCER
doctl compute domain records create nexo.io --record-type A --record-name argocd --record-data IP_LOAD_BALANCER
```

---

## Verificação Final

### Checklist

```bash
# 1. Cluster rodando
kubectl get nodes
# ✅ Deve mostrar 2+ nodes com status Ready

# 2. Ingress Controller
kubectl -n ingress-nginx get pods
# ✅ Todos os pods Running

# 3. Load Balancer
kubectl -n ingress-nginx get svc ingress-nginx-controller
# ✅ Deve ter EXTERNAL-IP

# 4. Cert-Manager
kubectl -n cert-manager get pods
# ✅ Todos os pods Running

# 5. ArgoCD
kubectl -n argocd get pods
# ✅ Todos os pods Running

# 6. ClusterIssuers
kubectl get clusterissuer
# ✅ letsencrypt-prod e letsencrypt-staging com Ready=True
```

### Criar Namespaces para Ambientes

```bash
# Criar namespaces
kubectl create namespace nexo-develop
kubectl create namespace nexo-qa
kubectl create namespace nexo-staging
kubectl create namespace nexo-production

# Verificar
kubectl get namespaces | grep nexo
```

### Integrar Registry com Cluster

```bash
# Verificar secret do GHCR em cada namespace
# (Criar usando: kubectl create secret docker-registry ghcr-registry --docker-server=ghcr.io --docker-username=geraldobl58 --docker-password=<GITHUB_TOKEN>)
kubectl -n nexo-develop get secret ghcr-registry
kubectl -n nexo-qa get secret ghcr-registry
kubectl -n nexo-staging get secret ghcr-registry
kubectl -n nexo-production get secret ghcr-registry
```

---

## Custos Estimados

| Recurso            | Especificação          | Custo/mês        |
| ------------------ | ---------------------- | ---------------- |
| **DOKS Cluster**   | Control plane gratuito | $0               |
| **Node Pool**      | 2x s-2vcpu-4gb         | $48              |
| **Load Balancer**  | Small (1 unit)         | $12              |
| **Block Storage**  | 20GB (PostgreSQL PVC)  | $2               |
| **Bandwidth**      | ~500GB/mês             | ~$0 (1TB grátis) |
| **Total Estimado** |                        | **~$62/mês**     |

> 💰 **Container Registry**: Usamos GitHub Container Registry (GHCR) que é **gratuito**, economizando $5/mês!

### Otimizações de Custo

- ✅ Use o menor node size que suporte sua carga
- ✅ Configure autoscaling para escalar sob demanda
- ✅ Use PostgreSQL em container (não Managed Database)
- ✅ Use 1 Load Balancer para todos os ambientes
- ✅ Use GHCR (gratuito) ao invés do DO Container Registry ($5/mês)
- ✅ Monitore e ajuste resource limits

---

## Próximos Passos

1. Configure os [GitHub Secrets](github-secrets.md)
2. Configure os [GitHub Actions](github-actions.md)
3. Entenda os [Ambientes](environments.md)
4. Revise o [Kubernetes](kubernetes.md) para detalhes de manifests

---

## Comandos Úteis

```bash
# Listar todos os recursos
doctl kubernetes cluster list
doctl compute load-balancer list

# Ver kubeconfig
kubectl config view

# Deletar cluster (CUIDADO!)
doctl kubernetes cluster delete nexo-cluster

# Ver logs de pods
kubectl logs -n <namespace> <pod-name>

# Descrever recursos
kubectl describe node <node-name>
kubectl describe pod -n <namespace> <pod-name>
```
