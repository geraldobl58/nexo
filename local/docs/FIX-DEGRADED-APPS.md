# 🚨 Guia de Correção: Apps "Degraded" no ArgoCD

## Problema Identificado

Seus apps no ArgoCD estão com status "Degraded" mostrando erro:

```
Unable to retrieve some image pull secrets (ghcr-secret)
Failed to pull image: 401 Unauthorized
```

Isso acontece porque:

1. ✅ As imagens Docker estão no GitHub Container Registry (ghcr.io)
2. ❌ O Kubernetes está tentando fazer pull de imagens **PRIVADAS**
3. ❌ Não existe o secret `ghcr-secret` nos namespaces

---

## ✅ Solução 1: Criar o Secret GHCR (Recomendado)

### Passo 1: Criar um GitHub Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Click em **"Generate new token (classic)"**
3. Selecione os scopes:
   - `read:packages` (para fazer pull de imagens)
   - `write:packages` (se for fazer push também)
4. Copie o token (exemplo: `ghp_...`)

### Passo 2: Executar o script

```bash
# Execute o script passando seu token
./local/scripts/create-ghcr-secrets.sh ghp_YOUR_TOKEN_HERE

# Ou export como variável
export GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
./local/scripts/create-ghcr-secrets.sh
```

O script vai:

- ✅ Criar namespaces (se não existirem): nexo-develop, nexo-qa, nexo-staging, nexo-prod
- ✅ Criar secret `ghcr-secret` em cada namespace
- ✅ Configurar autenticação para ghcr.io

### Passo 3: Deletar pods para forçar recriação

```bash
# Develop
kubectl delete deployment -n nexo-develop --all

# Prod
kubectl delete deployment -n nexo-prod --all

# QA (quando houver)
kubectl delete deployment -n nexo-qa --all

# Staging (quando houver)
kubectl delete deployment -n nexo-staging --all
```

### Passo 4: Aguardar e verificar

```bash
# Aguardar alguns segundos
sleep 30

# Verificar pods
kubectl get pods -n nexo-develop
kubectl get pods -n nexo-prod

# Verificar ArgoCD
kubectl get applications -n argocd
```

Espere ver: `STATUS: Running` nos pods e `SYNC STATUS: Synced` no ArgoCD.

---

## ✅ Solução 2: Tornar Imagens Públicas no GitHub

Se você quiser que qualquer um possa fazer pull das imagens (sem autenticação):

### Passo 1: Acessar o Package

1. Acesse: https://github.com/geraldobl58?tab=packages
2. Click no package (nexo-be, nexo-fe, nexo-auth)

### Passo 2: Mudar Visibilidade

1. Click em **"Package settings"**
2. Role até **"Danger Zone"**
3. Click em **"Change visibility"**
4. Selecione **"Public"**
5. Confirme

### Passo 3: Deletar pods

```bash
kubectl delete deployment -n nexo-develop --all
kubectl delete deployment -n nexo-prod --all
```

Agora o Kubernetes conseguirá fazer pull sem autenticação.

---

## 📋 Verificação Final

### Comandos para verificar se está funcionando:

```bash
# Ver secrets
kubectl get secret ghcr-secret -n nexo-develop
kubectl get secret ghcr-secret -n nexo-prod

# Ver pods
watch kubectl get pods -n nexo-develop

# Ver applications
watch kubectl get applications -n argocd

# Ver eventos de um pod
kubectl describe pod -n nexo-develop <pod-name>
```

### Status esperado:

```
✅ Pods: Running (1/1)
✅ Applications: Synced + Healthy
✅ No error messages about image pull
```

---

## 🔍 Troubleshooting

### Erro persiste após criar secret?

```bash
# Verificar se secret foi criado corretamente
kubectl get secret ghcr-secret -n nexo-develop -o yaml

# Deve ter:
# - .dockerconfigjson
# - type: kubernetes.io/dockerconfigjson
```

### Pods ainda com ImagePullBackOff?

```bash
# Verificar eventos do pod
kubectl describe pod -n nexo-develop <pod-name> | grep -A 20 Events

# Se ainda mostrar erro 401:
# 1. Verifique se o token está correto
# 2. Verifique se o token tem scope read:packages
# 3. Tente tornar as imagens públicas
```

### ArgoCD não está sincronizando?

```bash
# Forçar refresh
kubectl -n argocd patch application nexo-be-develop --type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'

# Ver diferenças
kubectl -n argocd get application nexo-be-develop -o yaml | grep -A 10 status
```

---

## 📚 Documentação Relacionada

- [create-ghcr-secrets.sh](../scripts/create-ghcr-secrets.sh) - Script para criar secrets
- [GitHub Packages Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Kubernetes Image Pull Secrets](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)

---

**💡 Dica:** Depois de corrigir, aguarde 1-2 minutos para os pods iniciarem. Keycloak (nexo-auth) demora mais porque precisa inicializar o banco de dados.
