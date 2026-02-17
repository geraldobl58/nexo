# 12 — Troubleshooting

> Problemas comuns, diagnóstico e soluções.

---

## Árvore de Decisão

```
Pod não funciona?
├── Pod não existe → Verificar ArgoCD sync e Helm values
├── Pod em CrashLoopBackOff → Ver logs do pod (seção 1)
├── Pod em ImagePullBackOff → Verificar ghcr-secret (seção 2)
├── Pod em Pending → Verificar recursos do node (seção 3)
├── Pod Running mas erro 502/504 → Verificar Ingress e Service (seção 4)
├── Pod Running mas erro 500 → Verificar variáveis de ambiente (seção 5)
└── Certificado TLS inválido → Verificar cert-manager e Let's Encrypt (seção 6)
```

---

## 1. CrashLoopBackOff

O pod inicia e morre repetidamente.

### Diagnóstico

```bash
# Ver status e restarts
kubectl get pods -n nexo-develop -w

# Logs do container atual
kubectl logs -l app.kubernetes.io/name=nexo-be -n nexo-develop --tail=50

# Logs do container anterior (que crashou)
kubectl logs -l app.kubernetes.io/name=nexo-be -n nexo-develop --previous

# Eventos do pod
kubectl describe pod -l app.kubernetes.io/name=nexo-be -n nexo-develop | grep -A 20 "Events:"
```

### Causas Comuns

| Causa               | Sintoma no Log                                  | Solução                                 |
| ------------------- | ----------------------------------------------- | --------------------------------------- |
| DATABASE_URL errado | `Error: P1001: Can't reach database server`     | Verificar secret `nexo-db-secret`       |
| Banco não existe    | `database "nexo_app" does not exist`            | Criar banco no DO Managed Database      |
| Migration falhou    | `Error: P3009: migrate found failed migrations` | Rodar `prisma migrate reset`            |
| Keycloak DB errado  | `Failed to obtain JDBC connection`              | Verificar secret `nexo-auth-db-secret`  |
| Port conflict       | `EADDRINUSE 0.0.0.0:3000`                       | Verificar se containerPort está correto |
| OOM Kill            | `OOMKilled` em `kubectl describe`               | Aumentar `resources.limits.memory`      |

### Soluções

```bash
# Verificar DATABASE_URL
kubectl get secret nexo-db-secret -n nexo-develop -o jsonpath='{.data.DATABASE_URL}' | base64 -d
echo ""

# Testar conexão com banco de dentro do cluster
kubectl run pg-test --rm -it --image=postgres:16-alpine -n nexo-develop -- psql "$(kubectl get secret nexo-db-secret -n nexo-develop -o jsonpath='{.data.DATABASE_URL}' | base64 -d)"

# Recriar secret com URL correta
kubectl delete secret nexo-db-secret -n nexo-develop
kubectl create secret generic nexo-db-secret -n nexo-develop \
  --from-literal=DATABASE_URL="postgresql://user:pass@host:25060/nexo_app?sslmode=require"

# Restart do deployment
kubectl rollout restart deployment/nexo-be-develop -n nexo-develop
```

---

## 2. ImagePullBackOff

O Kubernetes não consegue baixar a imagem Docker.

### Diagnóstico

```bash
kubectl describe pod -l app.kubernetes.io/name=nexo-be -n nexo-develop | grep -A 5 "Events:"
# Procurar: "Failed to pull image" ou "unauthorized"
```

### Causas e Soluções

| Causa               | Solução                                          |
| ------------------- | ------------------------------------------------ |
| GHCR secret ausente | Criar `ghcr-secret` com `create-secrets.sh`      |
| Token GHCR expirado | Gerar novo PAT no GitHub e recriar secret        |
| Imagem não existe   | Verificar se pipeline buildou e pushsou a imagem |
| Tag errada          | Verificar `image.tag` no values file             |

```bash
# Verificar se ghcr-secret existe
kubectl get secret ghcr-secret -n nexo-develop

# Verificar se a imagem existe
docker pull ghcr.io/geraldobl58/nexo-be:develop

# Recriar secret
kubectl delete secret ghcr-secret -n nexo-develop
kubectl create secret docker-registry ghcr-secret -n nexo-develop \
  --docker-server=ghcr.io \
  --docker-username=geraldobl58 \
  --docker-password=ghp_SEU_TOKEN
```

---

## 3. Pod em Pending

O pod não consegue ser agendado em nenhum node.

### Diagnóstico

```bash
kubectl describe pod <pod-name> -n nexo-develop | grep -A 10 "Events:"
# Procurar: "Insufficient cpu" ou "Insufficient memory"

# Ver recursos disponíveis
kubectl top nodes
kubectl describe nodes | grep -A 5 "Allocated resources"
```

### Soluções

