# 🚀 Deploy

Guia de CI/CD e deploy em produção.

## Visão Geral

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Commit  │───►│    CI    │───►│    CD    │───►│  ArgoCD  │───►│   K8s    │
│  (Git)   │    │ (GitHub) │    │ (GitHub) │    │ (GitOps) │    │ (Prod)   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

## ⚡ CI vs CD: Diferenças Importantes

| Pipeline | Trigger                                     | Função                               | Quando usar                      |
| -------- | ------------------------------------------- | ------------------------------------ | -------------------------------- |
| **CI**   | Push automático em `apps/**`, `packages/**` | Build, Test, Lint, Push Docker image | Sempre que código muda           |
| **CD**   | Manual via `workflow_dispatch`              | Deploy no K8s via ArgoCD             | Quando quiser atualizar ambiente |

### Por que o CD é manual?

O CD foi configurado com `workflow_dispatch` (manual) para dar controle sobre quando fazer deploy. Isso é útil quando:

- Você quer testar localmente antes de fazer deploy
- Múltiplas features foram mergeadas e você quer um deploy único
- Ambiente de produção requer aprovação

### Como executar o CD manualmente

1. Vá em **Actions** → **CD**
2. Clique em **Run workflow**
3. Selecione:
   - **Branch:** `develop` (ou outra)
   - **Serviço a ser deployado:** `nexo-fe`, `nexo-be`, ou `nexo-auth`
   - **Ambiente de deploy:** `dev`, `staging`, ou `prod`
   - **Tag da imagem:** deixe vazio para usar a última
4. Clique em **Run workflow**

### Fluxo GitOps com ArgoCD

Após o CD executar, o ArgoCD sincroniza automaticamente as mudanças:

```
CD Pipeline                          ArgoCD                    Kubernetes
    │                                  │                          │
    ├─► Atualiza valores Helm ────────►│                          │
    │   (image.tag no Git)             │                          │
    │                                  ├─► Detecta diff ─────────►│
    │                                  │   (Git vs Cluster)       │
    │                                  │                          ├─► Aplica
    │                                  │                          │   mudanças
    └──────────────────────────────────┴──────────────────────────┘
```

**Importante:** Com ArgoCD, você **NÃO precisa** rodar `kubectl apply` manualmente. O ArgoCD monitora o Git e aplica as mudanças automaticamente!

## Fluxo de Branches

```
feature/* → develop → qa → staging → main (production)
```

> 📖 Veja [Git Branching Strategy](git-branching-strategy.md) para configuração completa.

## Ambientes

| Ambiente | Branch    | URL              | Deploy             |
| -------- | --------- | ---------------- | ------------------ |
| DEV      | `develop` | dev.nexo.com     | Automático         |
| QA       | `qa`      | qa.nexo.com      | Automático         |
| STAGING  | `staging` | staging.nexo.com | Manual             |
| PROD     | `main`    | nexo.com         | Manual + Aprovação |

---

## 🔧 Configuração do GitHub

### ⚡ Configuração Rápida (Desenvolvimento Local)

Se você está usando um **único cluster Kind** localmente, execute:

```bash
# 1. Gera kubeconfig em base64 e copia para clipboard
cat ~/.kube/config | base64 | tr -d '\n' | pbcopy

# 2. No GitHub, vá em: Settings → Secrets and variables → Actions → New repository secret
#    Crie os 4 secrets abaixo com o MESMO valor (cole o base64):
#    - KUBECONFIG_DEV
#    - KUBECONFIG_QA
#    - KUBECONFIG_STAGING
#    - KUBECONFIG_PROD

```

### Passo 1: Secrets do Repositório

Vá em **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### Secrets Obrigatórios

| Secret               | Descrição                              | Exemplo                            |
| -------------------- | -------------------------------------- | ---------------------------------- |
| `GHCR_TOKEN`         | Token para GitHub Container Registry   | `ghp_xxxx` (ou use `GITHUB_TOKEN`) |
| `KUBECONFIG_DEV`     | Kubeconfig do cluster DEV (base64)     | `base64 -i kubeconfig.yaml`        |
| `KUBECONFIG_STAGING` | Kubeconfig do cluster STAGING (base64) | `base64 -i kubeconfig.yaml`        |
| `KUBECONFIG_PROD`    | Kubeconfig do cluster PROD (base64)    | `base64 -i kubeconfig.yaml`        |
| `ARGOCD_SERVER`      | URL do ArgoCD                          | `argocd.nexo.com`                  |
| `ARGOCD_AUTH_TOKEN`  | Token de autenticação ArgoCD           | `argocd account generate-token`    |

