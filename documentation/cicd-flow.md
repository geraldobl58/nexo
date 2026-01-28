# 🚀 CI/CD Flow - Nexo Platform

Este documento descreve o fluxo completo de CI/CD, desde o commit até o deploy em produção.

## 📋 Visão Geral

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Código    │───▶│  GitHub CI  │───▶│    GHCR     │───▶│   ArgoCD    │
│   (Push)    │    │ Build/Test  │    │   Images    │    │   Deploy    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🔄 Fluxo de Branches

| Branch      | Ambiente | Deploy                | Registry |
| ----------- | -------- | --------------------- | -------- |
| `feature/*` | -        | ❌ Não deploya        | -        |
| `develop`   | dev      | ✅ Automático         | ghcr.io  |
| `qa`        | qa       | ✅ Automático         | ghcr.io  |
| `staging`   | staging  | ✅ Automático         | ghcr.io  |
| `main`      | prod     | ⚠️ Manual + Aprovação | ghcr.io  |

## 📦 1. CI Pipeline (GitHub Actions)

### Triggers

- **Push** para: `main`, `staging`, `qa`, `develop`
- **Pull Request** para essas branches
- **NÃO roda** em `feature/*` branches

### Jobs

1. **Detect Changes** - Identifica quais serviços mudaram
2. **Lint & Test** - Valida código
3. **Build & Push** - Constrói e publica imagem Docker

### Imagens Publicadas

As imagens são publicadas no Docker Hub:

```
docker.io/geraldobl58/nexo-be:<tag>
docker.io/geraldobl58/nexo-fe:<tag>
docker.io/geraldobl58/nexo-auth:<tag>
```

**Tags geradas:**

- `develop` - Branch develop
- `qa` - Branch qa
- `staging` - Branch staging
- `main` - Branch main (production)
- `latest` - Sempre a última versão da main
- `<sha>` - Commit SHA (ex: `abc1234`)

### Exemplo de Imagem

```bash
# Após push para develop
docker.io/geraldobl58/nexo-be:develop
docker.io/geraldobl58/nexo-be:abc1234

# Após push para main
docker.io/geraldobl58/nexo-be:main
docker.io/geraldobl58/nexo-be:latest
```

---

## 🚀 2. CD Pipeline (GitHub Actions + ArgoCD)

### Workflow CD

O CD é disparado automaticamente após CI bem-sucedido:

```yaml
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
```

### Deploy Automático

1. CI completa com sucesso
2. CD é disparado
3. ArgoCD Application é atualizada com nova tag
4. ArgoCD sincroniza automaticamente

---

## 🔧 3. Configuração ArgoCD

### Para Ambientes Reais (Docker Hub)

As aplicações ArgoCD apontam para imagens no Docker Hub:

```yaml
# infra/helm/nexo-be/values-dev.yaml
image:
  repository: docker.io/geraldobl58/nexo-be
  tag: develop
  pullPolicy: Always

imagePullSecrets:
  - name: dockerhub-secret
```

### ArgoCD Image Updater (Opcional)

Para atualização automática de imagens, instale o ArgoCD Image Updater:

```bash
# Instalar Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
```

Adicione annotations às Applications:

```yaml
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: nexo-be=docker.io/geraldobl58/nexo-be
    argocd-image-updater.argoproj.io/nexo-be.update-strategy: latest
    argocd-image-updater.argoproj.io/nexo-be.pull-secret: pullsecret:argocd/dockerhub-secret
```

---

## 🏠 4. Ambiente Local (K3D)

O ambiente local usa um fluxo diferente:

### Registry Local

```
nexo-registry.localhost:5111/nexo-be:local
nexo-registry.localhost:5111/nexo-fe:local
nexo-registry.localhost:5111/nexo-auth:local
```

### Fluxo de Desenvolvimento Local

```bash
# 1. Fazer alterações no código
vim apps/nexo-fe/src/app/page.tsx

# 2. Build e deploy local
cd local
make deploy-fe

# 3. Testar
curl http://nexo.local
```