| Causa                   | Solução                                         |
| ----------------------- | ----------------------------------------------- |
| Sem recursos            | Reduzir `resources.requests` ou adicionar nodes |
| PVC sem storage         | Criar PersistentVolume                          |
| Node selector sem match | Verificar labels dos nodes                      |

```bash
# Adicionar node pool
doctl kubernetes cluster node-pool create nexo-cluster \
  --name nexo-extra \
  --size s-2vcpu-4gb \
  --count 1

# Ou habilitar auto-scale
doctl kubernetes cluster node-pool update nexo-cluster nexo-workers \
  --auto-scale --min-nodes 2 --max-nodes 5
```

---

## 4. Erro 502 / 504 (Bad Gateway / Timeout)

O Ingress não consegue se comunicar com o pod.

### Diagnóstico

```bash
# Verificar se o Service existe e tem endpoints
kubectl get endpoints nexo-be-develop -n nexo-develop
# Se "ENDPOINTS" estiver vazio → pod não está healthy

# Verificar Ingress
kubectl describe ingress nexo-be-develop -n nexo-develop

# Testar Service internamente
kubectl run curl-test --rm -it --image=curlimages/curl -n nexo-develop -- \
  curl -v http://nexo-be-develop:3000/health
```

### Causas e Soluções

| Causa                     | Solução                                        |
| ------------------------- | ---------------------------------------------- |
| Pod não está Ready        | Verificar readinessProbe e logs                |
| Service port errada       | Verificar `container.port` no values           |
| Service selector não bate | Verificar labels do pod vs selector do Service |
| Health check falhando     | Verificar endpoint de health                   |

```bash
# Verificar health internamente
kubectl exec deployment/nexo-be-develop -n nexo-develop -- wget -qO- http://localhost:3000/health

# Verificar se a porta está aberta
kubectl exec deployment/nexo-be-develop -n nexo-develop -- netstat -tlnp
```

---

## 5. Erro 500 (Internal Server Error)

A aplicação está rodando mas retorna erros.

### Diagnóstico

```bash
# Logs com detalhes do erro
kubectl logs -l app.kubernetes.io/name=nexo-be -n nexo-develop --tail=100 | grep -i error

# Verificar variáveis de ambiente
kubectl exec deployment/nexo-be-develop -n nexo-develop -- env | sort
```

### Causas Comuns

| Causa                      | Variável         | Solução                                                                     |
| -------------------------- | ---------------- | --------------------------------------------------------------------------- |
| API_URL errado no frontend | `API_URL`        | Verificar se aponta para service name correto (`http://nexo-be-<env>:3000`) |
| KEYCLOAK_URL errado        | `KEYCLOAK_URL`   | Deve ser URL **externo** (deve bater com `iss` claim do token)              |
| JWT issuer mismatch        | `KEYCLOAK_URL`   | URL no backend DEVE ser idêntico ao que o Keycloak usa como issuer          |
| Frontend 404 em assets     | Build do Next.js | Verificar se `standalone` output está correto                               |

### JWT Issuer Mismatch

O erro mais sutil: o backend rejeita tokens com "invalid issuer".

```
Token iss:  https://auth.g3developer.online/realms/nexo
Backend:    http://nexo-auth-prod:8080/realms/nexo  ← ERRADO!
```

**Solução:** `KEYCLOAK_URL` no backend deve ser o URL **externo** (`https://auth.g3developer.online`), não o interno. Use `KEYCLOAK_INTERNAL_URL` separado para JWKS fetch.

---

## 6. Certificado TLS Inválido

O browser mostra "Certificate not valid" ou "NET::ERR_CERT_AUTHORITY_INVALID".

### Diagnóstico

```bash
# Verificar status dos certificados
kubectl get certificates -A

# Verificar challenges pendentes
kubectl get challenges -A

# Descrever certificado com problema
kubectl describe certificate <cert-name> -n <namespace>

# Verificar logs do cert-manager
kubectl logs -l app=cert-manager -n cert-manager --tail=50
```

### Causas Comuns

| Causa                        | Solução                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Challenge HTTP-01 falhando   | Verificar se o Ingress está acessível publicamente e DNS propaga corretamente |
| Rate limit Let's Encrypt     | Aguardar reset do rate limit (1h para falhas, 1 semana para duplicatas)       |
| ClusterIssuer não encontrado | Verificar: `kubectl get clusterissuer letsencrypt-prod`                       |
| cert-manager não instalado   | Reinstalar via `setup-doks.sh` ou manualmente                                 |

> **Nota:** O projeto usa Let's Encrypt via `letsencrypt-prod` ClusterIssuer. Certificados são emitidos automaticamente para cada Ingress com a annotation `cert-manager.io/cluster-issuer: "letsencrypt-prod"`.

---

## 7. Pipeline GitHub Actions

### Pipeline não dispara

