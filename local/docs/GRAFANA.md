# 📊 Grafana - Monitoramento do CloudLab Nexo

## 🔐 Acesso

**URL:** http://grafana.nexo.local

**Credenciais:**

- **Usuário:** `admin`
- **Senha:** `nexo@local2026`

## 🎯 O que está configurado

### Datasources

- ✅ **Prometheus** (default) - Coleta métricas de:
  - Cluster Kubernetes (nodes, pods, containers)
  - NGINX Ingress Controller
  - Aplicações Nexo (nexo-be, nexo-fe, nexo-auth)
  - AlertManager

### Dashboards Pré-configurados

Acesse: **Dashboards → Browse**

1. **Kubernetes Cluster** (GNetID: 7249)
   - Overview do cluster
   - Uso de CPU/Memory por namespace
   - Network I/O

2. **Kubernetes Pods** (GNetID: 6417)
   - Status dos pods
   - Resource requests/limits
   - Pod restarts

3. **Node Exporter** (GNetID: 1860)
   - Métricas dos nodes
   - Disk I/O, CPU, Memory
   - Network traffic

4. **NGINX Ingress** (GNetID: 9614)
   - Request rate
   - Error rate
   - Latency (P50, P95, P99)
   - HTTP status codes

## 📦 Namespaces Monitorados

Os seguintes namespaces estão configurados para coleta de métricas:

- `argocd` - ArgoCD + Applications
- `monitoring` - Prometheus, Grafana, AlertManager
- `ingress-nginx` - NGINX Ingress Controller
- `nexo-develop` - Apps em desenvolvimento
- `nexo-prod` - Apps em produção

### ServiceMonitors Criados

```bash
# Ver ServiceMonitors ativos
kubectl get servicemonitor -A
```

**Serviços monitorados:**

- `nexo-be` (develop + prod) - Backend NestJS em `/metrics`
- `nexo-fe` (develop + prod) - Frontend Next.js em `/api/metrics`
- `nexo-auth` (develop + prod) - Keycloak em `/metrics`

## 📈 Criando Dashboards Customizados

### 1. Importar Dashboard da Galeria

1. Click em **+ (Create)** → **Import**
2. Insira um **Dashboard ID** do [Grafana.com](https://grafana.com/grafana/dashboards/)
3. Selecione **Prometheus** como datasource
4. Click em **Import**

**Dashboards recomendados:**

- **315** - Kubernetes cluster monitoring
- **6417** - Kubernetes pod overview
- **13332** - Application metrics (para apps com métricas Prometheus)
- **12708** - Node Exporter (detalhado)

### 2. Criar Dashboard do Zero

1. Click em **+ (Create)** → **Dashboard**
2. **Add visualization**
3. Selecione **Prometheus** datasource
4. Escreva sua query PromQL

**Exemplos de queries úteis:**

```promql
# CPU usage por namespace
sum(rate(container_cpu_usage_seconds_total{namespace="nexo-develop"}[5m])) by (pod)

# Memory usage por pod
sum(container_memory_working_set_bytes{namespace="nexo-develop"}) by (pod)

# Request rate (se app expõe métricas)
sum(rate(http_requests_total{namespace="nexo-develop"}[5m])) by (pod)

# Pod restarts
kube_pod_container_status_restarts_total{namespace="nexo-develop"}

# NGINX request rate
sum(rate(nginx_ingress_controller_requests[5m])) by (ingress)

# NGINX error rate (5xx)
sum(rate(nginx_ingress_controller_requests{status=~"5.."}[5m]))
```

## 🔔 Alertas

Acesse: **Alerting → Alert rules**

AlertManager está configurado em: http://alertmanager.nexo.local

### Criar Alert Rule

1. **Alerting** → **Alert rules** → **+ New alert rule**
2. Configure:
   - **Query:** PromQL para condição de alerta
   - **Condition:** Threshold (limiar)
   - **Evaluation:** Frequência de avaliação
3. **Save rule and exit**

**Exemplo de alert:**

```yaml
# CPU alto
expr: sum(rate(container_cpu_usage_seconds_total{namespace="nexo-develop"}[5m])) > 0.8
for: 5m
labels:
  severity: warning
annotations:
  summary: "CPU alto em nexo-develop"
```

## 🔍 Explorando Métricas

### Explore View

1. Click em **Explore** (ícone de bússola no menu lateral)
2. Selecione **Prometheus**
3. Use o **Metrics browser** para explorar métricas disponíveis
4. Execute queries e visualize resultados

### Métricas importantes

**Cluster:**

- `kube_node_status_condition` - Status dos nodes
- `kube_pod_status_phase` - Fase dos pods
- `kube_deployment_status_replicas` - Replicas dos deployments

**Recursos:**

- `container_cpu_usage_seconds_total` - CPU usage
- `container_memory_working_set_bytes` - Memory usage
- `container_network_receive_bytes_total` - Network RX
- `container_network_transmit_bytes_total` - Network TX

**Aplicações (se exportam métricas):**

- `http_requests_total` - Total de requests HTTP
- `http_request_duration_seconds` - Latência
- `process_resident_memory_bytes` - Memory da aplicação

## 🛠️ Troubleshooting

### Grafana não carrega

```bash
# Ver logs do Grafana
kubectl logs -n monitoring -l app.kubernetes.io/name=grafana --tail=100

# Restart do Grafana
kubectl rollout restart deployment -n monitoring kube-prometheus-stack-grafana
```

### Senha não funciona

```bash
# Obter senha do secret
kubectl get secret -n monitoring kube-prometheus-stack-grafana \
  -o jsonpath="{.data.admin-password}" | base64 -d && echo

# Reset da senha (se necessário)
kubectl delete secret -n monitoring kube-prometheus-stack-grafana
helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring --reuse-values
```

### Prometheus não coleta métricas

```bash
# Ver targets do Prometheus
# Acesse: http://prometheus.nexo.local/targets

# Verificar ServiceMonitors
kubectl get servicemonitor -A

# Verificar configuração do Prometheus
kubectl get prometheus -n monitoring kube-prometheus-stack-prometheus -o yaml
```

### Alertas não funcionam

```bash
# Ver status do AlertManager
# Acesse: http://alertmanager.nexo.local

# Ver configuração de alerts
kubectl get prometheusrule -n monitoring

# Ver logs do AlertManager
kubectl logs -n monitoring -l app.kubernetes.io/name=alertmanager
```

## 📚 Recursos

- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)

## 🎓 Próximos Passos

1. ✅ Configurar alertas para CPU/Memory alto
2. ✅ Criar dashboard customizado para apps Nexo
3. ✅ Configurar notificações (Discord, Slack, email)
4. ✅ Adicionar mais ServiceMonitors conforme necessário
5. ✅ Explorar Recording Rules para queries complexas

---

**Happy monitoring! 📊**