#### Secrets de Banco de Dados

| Secret                 | Descrição                                       |
| ---------------------- | ----------------------------------------------- |
| `DEV_DATABASE_URL`     | `postgresql://user:pass@host:5432/nexo_dev`     |
| `QA_DATABASE_URL`      | `postgresql://user:pass@host:5432/nexo_qa`      |
| `STAGING_DATABASE_URL` | `postgresql://user:pass@host:5432/nexo_staging` |
| `PROD_DATABASE_URL`    | `postgresql://user:pass@host:5432/nexo_prod`    |

#### Secrets de Autenticação

| Secret                   | Descrição                  |
| ------------------------ | -------------------------- |
| `KEYCLOAK_CLIENT_SECRET` | Secret do client Keycloak  |
| `JWT_SECRET`             | Secret para JWT (produção) |
| `NEXTAUTH_SECRET`        | Secret para NextAuth       |

### Passo 2: Variables do Repositório ✅ OBRIGATÓRIO

As variables são usadas pelos workflows de CI/CD. São valores **não-sensíveis** que podem ser vistos em logs.

**Navegue até:** Settings → Secrets and variables → Actions → aba **Variables** → **New repository variable**

#### Variables Obrigatórias

Crie **cada uma** das variables abaixo:

| Variable                | Valor                   | Descrição                      |
| ----------------------- | ----------------------- | ------------------------------ |
| `REGISTRY`              | `ghcr.io/geraldohomero` | Registry das imagens Docker    |
| `ARGOCD_SERVER`         | `localhost:30443`       | Servidor ArgoCD (local) ou URL |
| `K8S_NAMESPACE_DEV`     | `nexo-dev`              | Namespace Kubernetes DEV       |
| `K8S_NAMESPACE_QA`      | `nexo-qa`               | Namespace Kubernetes QA        |
| `K8S_NAMESPACE_STAGING` | `nexo-staging`          | Namespace Kubernetes STAGING   |
| `K8S_NAMESPACE_PROD`    | `nexo-prod`             | Namespace Kubernetes PROD      |

#### Como Adicionar Cada Variable

1. Clique em **New repository variable**
2. Preencha:
   - **Name:** Nome da variable (ex: `REGISTRY`)
   - **Value:** Valor da variable (ex: `ghcr.io/geraldohomero`)
3. Clique em **Add variable**
4. Repita para cada variable da tabela

#### Resultado Esperado

Após adicionar todas, você deve ver:

```
Repository variables (6)
├── REGISTRY              = ghcr.io/geraldohomero
├── ARGOCD_SERVER         = localhost:30443
├── K8S_NAMESPACE_DEV     = nexo-dev
├── K8S_NAMESPACE_QA      = nexo-qa
├── K8S_NAMESPACE_STAGING = nexo-staging
└── K8S_NAMESPACE_PROD    = nexo-prod
```

> 💡 **Dica:** Para produção, altere `ARGOCD_SERVER` para o domínio real (ex: `argocd.nexo.com`)

---

### Passo 3: Environments ✅ OBRIGATÓRIO

Environments permitem regras de proteção por branch e aprovações manuais para deploy.

**Navegue até:** Settings → Environments → **New environment**

#### Environment: `dev`

1. Clique em **New environment**
2. Nome: `dev` → Clique em **Configure environment**
3. Em **Deployment branches and tags:**
   - Clique no dropdown **"No restriction"**
   - Selecione **"Selected branches and tags"**
   - Clique em **"Add deployment branch or tag rule"**
   - Digite: `develop` → Clique em **"Add rule"**
4. **Sem proteção adicional** (deploy automático)
5. Role para baixo e clique em **"Save protection rules"** (se houver)

#### Environment: `qa`

