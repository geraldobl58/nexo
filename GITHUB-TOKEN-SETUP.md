# 🔐 Configurar GitHub Token - Guia Rápido

## ✅ Token Já Configurado!

O arquivo `.env` na raiz do projeto deve conter:

```bash
GITHUB_TOKEN=ghp_YOUR_GITHUB_TOKEN_HERE
GITHUB_USERNAME=seu_usuario_github
```

> ⚠️ **IMPORTANTE**: Substitua `ghp_YOUR_GITHUB_TOKEN_HERE` pelo seu token real do GitHub.
> Nunca commite o arquivo `.env` no Git!

## 🚀 Como Aplicar os Secrets

### Método 1: Automático (Lê do .env)

```bash
bash local/scripts/create-ghcr-secrets.sh
```

O script:

1. ✅ Carrega automaticamente o token do `.env`
2. ✅ Cria secrets `ghcr-secret` nos 4 namespaces
3. ✅ Sugere comandos para reiniciar deployments

### Método 2: Variável de Ambiente

```bash
export GITHUB_TOKEN="ghp_YOUR_GITHUB_TOKEN_HERE"
bash local/scripts/create-ghcr-secrets.sh
```

### Método 3: Argumento

```bash
bash local/scripts/create-ghcr-secrets.sh ghp_YOUR_GITHUB_TOKEN_HERE
```

## 🔄 Reiniciar Aplicações

Após criar os secrets, reinicie os deployments para puxar as imagens:

```bash
# Reiniciar todos os ambientes
kubectl rollout restart deployment -n nexo-develop
kubectl rollout restart deployment -n nexo-qa
kubectl rollout restart deployment -n nexo-staging
kubectl rollout restart deployment -n nexo-prod
```

Ou apenas um ambiente específico:

```bash
kubectl rollout restart deployment -n nexo-develop
```

## 📊 Verificar Status

### Ver Secrets Criados

```bash
# Listar secrets
kubectl get secret ghcr-secret -n nexo-develop
kubectl get secret ghcr-secret -n nexo-qa
kubectl get secret ghcr-secret -n nexo-staging
kubectl get secret ghcr-secret -n nexo-prod

# Ver detalhes de um secret
kubectl describe secret ghcr-secret -n nexo-develop
```

### Ver Status dos Pods

```bash
# Ver se pods estão rodando
kubectl get pods -n nexo-develop
kubectl get pods -n nexo-qa
kubectl get pods -n nexo-staging
kubectl get pods -n nexo-prod

# Ou usar o comando consolidado
make status
```

### Ver Status no ArgoCD

```bash
# Abrir ArgoCD
open http://argocd.nexo.local

# Verificar se apps saíram de "Degraded" para "Healthy"
```

## 🐛 Troubleshooting

### Erro: ImagePullBackOff persiste

Se após aplicar secrets os pods ainda têm erro `ImagePullBackOff`:

1. **Verificar se secret existe:**

   ```bash
   kubectl get secret ghcr-secret -n nexo-develop
   ```

2. **Ver logs do pod:**

   ```bash
   kubectl describe pod <pod-name> -n nexo-develop
   # Procurar por "Events" no final
   ```

3. **Deletar e recriar secret:**

   ```bash
   kubectl delete secret ghcr-secret -n nexo-develop
   bash local/scripts/create-ghcr-secrets.sh
   kubectl rollout restart deployment -n nexo-develop
   ```

4. **Verificar token no GitHub:**
   - Acessar: https://github.com/settings/tokens
   - Verificar se token existe e tem scope `read:packages`
   - Se expirou, criar novo token e atualizar `.env`

### Erro: Token inválido

```bash
# Criar novo token
# 1. Acessar: https://github.com/settings/tokens/new
# 2. Selecionar scope: read:packages
# 3. Generate token
# 4. Copiar token

# Atualizar .env
vim .env
# Substituir linha: GITHUB_TOKEN=ghp_NOVO_TOKEN_AQUI

# Recriar secrets
bash local/scripts/create-ghcr-secrets.sh
```

### Apps não saem de "Degraded"

```bash
# 1. Ver detalhes da aplicação no ArgoCD
kubectl describe application nexo-be-develop -n argocd

# 2. Forçar sincronização
kubectl patch application nexo-be-develop -n argocd \
  --type merge \
  --patch '{"operation":{"initiatedBy":{"username":"admin"},"sync":{}}}'

# 3. Verificar Helm chart
kubectl get deployment nexo-be -n nexo-develop -o yaml | grep imagePullSecrets

# Deve mostrar:
#   imagePullSecrets:
#   - name: ghcr-secret
```

## 🎯 Workflow Completo

### Setup Inicial (primeira vez)

```bash
# 1. Criar ambiente
make setup

# 2. Aguardar setup completar (~10-15 min)

# 3. Aplicar secrets GitHub (token já está no .env)
bash local/scripts/create-ghcr-secrets.sh

# 4. Aguardar pods reiniciarem (~2-3 min)

# 5. Verificar status
make status

# Tudo deve estar "Healthy" e "Running"!
```

### Manutenção (quando token expira)

```bash
# 1. Criar novo token no GitHub
# https://github.com/settings/tokens/new?scopes=read:packages

# 2. Atualizar .env
vim .env
# GITHUB_TOKEN=ghp_NOVO_TOKEN

# 3. Recriar secrets
bash local/scripts/create-ghcr-secrets.sh

# 4. Reiniciar apps
kubectl rollout restart deployment -n nexo-develop
kubectl rollout restart deployment -n nexo-qa
kubectl rollout restart deployment -n nexo-staging
kubectl rollout restart deployment -n nexo-prod

# 5. Verificar
make status
```

## 📝 Notas

- ✅ **Token já configurado:** Não precisa criar novo, use o existente
- ✅ **Leitura automática:** Script lê do `.env` automaticamente
- ✅ **4 namespaces:** Secret é criado em todos os ambientes
- ✅ **Reinício automático:** Script sugere comandos de restart
- ⚠️ **Token expira:** Tokens GitHub Classic expiram, renove quando necessário
- ⚠️ **Público vs Privado:** Alternativamente, torne packages públicos no GitHub

## 🔗 Links Úteis

- **GitHub Tokens:** https://github.com/settings/tokens
- **Packages:** https://github.com/geraldobl58?tab=packages
- **Grafana:** http://grafana.nexo.local
- **ArgoCD:** http://argocd.nexo.local

---

**Última atualização:** 17 de fevereiro de 2026  
**Token atual:** Configurado no `.env`  
**Status:** ✅ Pronto para uso