| Verificação            | Comando/Check                                          |
| ---------------------- | ------------------------------------------------------ |
| Branch correta?        | Push deve ser em `develop` ou `main`                   |
| Arquivos corretos?     | Mudanças devem estar em `apps/**`, `packages/**`, etc. |
| `[skip ci]` no commit? | Commit de deploy tem `[skip ci]` — é intencional       |
| Workflow disabled?     | GitHub → Actions → o workflow está habilitado?         |

### Build Docker falha

```bash
# Verificar localmente
docker build -t test-be -f apps/nexo-be/Dockerfile .
docker build -t test-fe -f apps/nexo-fe/Dockerfile .
```

### Deploy não atualiza o cluster

1. Pipeline commitou o values file? → Verificar commit `[skip ci]` no Git
2. ArgoCD viu a mudança? → `argocd app get nexo-be-develop --refresh`
3. ArgoCD tentou sync? → Verificar no ArgoCD UI
4. Sync falhou? → Ver eventos no ArgoCD

---

## 8. Keycloak

### Login page não carrega

```bash
# Verificar logs do Keycloak
kubectl logs -l app.kubernetes.io/name=nexo-auth -n nexo-develop --tail=50

# Causas comuns:
# 1. Pod ainda está inicializando (demora ~2min)
# 2. Banco não acessível
# 3. KC_HOSTNAME errado
```

### "Invalid redirect URI"

O redirect URI usado pelo frontend não está na lista de URIs permitidos no Keycloak.

**Solução:** Keycloak Admin → Clients → `nexo-web` → Valid redirect URIs → Adicionar:

- `https://develop.g3developer.online/*` (para develop)
- `https://app.g3developer.online/*` (para prod)

### "HTTPS required"

Keycloak em modo `start` (produção) requer HTTPS.

**Solução:** Verificar se o Ingress está configurado com TLS e o certificado foi emitido.

---

## 9. Performance

### Pod reinicia por OOM

```bash
# Verificar uso de memória
kubectl top pods -n nexo-prod

# Aumentar limits
# Editar valores em infra/helm/nexo-be/values-prod.yaml
resources:
  limits:
    memory: 2048Mi  # Aumentar de 1024Mi
```

### Latência alta

```bash
# Verificar métricas de CPU
kubectl top pods -n nexo-prod

# Verificar se HPA está no limite
kubectl get hpa -n nexo-prod

# Verificar logs para diagnosticar latência
# kubectl logs -n nexo-prod -l app=nexo-be --tail=100
```

### Database lento

```bash
# Verificar no painel DO
# Databases → nexo-db → Metrics → CPU, Memory, Connections

# Se necessário, upgrade do plano
# Databases → nexo-db → Settings → Resize
```

---

## 10. Comandos de Emergência

```bash
# ⚠ Restart total de um namespace
kubectl rollout restart deployment -n nexo-develop

# ⚠ Deletar todos os pods (serão recriados)
kubectl delete pods --all -n nexo-develop

# ⚠ Scale down completo (downtime)
kubectl scale deployment --all -n nexo-develop --replicas=0

# ⚠ Scale up novamente
kubectl scale deployment --all -n nexo-develop --replicas=1

# ⚠ Rollback do último deploy
kubectl rollout undo deployment/nexo-be-prod -n nexo-prod

# ⚠ Forçar ArgoCD sync com replacement
argocd app sync nexo-be-prod --force --replace
```

---

## Guia de Referência Rápida

```bash
# ─── STATUS ───────────────────────────────
kubectl get pods -n nexo-<env>                    # Pods
kubectl get svc,ingress -n nexo-<env>             # Services + Ingress
kubectl get hpa -n nexo-<env>                     # Autoscaling
kubectl top pods -n nexo-<env>                    # CPU/Memory
argocd app list                                    # ArgoCD apps

# ─── LOGS ─────────────────────────────────
kubectl logs -l app.kubernetes.io/name=nexo-be -n nexo-<env> -f     # Backend
kubectl logs -l app.kubernetes.io/name=nexo-fe -n nexo-<env> -f     # Frontend
kubectl logs -l app.kubernetes.io/name=nexo-auth -n nexo-<env> -f   # Keycloak

# ─── DEBUG ────────────────────────────────
kubectl describe pod <pod> -n nexo-<env>          # Pod details
kubectl exec -it <pod> -n nexo-<env> -- sh        # Shell
kubectl get events -n nexo-<env> --sort-by='.lastTimestamp'  # Events

# ─── RECOVER ─────────────────────────────
kubectl rollout restart deployment/nexo-be-<env> -n nexo-<env>   # Restart
kubectl rollout undo deployment/nexo-be-<env> -n nexo-<env>      # Rollback
argocd app sync nexo-be-<env>                                      # ArgoCD sync
```