1. Clique em **New environment**
2. Nome: `qa` → Clique em **Configure environment**
3. Em **Deployment branches and tags:**
   - Selecione **"Selected branches and tags"**
   - Add rule: `qa`
4. **Sem proteção adicional**

#### Environment: `staging`

1. Clique em **New environment**
2. Nome: `staging` → Clique em **Configure environment**
3. Em **Deployment branches and tags:**
   - Selecione **"Selected branches and tags"**
   - Add rule: `staging`
4. Em **Deployment protection rules:**
   - ✅ Marque **"Required reviewers"**
   - Clique em **"Add"** e adicione 1 revisor
5. Clique em **"Save protection rules"**

#### Environment: `prod`

1. Clique em **New environment**
2. Nome: `prod` → Clique em **Configure environment**
3. Em **Deployment branches and tags:**
   - Selecione **"Selected branches and tags"**
   - Add rule: `main`
4. Em **Deployment protection rules:**
   - ✅ Marque **"Required reviewers"**
   - Adicione 2 revisores
   - ✅ Marque **"Prevent self-review"**
   - (Opcional) **Wait timer:** 5 minutos
5. Clique em **"Save protection rules"**

#### Resultado Esperado - Environments

Após configurar todos, você deve ver:

```
Environments (4)
├── dev      → develop branch  → Deploy automático
├── qa       → qa branch       → Deploy automático
├── staging  → staging branch  → 1 aprovação necessária
└── prod     → main branch     → 2 aprovações necessárias
```

---

### Passo 4: Branch Protection Rules ✅ RECOMENDADO

Branch protection rules protegem branches importantes de alterações diretas, exigindo PRs e aprovações.

**Navegue até:** Settings → Rules → Branches → **Add classic branch protection rule**

#### Regra para `main` (Produção)

1. Clique em **"Add classic branch protection rule"**
2. Em **Branch name pattern:** digite `main`
3. Marque as opções:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: `2`
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - Adicione: `ci / build`, `ci / test`, `ci / lint`
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings**
4. Clique em **"Create"**

#### Regra para `develop`

1. **Add classic branch protection rule**
2. **Branch name pattern:** `develop`
3. Marque:
   - ✅ **Require a pull request before merging**
     - Require approvals: `1`
   - ✅ **Require status checks to pass before merging**
4. Clique em **"Create"**

#### Regra para `staging`

1. **Add classic branch protection rule**
2. **Branch name pattern:** `staging`
3. Marque:
   - ✅ **Require a pull request before merging**
     - Require approvals: `1`
   - ✅ **Require status checks to pass before merging**
4. Clique em **"Create"**

#### Regra para `qa`

1. **Add classic branch protection rule**
2. **Branch name pattern:** `qa`
3. Marque:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
4. Clique em **"Create"**

#### Resultado Esperado - Branch Protection

```
Branch protection rules (4)
├── main     → 2 approvals, status checks, no bypass
├── develop  → 1 approval, status checks
├── staging  → 1 approval, status checks
└── qa       → status checks only
```

> ⚠️ **Nota:** Branch protection rules completas só funcionam em repositórios de organizações com GitHub Team ou Enterprise. Em repositórios pessoais, algumas opções podem não estar disponíveis.

---

### Passo 5: Default Branch (Opcional)

Por padrão, o GitHub usa `main` como branch principal. Para desenvolvimento, você pode mudar para `develop`:

1. Vá em **Settings** → **General**
2. Em **Default branch**, clique no ícone de edição
3. Selecione `develop`
4. Clique em **"Update"**

> 💡 Isso faz com que PRs sejam abertos contra `develop` por padrão, seguindo o fluxo GitFlow.

---

### 📋 Checklist de Configuração do GitHub

Use este checklist para garantir que tudo está configurado:

```markdown
## Secrets ✅

- [x] GHCR_TOKEN
- [x] KUBECONFIG_DEV
- [x] KUBECONFIG_QA
- [x] KUBECONFIG_STAGING
- [x] KUBECONFIG_PROD
- [x] ARGOCD_SERVER
- [x] ARGOCD_AUTH_TOKEN

## Variables ✅

- [x] REGISTRY = ghcr.io/geraldobl58
- [x] ARGOCD_SERVER = localhost:30443
- [x] K8S_NAMESPACE_DEV = nexo-dev
- [x] K8S_NAMESPACE_QA = nexo-qa
- [x] K8S_NAMESPACE_STAGING = nexo-staging
- [x] K8S_NAMESPACE_PROD = nexo-prod

## Environments ✅

- [x] dev (develop branch, 1 protection rule)
- [x] qa (qa branch, 1 protection rule)
- [x] staging (staging branch, 1 protection rule)
- [x] prod (main branch, 1 protection rule)

## Branch Protection Rules

- [ ] main (2 approvals, status checks)
- [ ] develop (1 approval, status checks)
- [ ] staging (1 approval, status checks)
- [ ] qa (status checks)
```

---

## 🔑 Como Obter os Dados para Configuração

Esta seção explica passo a passo como obter cada secret necessário.

### 1. Kubeconfig do Cluster

#### Opção A: Cluster Único (Desenvolvimento Local) ⭐ Recomendado

Em desenvolvimento local com **um único cluster Kind**, você pode usar o **mesmo kubeconfig** para todos os ambientes. O que diferencia cada ambiente é o **namespace**, não o cluster.

```bash
# 1. Gerar o kubeconfig em base64 (macOS)
cat ~/.kube/config | base64 | tr -d '\n' | pbcopy
echo "✅ Kubeconfig copiado para clipboard!"

# Linux:
cat ~/.kube/config | base64 -w 0

# 2. Adicione o MESMO valor nos seguintes secrets do GitHub:
#    Settings → Secrets and variables → Actions → New repository secret
#
#    - KUBECONFIG_DEV     → Cole o base64
#    - KUBECONFIG_QA      → Cole o base64 (mesmo valor)
#    - KUBECONFIG_STAGING → Cole o base64 (mesmo valor)
#    - KUBECONFIG_PROD    → Cole o base64 (mesmo valor)
```

> 💡 **Por que funciona?** Cada ambiente usa um namespace diferente (`nexo-dev`, `nexo-qa`, `nexo-staging`, `nexo-prod`). O workflow de CD especifica qual namespace usar, então o mesmo cluster serve para todos.

#### Comando Rápido via Makefile

```bash

```

#### Opção B: Múltiplos Clusters Kind (Simulando Ambientes)

```bash
# Criar clusters separados para cada ambiente
kind create cluster --name nexo-dev
kind create cluster --name nexo-qa
kind create cluster --name nexo-staging
kind create cluster --name nexo-prod

# Exportar kubeconfig de cada cluster
kind get kubeconfig --name nexo-dev | base64 | tr -d '\n'     # → KUBECONFIG_DEV
kind get kubeconfig --name nexo-qa | base64 | tr -d '\n'      # → KUBECONFIG_QA
kind get kubeconfig --name nexo-staging | base64 | tr -d '\n' # → KUBECONFIG_STAGING
kind get kubeconfig --name nexo-prod | base64 | tr -d '\n'    # → KUBECONFIG_PROD
```

#### Para EKS (AWS)

```bash
# Repita os passos abaixo para CADA ambiente/cluster:
# - nexo-dev-cluster     → KUBECONFIG_DEV
# - nexo-qa-cluster      → KUBECONFIG_QA
# - nexo-staging-cluster → KUBECONFIG_STAGING
# - nexo-prod-cluster    → KUBECONFIG_PROD

# 1. Configure AWS CLI
aws configure

# 2. Atualize kubeconfig (substitua pelo nome do cluster)
CLUSTER_NAME="nexo-prod-cluster"  # Altere conforme o ambiente
REGION="us-east-1"

aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

# 3. Crie ServiceAccount para CI/CD
kubectl create serviceaccount github-actions -n kube-system

# 4. Crie ClusterRoleBinding
kubectl create clusterrolebinding github-actions-admin \
  --clusterrole=cluster-admin \
  --serviceaccount=kube-system:github-actions

# 5. Gere token de longa duração (1 ano)
TOKEN=$(kubectl create token github-actions -n kube-system --duration=8760h)

# 6. Obtenha dados do cluster
CLUSTER_ENDPOINT=$(aws eks describe-cluster --name $CLUSTER_NAME --query 'cluster.endpoint' --output text)
CLUSTER_CA=$(aws eks describe-cluster --name $CLUSTER_NAME --query 'cluster.certificateAuthority.data' --output text)

# 7. Crie kubeconfig customizado
cat > kubeconfig-ci.yaml << EOF
apiVersion: v1
kind: Config
clusters:
- cluster:
    server: ${CLUSTER_ENDPOINT}
    certificate-authority-data: ${CLUSTER_CA}
  name: nexo-eks
contexts:
- context:
    cluster: nexo-eks
    user: github-actions
  name: github-actions
current-context: github-actions
users:
- name: github-actions
  user:
    token: ${TOKEN}
EOF

# 8. Encode e copie para o secret correspondente
cat kubeconfig-ci.yaml | base64 | tr -d '\n' | pbcopy
echo "✅ Kubeconfig copiado! Cole em KUBECONFIG_PROD (ou ambiente correspondente)"
```

