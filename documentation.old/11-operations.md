# 11 — Operações

> Comandos do dia-a-dia, scripts, rollback, scaling e manutenção.

---

## Scripts de Infraestrutura

### `infra/scripts/setup-doks.sh`

Provisiona toda a infraestrutura na DigitalOcean:

```bash
./infra/scripts/setup-doks.sh
```

**O que faz (em ordem):**

1. Cria cluster DOKS (se não existir)
2. Configura kubeconfig
3. Instala NGINX Ingress Controller
4. Cria namespaces
5. Instala ArgoCD
6. Aplica ArgoCD Projects e ApplicationSet
7. Exibe IP do Load Balancer e instruções de configuração DNS

### `infra/scripts/create-secrets.sh`

Cria todos os secrets Kubernetes nos 4 namespaces:

```bash
# Configurar variáveis antes de executar
export DB_HOST="seu-host.db.ondigitalocean.com"
export DB_PORT="25060"
export DB_USERNAME="doadmin"
export DB_PASSWORD="sua-senha"
export GHCR_TOKEN="ghp_seu_token"
export KC_ADMIN_PASS="senha-admin-keycloak"

./infra/scripts/create-secrets.sh
```

---

## Kubernetes — Comandos Essenciais

### Status Geral

```bash
# Todos os pods por namespace
kubectl get pods -n nexo-develop
kubectl get pods -n nexo-prod
kubectl get pods -A | grep nexo

# Status detalhado
kubectl get pods,svc,ingress -n nexo-develop

# Todos os recursos de um namespace
kubectl get all -n nexo-prod
```

### Pods

```bash
# Descrever pod (ver eventos, estado, etc.)
kubectl describe pod -l app.kubernetes.io/name=nexo-be -n nexo-develop

# Logs de um pod
kubectl logs -l app.kubernetes.io/name=nexo-be -n nexo-develop --tail=100

# Logs em tempo real
kubectl logs -l app.kubernetes.io/name=nexo-be -n nexo-develop -f

# Logs de container anterior (se reiniciou)
kubectl logs -l app.kubernetes.io/name=nexo-be -n nexo-develop --previous

# Shell dentro de um pod
kubectl exec -it deployment/nexo-be-develop -n nexo-develop -- sh

# Port forward para um pod
kubectl port-forward deployment/nexo-be-develop -n nexo-develop 3333:3000
```

### Deployments

```bash
# Status do rollout
kubectl rollout status deployment/nexo-be-develop -n nexo-develop

# Histórico de rollouts
kubectl rollout history deployment/nexo-be-develop -n nexo-develop

# Rollback para versão anterior
kubectl rollout undo deployment/nexo-be-develop -n nexo-develop

# Rollback para versão específica
kubectl rollout undo deployment/nexo-be-develop -n nexo-develop --to-revision=3

# Restart dos pods (força novo pull de imagem)
kubectl rollout restart deployment/nexo-be-develop -n nexo-develop

# Scale manual (temporário — HPA vai sobrescrever)
kubectl scale deployment/nexo-be-prod -n nexo-prod --replicas=5
```

### Secrets

```bash
# Listar secrets
kubectl get secrets -n nexo-develop

# Ver conteúdo de um secret
kubectl get secret nexo-db-secret -n nexo-develop -o jsonpath='{.data.DATABASE_URL}' | base64 -d
echo ""

# Editar um secret
kubectl edit secret nexo-db-secret -n nexo-develop

# Recriar um secret (delete + create)
kubectl delete secret nexo-db-secret -n nexo-develop
kubectl create secret generic nexo-db-secret \
  --namespace=nexo-develop \
  --from-literal=DATABASE_URL="postgresql://..."
```

### Ingress

```bash
# Ver ingresses e seus hosts
kubectl get ingress -A

# Detalhes de um ingress
kubectl describe ingress nexo-be-develop -n nexo-develop

# IP do Load Balancer
kubectl get svc ingress-nginx-controller -n ingress-nginx
```

### Certificados TLS

```bash
# Ver certificados
kubectl get certificates -A

# Status dos certificados
kubectl describe certificate nexo-be-prod-tls -n nexo-prod

# Ver challenges pendentes (se certificado não emitido)
kubectl get challenges -A
kubectl describe challenge -n nexo-prod
```

---

## ArgoCD — Operações

### Acesso

```bash
# Port forward
kubectl port-forward svc/argocd-server -n argocd 8443:443 &

# Login CLI
argocd login localhost:8443 --username admin --password $(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d) --insecure
```

### Operações Comuns

