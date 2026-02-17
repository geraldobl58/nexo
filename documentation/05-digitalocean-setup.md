# 05 — Configuração da DigitalOcean

> Guia passo a passo completo para configurar toda a infraestrutura na DigitalOcean.

---

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    DigitalOcean Cloud                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         DOKS (Kubernetes Cluster)                     │   │
│  │                                                      │   │
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │ nexo-develop │  │  nexo-prod  │  │ingress-nginx  │  │   │
│  │  └─────────────┘  └────────────┘  └──────────────┘  │   │
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │             │  │   argocd    │  │ cert-manager  │  │   │
│  │  └─────────────┘  └────────────┘  └──────┬───────┘  │   │
│  └──────────────────────────────────────────┼───────────┘   │
│                                             │               │
│  ┌──────────────┐    ┌──────────────────────▼────────────┐  │
│  │ Managed DB   │    │       Load Balancer (auto)        │  │
│  │ PostgreSQL   │    └───────────────────────────────────┘  │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Recursos e Custos

| Recurso               | Propósito                                           | Custo Estimado            |
| --------------------- | --------------------------------------------------- | ------------------------- |
| **DOKS** (Kubernetes) | Cluster para os workloads                           | ~$60/mês (3× s-2vcpu-4gb) |
| **Managed Database**  | PostgreSQL 16 gerenciado                            | ~$15/mês (basic-1)        |
| **Load Balancer**     | Ingress externo (criado automaticamente pelo NGINX) | ~$12/mês                  |

> Total estimado: **~$87/mês** para o setup básico.

### Ordem de Execução

```
Passo 1:  Conta + doctl                       (5 min)
Passo 2:  Managed Database                    (10 min + ~5 min provisionamento)
Passo 3:  Criar bancos de dados               (5 min)
Passo 4:  Kubernetes Cluster                  (5 min + ~5 min provisionamento)
Passo 5:  Instalar componentes no cluster     (10 min — script automático: NGINX, cert-manager, ArgoCD)
Passo 6:  Trusted Sources no DB               (2 min — precisa do cluster criado)
Passo 7:  Criar Secrets no K8s                (5 min)
Passo 8:  Verificar tudo                      (5 min)
```

> **DNS via DigitalOcean** — Utiliza domínio `*.g3developer.online` com wildcard A record apontando para o IP do Load Balancer.
> TLS automático via cert-manager + Let's Encrypt (`letsencrypt-prod` ClusterIssuer).

---

## Passo 1 — Conta e Autenticação

### 1.1 Criar Conta