#### Para GKE (Google Cloud)

```bash
# Repita os passos abaixo para CADA ambiente/cluster:
# - nexo-dev     → KUBECONFIG_DEV
# - nexo-qa      → KUBECONFIG_QA
# - nexo-staging → KUBECONFIG_STAGING
# - nexo-prod    → KUBECONFIG_PROD

# 1. Configure gcloud
gcloud auth login
gcloud config set project SEU-PROJETO

# 2. Obtenha credenciais (substitua pelo cluster do ambiente)
CLUSTER_NAME="nexo-prod"  # Altere conforme o ambiente
ZONE="us-central1-a"

gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE

# 3. Crie ServiceAccount e token
kubectl create serviceaccount github-actions -n kube-system
kubectl create clusterrolebinding github-actions-admin \
  --clusterrole=cluster-admin \
  --serviceaccount=kube-system:github-actions
TOKEN=$(kubectl create token github-actions -n kube-system --duration=8760h)

# 4. Obtenha dados do cluster
CLUSTER_ENDPOINT=$(gcloud container clusters describe $CLUSTER_NAME --zone $ZONE --format='value(endpoint)')
CLUSTER_CA=$(gcloud container clusters describe $CLUSTER_NAME --zone $ZONE --format='value(masterAuth.clusterCaCertificate)')

# 5. Crie e encode kubeconfig
cat > kubeconfig-ci.yaml << EOF
apiVersion: v1
kind: Config
clusters:
- cluster:
    server: https://${CLUSTER_ENDPOINT}
    certificate-authority-data: ${CLUSTER_CA}
  name: nexo-gke
contexts:
- context:
    cluster: nexo-gke
    user: github-actions
  name: github-actions
current-context: github-actions
users:
- name: github-actions
  user:
    token: ${TOKEN}
EOF

# 6. Encode e copie para o secret correspondente
cat kubeconfig-ci.yaml | base64 | tr -d '\n' | pbcopy
echo "✅ Cole em KUBECONFIG_PROD (ou ambiente correspondente)"
```

#### Para AKS (Azure)

```bash
# Repita os passos abaixo para CADA ambiente/cluster:
# - nexo-dev-cluster     → KUBECONFIG_DEV
# - nexo-qa-cluster      → KUBECONFIG_QA
# - nexo-staging-cluster → KUBECONFIG_STAGING
# - nexo-prod-cluster    → KUBECONFIG_PROD

# 1. Configure Azure CLI
az login
az account set --subscription SEU-SUBSCRIPTION-ID

# 2. Obtenha credenciais (substitua pelo cluster do ambiente)
RESOURCE_GROUP="nexo-rg"
CLUSTER_NAME="nexo-prod-cluster"  # Altere conforme o ambiente

az aks get-credentials --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME

# 3. Crie ServiceAccount e token
kubectl create serviceaccount github-actions -n kube-system
kubectl create clusterrolebinding github-actions-admin \
  --clusterrole=cluster-admin \
  --serviceaccount=kube-system:github-actions
TOKEN=$(kubectl create token github-actions -n kube-system --duration=8760h)

# 4. Obtenha dados do cluster
CLUSTER_ENDPOINT=$(az aks show --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --query 'fqdn' -o tsv)
CLUSTER_CA=$(kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')

# 5. Crie kubeconfig customizado
cat > kubeconfig-ci.yaml << EOF
apiVersion: v1
kind: Config
clusters:
- cluster:
    server: https://${CLUSTER_ENDPOINT}
    certificate-authority-data: ${CLUSTER_CA}
  name: nexo-aks
contexts:
- context:
    cluster: nexo-aks
    user: github-actions
  name: github-actions
current-context: github-actions
users:
- name: github-actions
  user:
    token: ${TOKEN}
EOF

# 6. Encode e copie para o secret correspondente
cat kubeconfig-ci.yaml | base64 | tr -d '\n' | pbcopy
echo "✅ Cole em KUBECONFIG_PROD (ou ambiente correspondente)"
```

