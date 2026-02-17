# 10 — Observabilidade

> Observabilidade da plataforma Nexo baseada em health checks nativos do Kubernetes e logs via `kubectl`.

> **Nota:** O stack de monitoring (Prometheus, Grafana, Alertmanager, Loki) foi removido definitivamente. O Grafana não funciona sozinho — ele precisa do Prometheus para coletar métricas dos apps. Como não usamos Prometheus, o Grafana não tem utilidade. A observabilidade é feita via recursos nativos do Kubernetes.

---

## Visão Geral

| Pilar        | Ferramenta                | Propósito                            |
| ------------ | ------------------------- | ------------------------------------ |
| **Saúde**    | Liveness/Readiness Probes | Kubernetes verifica se pods estão ok |
| **Logs**     | `kubectl logs`            | Visualização de logs dos containers  |
| **Métricas** | `kubectl top`             | CPU e memória dos pods/nodes         |
| **Status**   | ArgoCD Dashboard          | Status de sync e deploy dos apps     |

---

## Health Checks

### nexo-be

| Probe     | Path      | Port | Delay | Period |
| --------- | --------- | ---- | ----- | ------ |
| Liveness  | `/health` | 3000 | 30s   | 10s    |
| Readiness | `/health` | 3000 | 5s    | 10s    |

### nexo-fe

| Probe     | Path | Port | Delay | Period |
| --------- | ---- | ---- | ----- | ------ |
| Liveness  | `/`  | 3000 | 10s   | 10s    |
| Readiness | `/`  | 3000 | 5s    | 10s    |

### nexo-auth

| Probe     | Path            | Port | Delay | Period |
| --------- | --------------- | ---- | ----- | ------ |
| Liveness  | `/health/live`  | 9000 | 90s   | 10s    |
| Readiness | `/health/ready` | 9000 | 60s   | 10s    |

> **Nota:** Keycloak tem delays maiores porque demora mais para inicializar (boot + build de themes + conexão com DB).

---

## Logs

### Comandos Úteis

```bash
# Logs do backend (develop)
kubectl logs -n nexo-develop -l app=nexo-be --tail=100 -f

# Logs do frontend (develop)
kubectl logs -n nexo-develop -l app=nexo-fe --tail=100 -f

# Logs do Keycloak (develop)
kubectl logs -n nexo-develop -l app=nexo-auth --tail=100 -f

# Logs de produção
kubectl logs -n nexo-prod -l app=nexo-be --tail=100 -f

# Filtrar apenas erros
kubectl logs -n nexo-prod -l app=nexo-be --tail=500 | grep -i error

# Logs de um pod específico
kubectl logs -n nexo-develop <nome-do-pod> -f

# Logs de containers em restart (ver logs do crash anterior)
kubectl logs -n nexo-develop <nome-do-pod> --previous
```

---

## Métricas de Recursos

```bash
# CPU e memória por pod
kubectl top pods -n nexo-develop
kubectl top pods -n nexo-prod

# CPU e memória por node
kubectl top nodes

# Verificar limits e requests
kubectl describe pod -n nexo-develop -l app=nexo-be | grep -A5 "Limits\|Requests"

# Verificar HPA (autoscaling)
kubectl get hpa -n nexo-develop
kubectl get hpa -n nexo-prod
```

---

## Diagnóstico Rápido

```bash
# Status de todos os pods
kubectl get pods -n nexo-develop
kubectl get pods -n nexo-prod

# Pods com problemas
kubectl get pods -n nexo-develop --field-selector=status.phase!=Running

# Detalhes de um pod com erro
kubectl describe pod -n nexo-develop <nome-do-pod>

# Events recentes (ajuda a diagnosticar crashes)
kubectl get events -n nexo-develop --sort-by='.lastTimestamp' | tail -20

# Verificar restarts
kubectl get pods -n nexo-develop -o wide | awk '{print $1, $4}'
```

---

## ArgoCD como Dashboard

O ArgoCD serve como dashboard principal para status dos deploys:

- **URL**: https://argocd.g3developer.online
- **Status de sync**: verde (Synced) / vermelho (OutOfSync)
- **Health**: Healthy / Degraded / Progressing
- **Logs**: Disponível na UI do ArgoCD por pod

---

## ServiceMonitor (Desabilitado)

Os Helm charts ainda contêm templates de `ServiceMonitor`, mas estão **desabilitados** em todos os ambientes (`metrics.serviceMonitor.enabled: false`). Podem ser reativados no futuro caso o stack de monitoramento seja reimplantado.

---

## Próximo Passo

→ [11 — Operações](11-operations.md)