### Usar Imagem do Docker Hub Localmente

Se quiser testar a imagem exata do CI localmente:

```bash
# 1. Pull da imagem do Docker Hub
docker pull docker.io/geraldobl58/nexo-be:develop

# 2. Tag para registry local
docker tag docker.io/geraldobl58/nexo-be:develop nexo-registry.localhost:5111/nexo-be:local

# 3. Import no K3D
k3d image import nexo-registry.localhost:5111/nexo-be:local -c nexo-local

# 4. Restart deployment
kubectl rollout restart deployment/nexo-be-local -n nexo-local
```

---

## 📊 5. Diagrama Completo

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              DESENVOLVIMENTO                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                     │
│  │  feature/*  │────▶│   develop   │────▶│     qa      │                     │
│  │   (local)   │ PR  │   (auto)    │ PR  │   (auto)    │                     │
│  └─────────────┘     └─────────────┘     └─────────────┘                     │
│         │                   │                   │                             │
│         ▼                   ▼                   ▼                             │
│   ┌──────────┐        ┌──────────┐        ┌──────────┐                       │
│   │ K3D Local│        │ nexo-dev │        │ nexo-qa  │                       │
│   │(registry)│        │  (GHCR)  │        │  (GHCR)  │                       │
│   └──────────┘        └──────────┘        └──────────┘                       │
│                                                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                               PRODUÇÃO                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                     │
│  │     qa      │────▶│   staging   │────▶│    main     │                     │
│  │             │ PR  │   (auto)    │ PR  │  (manual)   │                     │
│  └─────────────┘     └─────────────┘     └─────────────┘                     │
│                             │                   │                             │
│                             ▼                   ▼                             │
│                       ┌──────────┐        ┌──────────┐                       │
│                       │  staging │        │   prod   │                       │
│                       │  (GHCR)  │        │  (GHCR)  │                       │
│                       └──────────┘        └──────────┘                       │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 6. Secrets Necessários

### GitHub Secrets

| Secret            | Descrição                     |
| ----------------- | ----------------------------- |
| `DOCKERHUB_TOKEN` | Token de acesso do Docker Hub |

> **Nota:** O username é configurado diretamente no workflow (`geraldobl58`)

### Como criar o token do Docker Hub

1. Acesse https://hub.docker.com/settings/security
2. Clique em **New Access Token**
3. Dê um nome (ex: `nexo-ci`)
4. Selecione **Read, Write, Delete**
5. Copie o token
6. Adicione em GitHub → Settings → Secrets → `DOCKERHUB_TOKEN`

### Kubernetes Secrets (por ambiente)

```bash
# Criar secret para pull de imagens do Docker Hub
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=docker.io \
  --docker-username=geraldobl58 \
  --docker-password=<DOCKERHUB_TOKEN> \
  --namespace=nexo-dev
```

---

## 🛠️ 7. Troubleshooting

### Imagem não atualiza no ArgoCD

```bash
# Verificar qual imagem está sendo usada
kubectl get deployment nexo-be -n nexo-dev -o jsonpath='{.spec.template.spec.containers[0].image}'

# Forçar sync
kubectl -n argocd patch application nexo-be-dev --type merge -p '{"operation":{"sync":{}}}'
```

### Erro de pull de imagem

```bash
# Verificar se o secret existe
kubectl get secret dockerhub-secret -n nexo-dev

# Verificar logs do pod
kubectl describe pod <pod-name> -n nexo-dev
```

### ArgoCD travado

```bash
# Cancelar operação em andamento
kubectl -n argocd patch application nexo-be-dev --type json \
  -p='[{"op":"remove","path":"/status/operationState"}]'
```

---

## 📚 Referências

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [ArgoCD Image Updater](https://argocd-image-updater.readthedocs.io/)
- [Docker Hub](https://hub.docker.com/)