#### Resumo dos Secrets por Ambiente

| Ambiente | Secret               | Cluster                        |
| -------- | -------------------- | ------------------------------ |
| DEV      | `KUBECONFIG_DEV`     | Kind local ou cluster dedicado |
| QA       | `KUBECONFIG_QA`      | Cluster de testes              |
| STAGING  | `KUBECONFIG_STAGING` | Pré-produção                   |
| PROD     | `KUBECONFIG_PROD`    | Produção                       |

### 2. Token do ArgoCD

```bash
# 1. Obtenha a senha inicial do admin
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# 2. Login via CLI
argocd login localhost:30443 --insecure --username admin --password SENHA_OBTIDA

# 3. Crie conta para CI/CD (se não existir)
kubectl -n argocd patch configmap argocd-cm --type merge -p '{
  "data": {
    "accounts.github-actions": "apiKey"
  }
}'

# 4. Dê permissões à conta
kubectl -n argocd patch configmap argocd-rbac-cm --type merge -p '{
  "data": {
    "policy.csv": "p, github-actions, applications, sync, */*, allow\np, github-actions, applications, get, */*, allow"
  }
}'

# 5. Gere o token
argocd account generate-token --account github-actions

# 6. Copie o token gerado para ARGOCD_AUTH_TOKEN
```

### 3. Database URL

```bash
# Formato da URL
# postgresql://USUARIO:SENHA@HOST:PORTA/DATABASE?sslmode=require

# Exemplos por ambiente:

# DEV (local/Docker)
DATABASE_URL_DEV="postgresql://nexo:nexo_dev@localhost:5432/nexo_dev"

# Produção (AWS RDS)
DATABASE_URL_PROD="postgresql://nexo_admin:SENHA_SEGURA@nexo-db.abc123.us-east-1.rds.amazonaws.com:5432/nexo_prod?sslmode=require"

# Produção (Google Cloud SQL)
DATABASE_URL_PROD="postgresql://nexo_admin:SENHA_SEGURA@/nexo_prod?host=/cloudsql/projeto:regiao:instancia"
```

### 4. Keycloak Client Secret

```bash
# 1. Acesse o Keycloak Admin Console
# URL: http://localhost:8080/admin (local) ou https://auth.nexo.com/admin

# 2. Navegue até:
# Clients → nexo-app → Credentials

# 3. Copie o "Client Secret"
# Cole em KEYCLOAK_CLIENT_SECRET

# Ou via API:
curl -s "http://localhost:8080/admin/realms/nexo/clients" \
  -H "Authorization: Bearer TOKEN" | \
  jq '.[] | select(.clientId=="nexo-app") | .secret'
```

### 5. JWT Secret

```bash
# Gere uma chave segura (256 bits / 32 bytes)
openssl rand -base64 32

# Exemplo de saída:
# K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=

# Cole em JWT_SECRET
```

### 6. GitHub Container Registry (GHCR) Token

```bash
# 1. Acesse GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

# 2. Gere novo token com permissões:
#    - read:packages
#    - write:packages
#    - delete:packages

# 3. Cole o token em GHCR_TOKEN

# 4. Crie secret de pull nos clusters K8s:
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=SEU-GITHUB-USERNAME \
  --docker-password=ghp_SEU_TOKEN \
  --docker-email=seu@email.com \
  -n nexo-prod
```

---

## 📋 Checklist Completo de Configuração