1. Acesse [cloud.digitalocean.com](https://cloud.digitalocean.com/)
2. Crie uma conta ou faça login

### 1.2 Criar API Token

1. No painel DO, vá em **API** (menu lateral) → **Tokens** → **Generate New Token**
2. Preencha:
   - **Token name:** `nexo-cli`
   - **Expiration:** No expiry
   - **Scopes:** Full Access (Read + Write)
3. Clique **Generate Token**
4. **Copie o token imediatamente** (ele não será mostrado novamente)

### 1.3 Instalar e configurar doctl

```bash
# Instalar doctl (macOS)
brew install doctl

# Autenticar com o token copiado
doctl auth init
# Cole o token quando solicitado e pressione Enter
```

### 1.4 Verificar autenticação

```bash
doctl account get
```

Saída esperada:

```
Email                     Droplet Limit    Email Verified    UUID                                    Status
seu@email.com             25               true              xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx    active
```

> ⚠ Se aparecer erro de autenticação, rode `doctl auth init` novamente.

---

## Passo 2 — Criar Managed Database (PostgreSQL)

### 2.1 Criar o cluster de banco de dados

1. No painel DO, vá em **Databases** (menu lateral)
2. Clique **Create Database Cluster**
3. Configure:

| Campo               | Valor                                           |
| ------------------- | ----------------------------------------------- |
| **Database engine** | PostgreSQL 16                                   |
| **Cluster name**    | `nexo-db`                                       |
| **Region**          | NYC1 (ou a mesma que usará no cluster K8s)      |
| **Plan**            | Basic → 1 vCPU, 1 GB RAM, 10 GB Disk (~$15/mês) |
| **Nodes**           | 1 node (Primary only)                           |

4. Clique **Create Database Cluster**
5. Aguarde o status mudar para **online** (~5 minutos)

### 2.2 Anotar credenciais de conexão

Após o cluster estar online:

1. Vá em **Databases** → `nexo-db` → **Connection Details**
2. Selecione **Connection parameters** no dropdown
3. Anote os dados:

```
username = doadmin
password = (clique "show" para ver)
host     = nexo-db-do-user-XXXXX-0.X.db.ondigitalocean.com
port     = 25060
database = defaultdb
sslmode  = require
```

> 💡 Guarde esses valores — serão usados no Passo 7 para criar os secrets do Kubernetes.

---

## Passo 3 — Criar os Bancos de Dados

O cluster DO vem com o banco `defaultdb`. Precisamos criar dois bancos específicos:

### 3.1 Instalar psql (se necessário)

```bash
brew install libpq
brew link --force libpq
```

### 3.2 Conectar ao banco

> ⚠ **Importante:** A URL deve estar entre **aspas** para o zsh não interpretar os caracteres especiais (`?`, `&`).

```bash
psql "postgresql://doadmin:SUA_SENHA@nexo-db-do-user-XXXXX-0.X.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

Substitua:

- `SUA_SENHA` → senha do Connection Details (Passo 2.2)
- `nexo-db-do-user-XXXXX-0.X.db.ondigitalocean.com` → host do Connection Details

### 3.3 Criar os bancos

No prompt do `psql`, execute:

```sql
CREATE DATABASE nexo_app;
CREATE DATABASE nexo_keycloak;
```

### 3.4 Verificar e sair

```sql
-- Listar bancos criados
\l

-- Sair
\q
```

Você deve ver `nexo_app` e `nexo_keycloak` na lista.

> 💡 **Alternativa via painel:** Databases → `nexo-db` → **Users & Databases** → aba **Databases** → **Add Database**. Adicione `nexo_app` e `nexo_keycloak`.

---

## Passo 4 — Criar o Cluster Kubernetes (DOKS)

### 4.1 Criar o cluster via Painel

1. No painel DO, vá em **Kubernetes** (menu lateral)
2. Clique **Create a Kubernetes Cluster**
3. Configure:

| Campo                  | Valor                  |
| ---------------------- | ---------------------- |
| **Kubernetes version** | 1.31 (latest)          |
| **Datacenter Region**  | NYC1 (mesma do banco!) |
| **VPC Network**        | Default                |
| **Cluster name**       | `nexo-cluster`         |

4. Configure o **Node Pool**:

| Campo              | Valor                        |
| ------------------ | ---------------------------- |
| **Node pool name** | `nexo-workers`               |
| **Machine type**   | Basic (Regular Intel / AMD)  |
| **Node plan**      | s-2vcpu-4gb ($24/mês por nó) |
| **Node count**     | 3                            |
| **Auto-scale**     | ON (min: 2, max: 5)          |
| **Tags**           | `nexo`                       |

5. Clique **Create Cluster**
6. Aguarde o provisionamento (~5 minutos)

### 4.2 Configurar kubeconfig

Quando o cluster estiver **Running**:

```bash
doctl kubernetes cluster kubeconfig save nexo-cluster
```

### 4.3 Verificar conexão

```bash
kubectl cluster-info
```

Saída esperada:

```
Kubernetes control plane is running at https://xxxxxxxx.k8s.ondigitalocean.com
```

```bash
kubectl get nodes
```

Deve listar 3 nodes com status `Ready`.

---

## Passo 5 — Instalar Componentes no Cluster

### 5.1 Executar o script de setup (recomendado)

O script instala tudo automaticamente: NGINX Ingress, cert-manager, namespaces e ArgoCD.

```bash
cd infra/scripts
chmod +x setup-doks.sh
./setup-doks.sh
```

> ⏱ Este script leva ~5 minutos. Ao final, ele imprime o IP do Load Balancer e a senha do ArgoCD.

**Anote as informações exibidas:**

- 📌 **LoadBalancer IP** — configure no DNS da DigitalOcean como wildcard A record para `*.g3developer.online`
- 🔐 **Senha do ArgoCD** — necessário para acessar o painel do ArgoCD

### 5.2 Verificar a instalação

Após o script terminar, verifique cada componente:

```bash
# NGINX Ingress Controller
kubectl get pods -n ingress-nginx
# Deve mostrar pods com status Running

# Namespaces
kubectl get namespaces | grep nexo
# nexo-develop, nexo-prod

# ArgoCD
kubectl get pods -n argocd
# Deve mostrar vários pods Running

# Load Balancer IP
kubectl get svc ingress-nginx-controller -n ingress-nginx
# A coluna EXTERNAL-IP deve ter um IP (ex: 164.90.xxx.xxx)
```

> ⚠ Se o EXTERNAL-IP mostrar `<pending>`, aguarde mais 1-2 minutos e tente novamente.

### 5.3 Se o script falhar no meio (recovery)

Se o `setup-doks.sh` falhar, os componentes instalados antes do erro continuam funcionando. Execute manualmente apenas os passos que faltam:

```bash
# 1. Criar namespaces (se não existem)
kubectl apply -f infra/k8s/base/namespaces.yaml

# 2. Instalar ArgoCD
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# 3. Senha do ArgoCD
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo ""

# 4. Aplicar ArgoCD projects e ApplicationSet
kubectl apply -f infra/argocd/projects/nexo-environments.yaml
kubectl apply -f infra/argocd/applicationsets/nexo-apps.yaml
```

<details>
<summary>📋 Setup manual completo (se não usar o script)</summary>

#### 5.A NGINX Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.publishService.enabled=true \
  --set controller.service.type=LoadBalancer \
  --wait
```

#### 5.B Namespaces

```bash
kubectl apply -f infra/k8s/base/namespaces.yaml
```

#### 5.C ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# Senha inicial
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""
```

#### 5.D ArgoCD Projects e ApplicationSet

```bash
kubectl apply -f infra/argocd/projects/nexo-environments.yaml
kubectl apply -f infra/argocd/applicationsets/nexo-apps.yaml
```

</details>

---

## Passo 6 — Configurar Trusted Sources no Database

Agora que o cluster Kubernetes existe, libere o acesso ao banco de dados.

### 6.1 Adicionar o cluster como trusted source

1. No painel DO, vá em **Databases** → `nexo-db`
2. Clique na aba **Settings**
3. Em **Trusted Sources**, clique **Edit**
4. Selecione **Quick select Droplets, Kubernetes clusters, Apps, and tags**
5. No campo **Search or select a resource**, busque e selecione: `nexo-cluster`
6. Clique **Add Trusted Sources**

### 6.2 (Opcional) Adicionar seu IP para acesso local

Se quiser acessar o banco da sua máquina local (para debug/migrações):

1. Na mesma tela de Trusted Sources, clique **Edit**
2. Selecione **Enter specific IP addresses or CIDR notations**
3. Adicione seu IP público (descubra em [ifconfig.me](https://ifconfig.me))
4. Clique **Add Trusted Sources**

> ⚠ Sem trusted sources, o banco rejeita **todas** as conexões. O cluster DOKS é obrigatório.

### 6.3 Testar conexão do banco

```bash
psql "postgresql://doadmin:SUA_SENHA@nexo-db-do-user-XXXXX-0.X.db.ondigitalocean.com:25060/nexo_app?sslmode=require"
```

Se conectar com sucesso, o banco está pronto.

---

## Passo 7 — Criar Secrets no Kubernetes

Os secrets armazenam credenciais sensíveis (banco, Keycloak, GHCR) dentro do cluster.

### 7.1 Criar GHCR Token (se ainda não tiver)

O token é necessário para o cluster puxar imagens Docker do GitHub Container Registry.

1. Acesse [github.com/settings/tokens](https://github.com/settings/tokens)
2. **Generate new token (classic)**
3. Configure:
   - **Note:** `nexo-k8s-pull`
   - **Expiration:** No expiration
   - **Scopes:** marque apenas `read:packages`
4. Clique **Generate token**
5. Copie o token (começa com `ghp_...`)

### 7.2 Definir variáveis de ambiente

Preencha com os dados reais do seu banco (Passo 2.2):

```bash
# Database (do Connection Details do Passo 2.2)
export DB_HOST="nexo-db-do-user-XXXXX-0.X.db.ondigitalocean.com"
export DB_PORT="25060"
export DB_USERNAME="doadmin"
export DB_PASSWORD="sua-senha-do-banco"

# GHCR (do token criado no Passo 7.1)
export GHCR_TOKEN="ghp_seu_token_aqui"
export GHCR_USER="geraldobl58"

# Keycloak Admin (defina uma senha forte)
export KC_ADMIN_USER="admin"
export KC_ADMIN_PASS="SUA-SENHA-SEGURA-AQUI"
```

### 7.3 Executar o script de criação

```bash
cd infra/scripts
chmod +x create-secrets.sh
./create-secrets.sh
```

O script cria estes secrets em **todos os 2 namespaces** (develop, prod):

| Secret                   | Keys                                                     | Usado por       |
| ------------------------ | -------------------------------------------------------- | --------------- |
| `nexo-db-secret`         | `DATABASE_URL`                                           | nexo-be         |
| `nexo-auth-db-secret`    | `KC_DB`, `KC_DB_URL`, `KC_DB_USERNAME`, `KC_DB_PASSWORD` | nexo-auth       |
| `nexo-auth-admin-secret` | `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`              | nexo-auth       |
| `ghcr-secret`            | Docker registry auth                                     | Pull de imagens |

### 7.4 Verificar secrets criados

```bash
# Verificar em cada namespace
kubectl get secrets -n nexo-develop
kubectl get secrets -n nexo-prod
```

Em cada namespace você deve ver:

```
NAME                     TYPE                             DATA   AGE
nexo-db-secret           Opaque                           1      Xs
nexo-auth-db-secret      Opaque                           4      Xs
nexo-auth-admin-secret   Opaque                           2      Xs
ghcr-secret              kubernetes.io/dockerconfigjson   1      Xs
```

---

## Passo 8 — Verificação Final

### 8.1 Checklist completo

Execute cada verificação:

```bash
echo "=== 1. doctl autenticado ==="
doctl account get

echo ""
echo "=== 2. Cluster K8s acessível ==="
kubectl cluster-info

echo ""
echo "=== 3. Nodes do cluster ==="
kubectl get nodes

echo ""
echo "=== 4. Namespaces ==="
kubectl get ns | grep nexo

echo ""
echo "=== 5. NGINX Ingress ==="
kubectl get pods -n ingress-nginx

echo ""
echo "=== 6. ArgoCD ==="
kubectl get pods -n argocd

echo ""
echo "=== 7. Load Balancer IP ==="
kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
echo ""

echo ""
echo "=== 8. Secrets (nexo-develop) ==="
kubectl get secrets -n nexo-develop

echo ""
echo "=== 9. Secrets (nexo-prod) ==="
kubectl get secrets -n nexo-prod
```

### 8.2 Checklist visual

- [ ] **Conta DO** — criada e autenticada com doctl
- [ ] **Managed Database** — PostgreSQL online
  - [ ] Banco `nexo_app` criado
  - [ ] Banco `nexo_keycloak` criado
  - [ ] Trusted Sources: cluster K8s adicionado
- [ ] **DOKS Cluster** — 3 nodes Running
  - [ ] kubeconfig configurado
  - [ ] NGINX Ingress instalado (Load Balancer com IP)
  - [ ] 4 namespaces criados
  - [ ] ArgoCD instalado e pods Running
  - [ ] ArgoCD Projects e ApplicationSet aplicados
- [ ] **Secrets** — criados nos 4 namespaces
  - [ ] `nexo-db-secret`
  - [ ] `nexo-auth-db-secret`
  - [ ] `nexo-auth-admin-secret`
  - [ ] `ghcr-secret`
- [ ] **DNS (DigitalOcean)** — Configurar domínio `g3developer.online` com wildcard A record
  - [ ] Verificar propagação DNS: `dig +short develop.api.g3developer.online`
  - [ ] Verificar acesso HTTPS: `curl https://develop.api.g3developer.online/health`

---

## DNS via DigitalOcean

O projeto usa o domínio `g3developer.online` com DNS gerenciado pela DigitalOcean (nameservers DO).
Um wildcard A record (`*`) aponta todos os subdomínios para o IP do Load Balancer.
TLS é gerenciado automaticamente via cert-manager + Let's Encrypt.

### Como funciona

1. O domínio `g3developer.online` usa os nameservers da DigitalOcean (`ns1.digitalocean.com`, `ns2.digitalocean.com`, `ns3.digitalocean.com`)
2. Um wildcard A record (`*`) e um A record (`@`) apontam para o IP do Load Balancer
3. Todos os subdomínios são resolvidos automaticamente via DNS público (sem necessidade de `/etc/hosts`)

### Configurar DNS na DigitalOcean

#### 1. Adicionar domínio no painel DO

1. No painel DO, vá em **Networking** (menu lateral) → **Domains**
2. Em **Add a domain**, digite: `g3developer.online`
3. Clique **Add Domain**

#### 2. Obter o IP do Load Balancer

```bash
LB_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "$LB_IP"
```

#### 3. Criar os registros DNS

Na página do domínio `g3developer.online`, crie dois A records:

| Tipo | Hostname | Valor (IP) | TTL  |
| ---- | -------- | ---------- | ---- |
| A    | `@`      | IP do LB   | 3600 |
| A    | `*`      | IP do LB   | 3600 |

- O record `@` resolve `g3developer.online` diretamente
- O record `*` resolve **todos os subdomínios** automaticamente (wildcard)

#### 4. Subdomínios cobertos pelo wildcard

O wildcard `*` cobre todos os subdomínios usados pela plataforma:

**Develop:**

- `develop.g3developer.online` (Frontend)
- `develop.api.g3developer.online` (Backend)
- `develop.auth.g3developer.online` (Keycloak)

**Production:**

- `app.g3developer.online` (Frontend)
- `api.g3developer.online` (Backend)
- `auth.g3developer.online` (Keycloak)

**Infraestrutura:**

- `argocd.g3developer.online` (ArgoCD)

#### 5. Verificar propagação DNS

```bash
# Verificar resolução do wildcard
dig +short develop.g3developer.online
dig +short api.g3developer.online

# Testar acesso
curl -I https://develop.api.g3developer.online/health
```

> Os domínios `*.g3developer.online` são usados em todos os Helm values (`infra/helm/*/values-*.yaml`).

---

## TLS com cert-manager + Let's Encrypt

O projeto utiliza [cert-manager](https://cert-manager.io/) para emitir e renovar automaticamente certificados TLS via Let's Encrypt.

### Como é instalado

O `cert-manager` é instalado automaticamente pelo script `setup-doks.sh` (Passo 5). Ele:

1. Instala o cert-manager via Helm chart no namespace `cert-manager`
2. Cria o `ClusterIssuer` chamado `letsencrypt-prod` que usa o solver HTTP-01

### ClusterIssuer

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

### Como funciona

1. Cada Ingress inclui a annotation `cert-manager.io/cluster-issuer: "letsencrypt-prod"`
2. O cert-manager detecta automaticamente o Ingress e cria um `Certificate` resource
3. O cert-manager resolve o challenge HTTP-01 via Ingress NGINX
4. O certificado é armazenado como Secret TLS no namespace do Ingress
5. O NGINX Ingress usa o certificado automaticamente para servir HTTPS
6. Renovação é automática (cert-manager renova ~30 dias antes da expiração)

### Verificar certificados

```bash
# Listar todos os certificados
kubectl get certificates -A

# Ver status detalhado de um certificado
kubectl describe certificate <cert-name> -n <namespace>

# Ver challenges pendentes (se certificado não emitido ainda)
kubectl get challenges -A

# Verificar ClusterIssuer
kubectl get clusterissuer letsencrypt-prod

# Verificar logs do cert-manager
kubectl logs -l app=cert-manager -n cert-manager --tail=50
```

> **Nota:** Cada Ingress gera um certificado individual. O Let's Encrypt emite certificados válidos por 90 dias, mas o cert-manager renova automaticamente.

---

## URLs de Todos os Ambientes

> Base: `*.g3developer.online` (DNS via DigitalOcean → IP do Load Balancer). HTTPS via Let's Encrypt.

### Develop

| Serviço      | URL                                         |
| ------------ | ------------------------------------------- |
| **Frontend** | https://develop.g3developer.online          |
| **Backend**  | https://develop.api.g3developer.online      |
| **Swagger**  | https://develop.api.g3developer.online/docs |
| **Auth**     | https://develop.auth.g3developer.online     |

### Production

| Serviço      | URL                                 |
| ------------ | ----------------------------------- |
| **Frontend** | https://app.g3developer.online      |
| **Backend**  | https://api.g3developer.online      |
| **Swagger**  | https://api.g3developer.online/docs |
| **Auth**     | https://auth.g3developer.online     |

### Observabilidade

> **Nota:** Stack de monitoring (Prometheus, Grafana, Alertmanager) foi removido definitivamente. Observabilidade é feita via health checks nativos do Kubernetes e logs (`kubectl logs`).

### Infraestrutura

| Serviço    | URL                               | Login                  |
| ---------- | --------------------------------- | ---------------------- |
| **ArgoCD** | https://argocd.g3developer.online | admin / `NexoArgo2026` |

> **Nota sobre HTTPS:** Todos os ambientes usam HTTPS com certificados Let's Encrypt emitidos automaticamente via cert-manager (`letsencrypt-prod` ClusterIssuer).

---

## Credenciais de Acesso

> **IMPORTANTE:** Estas são as credenciais de desenvolvimento. Em produção, use senhas fortes e rotacione regularmente.

| Serviço                | Login         | Senha             | Onde configurar                     |
| ---------------------- | ------------- | ----------------- | ----------------------------------- |
| **Keycloak (Admin)**   | `admin`       | `NexoAdmin2026`   | K8s Secret `nexo-auth-admin-secret` |
| **ArgoCD**             | `admin`       | `NexoArgo2026`    | Patched via `argocd-secret`         |
| **PostgreSQL (DO)**    | `doadmin`     | (ver painel DO)   | DigitalOcean → Databases → nexo-db  |
| **GHCR (Pull images)** | `geraldobl58` | `ghp_...` (token) | GitHub → Settings → Tokens          |

### Obter senha do ArgoCD

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo ""
```

---

## Troubleshooting

### psql: `zsh: no matches found`

O zsh interpreta o `?` da URL como glob. **Sempre use aspas:**

```bash
# ❌ Errado
psql postgresql://user:pass@host:25060/db?sslmode=require

# ✅ Correto
psql "postgresql://user:pass@host:25060/db?sslmode=require"
```

### setup-doks.sh: `no cluster goes by the name "nexo-cluster"`

O script tenta configurar o kubeconfig de um cluster que ainda não existe. **Crie o cluster primeiro** (Passo 4) e depois rode o script.

### doctl: `unable to authenticate`

Rode `doctl auth init` novamente e cole um token válido.

### Load Balancer IP: `<pending>`

O provisionamento do Load Balancer pode levar 2-3 minutos após a instalação do NGINX Ingress. Aguarde e tente:

```bash
kubectl get svc ingress-nginx-controller -n ingress-nginx -w
# O -w fica assistindo até o IP aparecer (Ctrl+C para sair)
```

### Conexão ao banco recusada

Verifique se adicionou o trusted source corretamente (Passo 6). Para desenvolvimento local, também precisa adicionar seu IP público.

### Keycloak: `Acquisition timeout while waiting for new connection`

Se o Keycloak falhar com timeout ao conectar no banco, pode ser que um nó auto-escalado novo não esteja nos Trusted Sources do banco:

1. No painel DO, vá em **Databases** → `nexo-db` → **Settings** → **Trusted Sources**
2. Remova o cluster `nexo-cluster` e adicione novamente
3. Isso força a atualização dos IPs permitidos (incluindo novos nós)
4. Reinicie o pod: `kubectl rollout restart deployment nexo-auth-develop -n nexo-develop`

### ArgoCD: `No resources found in argocd namespace`

O ArgoCD não foi instalado (provavelmente o script falhou antes de chegar neste passo). Instale manualmente — veja Passo 5.3.

---

## Status do ArgoCD — O que significam e como resolver

O ArgoCD exibe dois indicadores para cada aplicação: **Sync Status** e **Health Status**.

### Sync Status

| Status        | Significado               | O que fazer                                                               |
| ------------- | ------------------------- | ------------------------------------------------------------------------- |
| **Synced**    | Cluster está igual ao Git | Nenhuma ação necessária                                                   |
| **OutOfSync** | Cluster difere do Git     | Clique **SYNC** ou aguarde auto-sync (develop sincroniza automaticamente) |

### Health Status

| Status          | Significado                                                 | O que fazer                                                                                               |
| --------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Healthy**     | Todos os recursos estão funcionando normalmente             | Nenhuma ação necessária                                                                                   |
| **Progressing** | Recursos estão sendo criados ou atualizados                 | Aguarde 2-5 min. Se persistir, verifique: `kubectl get pods -n <namespace>`                               |
| **Degraded**    | Um ou mais pods falharam (CrashLoopBackOff, erro de imagem) | Verifique logs: `kubectl logs -n <namespace> <pod>` e events: `kubectl describe pod -n <namespace> <pod>` |
| **Missing**     | Recursos definidos no Git não existem no cluster            | Clique **SYNC**. Se persistir, verifique se o namespace e secrets existem                                 |
| **Suspended**   | Recursos pausados (ex: CronJob suspenso)                    | Normal para alguns recursos. Force com **SYNC** se necessário                                             |
| **Unknown**     | ArgoCD não conseguiu determinar o health                    | Verifique conectividade do cluster: `kubectl cluster-info`                                                |

### Diagnóstico rápido

```bash
# Ver status de todas as apps
kubectl get applications -n argocd

# Ver detalhes de uma app específica
kubectl get application nexo-be-develop -n argocd -o yaml | grep -A 10 status

# Ver pods com problema
kubectl get pods -A | grep -vE "Running|Completed"

# Ver eventos recentes (erros)
kubectl get events -n <namespace> --sort-by='.lastTimestamp' | tail -20

# Ver logs de um pod com erro
kubectl logs -n <namespace> <pod-name> --tail=50

# Forçar re-sync de uma app
kubectl patch application <app-name> -n argocd --type=merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'
```

### Problemas comuns por status

#### Degraded — Pod em CrashLoopBackOff

```bash
# 1. Ver qual pod está com problema
kubectl get pods -n nexo-develop | grep -v Running

# 2. Ver logs do pod
kubectl logs -n nexo-develop <pod-name> --previous

# 3. Causas comuns:
#    - Variáveis de ambiente faltando → verificar secrets
#    - Banco de dados inacessível → verificar Trusted Sources
#    - Imagem não encontrada → verificar GHCR token e tag
```

#### Missing — Recursos não existem

```bash
# 1. Verificar se o namespace existe
kubectl get ns | grep nexo

# 2. Verificar se os secrets existem
kubectl get secrets -n <namespace>

# 3. Se faltam secrets, recriar:
cd infra/scripts && ./create-secrets.sh
```

#### Progressing — Pods Pending (sem recursos)

```bash
# 1. Ver qual pod está Pending
kubectl get pods -n <namespace> | grep Pending

# 2. Ver o motivo
kubectl describe pod <pod-name> -n <namespace> | tail -5

# 3. Se "Insufficient cpu/memory":
#    - Reduzir resources nos values: infra/helm/<service>/values-<env>.yaml
#    - Ou escalar o cluster: DigitalOcean → Kubernetes → Node Pools → Resize
```

---

## Segurança — GitHub Variables vs Secrets

> **IMPORTANTE:** Dados sensíveis (senhas, tokens) devem estar em **Secrets** (criptografados),
> **NÃO** em **Variables** (texto plano visível para todos os colaboradores).

### O que deve estar em Secrets (criptografado)

No GitHub → Settings → Secrets and variables → Actions → **Secrets**:

| Secret          | Valor                   | Usado por                    |
| --------------- | ----------------------- | ---------------------------- |
| `GHCR_TOKEN`    | `ghp_...` (token)       | Pipeline (push de imagens)   |
| `DB_PASSWORD`   | Senha do PostgreSQL     | Referência (não usado no CI) |
| `KC_ADMIN_PASS` | Senha admin do Keycloak | Referência (não usado no CI) |

### O que pode ficar em Variables (texto plano)

No GitHub → Settings → Secrets and variables → Actions → **Variables**:

| Variable        | Valor                                             | Descrição              |
| --------------- | ------------------------------------------------- | ---------------------- |
| `DB_HOST`       | `nexo-db-do-user-XXXXX-0.X.db.ondigitalocean.com` | Host do banco          |
| `DB_PORT`       | `25060`                                           | Porta do banco         |
| `DB_USERNAME`   | `doadmin`                                         | Usuário do banco       |
| `GHCR_USER`     | `geraldobl58`                                     | Usuário do GHCR        |
| `KC_ADMIN_USER` | `admin`                                           | Usuário admin Keycloak |

> **Ação necessária:** Mova `DB_PASSWORD`, `GHCR_TOKEN` e `KC_ADMIN_PASS` de Variables para Secrets.
> No GitHub, vá em Settings → Secrets and variables → Actions → aba **Secrets** → **New repository secret**.

---

## Próximo Passo

→ [06 — CI/CD Pipeline](06-cicd-pipeline.md)