```bash
# Listar todas as apps
argocd app list

# Status detalhado
argocd app get nexo-be-develop

# Sync manual (obrigatório para prod)
argocd app sync nexo-be-prod
argocd app sync nexo-fe-prod
argocd app sync nexo-auth-prod

# Sync todos os serviços de prod
argocd app sync nexo-be-prod nexo-fe-prod nexo-auth-prod

# Refresh (verificar Git sem sync)
argocd app get nexo-be-develop --refresh

# Hard refresh (limpar cache)
argocd app get nexo-be-develop --refresh --hard-refresh

# Ver diff antes do sync
argocd app diff nexo-be-prod

# Histórico de sync
argocd app history nexo-be-prod

# Rollback ArgoCD
argocd app rollback nexo-be-prod <REVISION>
```

### Problemas com ArgoCD

```bash
# Reiniciar repo-server (resolve ComparisonError)
kubectl rollout restart deployment argocd-repo-server -n argocd

# Reiniciar ArgoCD completo
kubectl rollout restart deployment -n argocd

# Verificar logs
kubectl logs deployment/argocd-server -n argocd --tail=50
kubectl logs deployment/argocd-repo-server -n argocd --tail=50
```

---

## Deploy Manual (sem pipeline)

Em casos de emergência, é possível deployar manualmente:

### Via Helm

```bash
# Deploy direto com Helm (bypass ArgoCD)
helm upgrade --install nexo-be-develop infra/helm/nexo-be/ \
  -f infra/helm/nexo-be/values.yaml \
  -f infra/helm/nexo-be/values-develop.yaml \
  -n nexo-develop

# Com tag específica
helm upgrade --install nexo-be-develop infra/helm/nexo-be/ \
  -f infra/helm/nexo-be/values.yaml \
  -f infra/helm/nexo-be/values-develop.yaml \
  -n nexo-develop \
  --set image.tag="develop-abc1234"
```

> ⚠ **Atenção:** Deploy manual via Helm causa drift com o ArgoCD. Após resolver o problema, force um sync do ArgoCD para re-alinhar.

### Via kubectl (imagem específica)

```bash
# Trocar imagem diretamente
kubectl set image deployment/nexo-be-develop nexo-be=ghcr.io/geraldobl58/nexo-be:develop-abc1234 -n nexo-develop
```

---

## Scaling

### HPA (Automático)

```bash
# Ver status do HPA
kubectl get hpa -n nexo-prod

# Detalhes
kubectl describe hpa nexo-be-prod -n nexo-prod
```

### Manual (Temporário)

```bash
# Escalar para cima
kubectl scale deployment/nexo-be-prod -n nexo-prod --replicas=5

# Escalar para baixo
kubectl scale deployment/nexo-be-prod -n nexo-prod --replicas=2
```

> **Nota:** Se o HPA estiver ativo, ele vai recalcular e potencialmente ajustar o número de réplicas. Para override permanente, altere o `values-prod.yaml`.

---

## Backup e Restore

### Banco de Dados

A DigitalOcean Managed Database oferece backups automáticos:

1. **Painel DO** → **Databases** → `nexo-db` → **Backups**
2. Retenção: 7 dias de backups diários automáticos
3. **Restore:** Cria novo cluster a partir do backup

### Backup Manual

```bash
# Dump do banco de produção
pg_dump "postgresql://doadmin:SENHA@host:25060/nexo_app?sslmode=require" > backup_nexo_app_$(date +%Y%m%d).sql

# Dump do Keycloak
pg_dump "postgresql://doadmin:SENHA@host:25060/nexo_keycloak?sslmode=require" > backup_nexo_kc_$(date +%Y%m%d).sql

# Restore
psql "postgresql://doadmin:SENHA@host:25060/nexo_app?sslmode=require" < backup_nexo_app_20260213.sql
```

### Kubernetes Resources

```bash
# Exportar todos os manifests de um namespace
kubectl get all -n nexo-prod -o yaml > nexo-prod-backup.yaml

# Exportar secrets (cuidado com dados sensíveis)
kubectl get secrets -n nexo-prod -o yaml > nexo-prod-secrets.yaml
```

---

## Atualização do Cluster

### DOKS Version Upgrade

```bash
# Ver versões disponíveis
doctl kubernetes options versions

# Upgrade do cluster (rolling update dos nodes)
doctl kubernetes cluster update nexo-cluster --version <slug>
```

### Atualizar Componentes

```bash
# NGINX Ingress
helm repo update
helm upgrade ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx

# cert-manager (gerencia certificados Let's Encrypt para *.g3developer.online)
helm upgrade cert-manager jetstack/cert-manager -n cert-manager --set crds.enabled=true

# ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

## Monitoramento de Custos

```bash
# Ver nodes e seus tamanhos
kubectl get nodes -o custom-columns=NAME:.metadata.name,TYPE:.metadata.labels.doks\\.digitalocean\\.com/node-pool,CAPACITY_CPU:.status.capacity.cpu,CAPACITY_MEM:.status.capacity.memory

# Ver uso de recursos por namespace
kubectl top pods -n nexo-prod
kubectl top nodes

# Via doctl
doctl kubernetes cluster list
doctl balance get
```

---

## Próximo Passo

→ [12 — Troubleshooting](12-troubleshooting.md)