```markdown
## GitHub Repository

- [ ] Secrets configurados (KUBECONFIG*\*, DATABASE_URL*\*, etc.)
- [ ] Variables configuradas (REGISTRY, ARGOCD_SERVER, etc.)
- [ ] Environments criados (dev, qa, staging, prod)
- [ ] Branch protection rules configuradas
- [ ] CODEOWNERS criado

## Kubernetes Clusters

- [ ] ServiceAccount para GitHub Actions criada
- [ ] RBAC configurado (ClusterRoleBinding)
- [ ] Kubeconfig gerado e testado
- [ ] Namespaces criados (nexo-dev, nexo-qa, etc.)
- [ ] Secret de pull do GHCR criado

## ArgoCD

- [ ] Instalado e configurado
- [ ] Conta github-actions criada
- [ ] Token gerado
- [ ] Applications/ApplicationSets configurados
- [ ] Projects configurados

## Container Registry

- [ ] GHCR habilitado
- [ ] Permissões configuradas
- [ ] Token de acesso gerado
```

---

## GitHub Actions

> 📖 Para documentação completa dos workflows, veja [.github/workflows/README.md](../.github/workflows/README.md)

### Estrutura dos Workflows

```
.github/workflows/
├── README.md             # Documentação completa
├── ci-main.yml           # CI principal (lint, test, build)
├── cd-main.yml           # CD principal (deploy)
├── _ci-reusable.yml      # Workflow reutilizável de CI
└── _cd-reusable.yml      # Workflow reutilizável de CD
```

### Fluxo de CI/CD

```
Push/PR → ci-main.yml → _ci-reusable.yml → Build/Test → GHCR
                                              ↓
                                         cd-main.yml → _cd-reusable.yml → ArgoCD Sync
```

### Secrets e Variáveis Utilizadas

Os workflows utilizam os seguintes secrets (configurados em GitHub Settings):

| Secret               | Workflow | Uso                                    |
| -------------------- | -------- | -------------------------------------- |
| `GITHUB_TOKEN`       | CI       | Push de imagens para GHCR (automático) |
| `KUBECONFIG_DEV`     | CD       | Deploy no cluster DEV                  |
| `KUBECONFIG_QA`      | CD       | Deploy no cluster QA                   |
| `KUBECONFIG_STAGING` | CD       | Deploy no cluster STAGING              |
| `KUBECONFIG_PROD`    | CD       | Deploy no cluster PROD                 |
| `ARGOCD_AUTH_TOKEN`  | CD       | Sync do ArgoCD                         |

### Comportamento por Branch

| Branch    | Ambiente | Auto-Deploy | Aprovação   |
| --------- | -------- | ----------- | ----------- |
| `develop` | dev      | ✅          | Nenhuma     |
| `qa`      | qa       | ✅          | Nenhuma     |
| `staging` | staging  | ❌          | 1 revisor   |
| `main`    | prod     | ❌          | 2 revisores |

### Executar Deploy Manual

```bash
# Via GitHub CLI
gh workflow run cd-main.yml \
  -f service=nexo-be \
  -f environment=dev \
  -f image_tag=v1.0.0

# Via UI
# Actions → CD → Run workflow → Preencher campos
```

---

## Container Registry

Imagens são publicadas no **GitHub Container Registry (GHCR)**:

```
ghcr.io/seu-org/nexo-be:v1.0.0
ghcr.io/seu-org/nexo-fe:v1.0.0
```

### Tags

| Padrão    | Exemplo    | Uso               |
| --------- | ---------- | ----------------- |
| `v*.*.*`  | v1.2.3     | Release           |
| `develop` | develop    | Dev environment   |
| `sha-*`   | sha-abc123 | Commit específico |
| `pr-*`    | pr-42      | Pull Request      |

## ArgoCD (GitOps)

### Acesso Local (Kind)

````bash
# Port-forward ArgoCD
make pf-argocd

```bash
# Para ambiente DOKS (produção)
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo
````

- **URL:** https://argocd.yourdomain.com (configurado no Ingress)
- **User:** admin
- **Pass:** (use o comando acima ou senha definida nos secrets)

### Acesso Produção

- **URL:** https://argocd.nexo.com
- **Credenciais:** Integrado com SSO (Keycloak)

### Aplicações

```
infra/argocd/
├── applications/
│   ├── dev/                 # Apps DEV
│   └── prod/                # Apps PROD
├── applicationsets/
│   └── nexo-apps.yaml       # ApplicationSet
└── projects/
    ├── nexo-dev.yaml        # AppProject DEV
    ├── nexo-hlg.yaml        # AppProject HLG
    ├── nexo-staging.yaml    # AppProject STAGING
    └── nexo-prod.yaml       # AppProject PROD
```

### Sync Manual

```bash
# Via CLI
argocd app sync nexo-prod

# Ou via UI
# https://argocd.nexo.com → nexo-prod → Sync
```

## Kubernetes Manifests

### Estrutura

```
infra/k8s/
├── base/                    # Base compartilhada
│   ├── namespace.yaml
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── configmaps.yaml
│   ├── secrets.yaml
│   └── kustomization.yaml
│
└── overlays/                # Overlays por ambiente
    ├── dev/
    │   ├── kustomization.yaml
    │   └── patches/
    ├── staging/
    └── prod/
        ├── kustomization.yaml
        ├── replica-patch.yaml
        └── resources-patch.yaml
```

### Exemplo de Overlay (Prod)

```yaml
# infra/k8s/overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: nexo-prod

resources:
  - ../../base

patches:
  - path: replica-patch.yaml
  - path: resources-patch.yaml

images:
  - name: nexo-be
    newName: ghcr.io/seu-org/nexo-be
    newTag: v1.0.0
```

## Deploy Manual

### Para Kubernetes

```bash
# Aplicar manifests
kubectl apply -k infra/k8s/overlays/prod

# Verificar status
kubectl get pods -n nexo-prod

# Logs
kubectl logs -f -l app=nexo-be -n nexo-prod
```

### Rollback

```bash
# Via kubectl
kubectl rollout undo deployment/nexo-be -n nexo-prod

# Via ArgoCD
argocd app rollback nexo-prod
```

## Secrets Management

### Em desenvolvimento

Secrets ficam em `.env` (não commitado):

```bash
# .env
DATABASE_URL=postgresql://...
JWT_SECRET=dev-secret
```

### Em produção

Secrets são gerenciados via:

1. **Kubernetes Secrets** (criptografados)
2. **External Secrets Operator** (recomendado)
3. **Sealed Secrets**

```yaml
# Exemplo: External Secrets
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: nexo-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: nexo-secrets
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: nexo/prod/database-url
```

## Monitoramento de Deploy

### Verificar Status

```bash
# Pods
kubectl get pods -n nexo-prod -w

# Deployment
kubectl rollout status deployment/nexo-be -n nexo-prod

# Events
kubectl get events -n nexo-prod --sort-by='.lastTimestamp'
```

### Métricas de Deploy

No Grafana, acesse:

- **Dashboard:** Deployments Overview
- **Métricas:** Tempo de deploy, rollback rate, pod restarts

## Checklist de Release

```markdown
## Pre-Release

- [ ] Todos os testes passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] CHANGELOG atualizado

## Release

- [ ] Tag criada (v1.x.x)
- [ ] CI passou
- [ ] Deploy em staging
- [ ] Testes em staging
- [ ] Aprovação de QA

## Post-Release

- [ ] Deploy em produção
- [ ] Monitoramento de erros
- [ ] Verificar métricas
- [ ] Comunicar stakeholders
```

## Troubleshooting

### Pod não inicia

```bash
# Descrever pod
kubectl describe pod <pod-name> -n nexo-prod

# Logs do pod
kubectl logs <pod-name> -n nexo-prod --previous
```

### Imagem não encontrada

```bash
# Verificar se existe no registry
docker manifest inspect ghcr.io/seu-org/nexo-be:v1.0.0

# Verificar secret de pull
kubectl get secret regcred -n nexo-prod -o yaml
```

### Rollback de emergência

```bash
# 1. Rollback imediato
kubectl rollout undo deployment/nexo-be -n nexo-prod

# 2. Verificar
kubectl rollout status deployment/nexo-be -n nexo-prod

# 3. Notificar equipe
# (via Slack/Teams/etc)
```

## Próximos Passos

- ☸️ [Kubernetes](kubernetes.md) - Detalhes de K8s
- 🏗️ [Arquitetura](architecture.md) - Visão técnica
