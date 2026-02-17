# 📊 Grafana Dashboards - Nexo CloudLab

## 🎯 Dashboards Pré-Instalados

O CloudLab já vem com **4 dashboards profissionais** instalados automaticamente:

| Dashboard          | ID   | Descrição                                       |
| ------------------ | ---- | ----------------------------------------------- |
| Kubernetes Cluster | 7249 | Métricas gerais do cluster (CPU, memória, pods) |
| Kubernetes Pods    | 6417 | Detalhes de pods (recursos, restarts, status)   |
| Node Exporter      | 1860 | Métricas de hardware dos nodes (27 versões)     |
| NGINX Ingress      | 9614 | Tráfego HTTP, requests, latência do Ingress     |

### Como Acessar

1. **URL:** http://grafana.nexo.local
2. **Login:**
   - Usuário: `admin`
   - Senha: `nexo@local2026`

3. **Navegar:**
   - Home → Dashboards → Default
   - Ou clicar no ícone de grade (☰) → Dashboards

**Nota:** Os dashboards podem levar 2-3 minutos para aparecer após o setup inicial.

---

## 📈 Dashboards Disponíveis

### 1. Kubernetes Cluster (ID: 7249)

**Visão geral do cluster:**

- Total de pods por namespace
- Uso de CPU e memória do cluster
- Network I/O
- Storage disponível
- Pods em diferentes estados (Running, Pending, Failed)

**Uso:** Monitoramento geral da saúde do cluster

### 2. Kubernetes Pods (ID: 6417)

**Detalhes por pod:**

- Uso individual de CPU/memória por pod
- Contagem de restarts
- Status de readiness e liveness
- Logs de erros
- Network por pod

**Uso:** Debug de pods específicos com problemas

### 3. Node Exporter (ID: 1860)

**Métricas de hardware:**

- CPU usage por core
- Memória (used, cached, buffered)
- Disk I/O
- Network throughput
- File system usage
- Load average

**Uso:** Monitorar recursos físicos dos nodes

### 4. NGINX Ingress (ID: 9614)

**Métricas HTTP:**

- Requests por segundo
- Latência de requests (P50, P95, P99)
- Status codes (200, 400, 500, etc.)
- Throughput de network
- Upstream latência

**Uso:** Monitorar tráfego HTTP e performance das aplicações

---

## 🎨 Criar Dashboards Customizados

### Dashboard para Nexo Backend

**Métricas recomendadas:**

```promql
# Taxa de requests HTTP
rate(http_requests_total{job="nexo-be"}[5m])

# Latência P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="nexo-be"}[5m]))

# Taxa de erros
rate(http_requests_total{job="nexo-be", status=~"5.."}[5m])

# Uso de memória
container_memory_usage_bytes{pod=~"nexo-be-.*"}

# Uso de CPU
rate(container_cpu_usage_seconds_total{pod=~"nexo-be-.*"}[5m])

# Database connections
pg_stat_database_numbackends{datname="nexo"}
```

### Dashboard para Nexo Frontend

**Métricas recomendadas:**

```promql
# Page load time
histogram_quantile(0.95, rate(nextjs_page_load_duration_bucket[5m]))

# Requests para API
rate(http_requests_total{job="nexo-fe", path=~"/api/.*"}[5m])

# Cache hit rate
rate(nextjs_cache_hits_total[5m]) / rate(nextjs_cache_requests_total[5m])

# Build size
nextjs_build_size_bytes

# Active users (se instrumentado)
sum(rate(nextjs_page_views_total[1m]))
```

---

## 🛠️ Como Adicionar Dashboard Manualmente

### Método 1: Via UI (Recomendado)

1. Acessar Grafana: http://grafana.nexo.local
2. Fazer login (admin / nexo@local2026)
3. Clicar em "+" no menu lateral → "Import"
4. **Opção A:** Digitar ID do Grafana.com (ex: 1860)
5. **Opção B:** Colar JSON do dashboard
6. Selecionar datasource: "Prometheus"
7. Clicar "Import"

### Método 2: Via ConfigMap

Criar um ConfigMap com o dashboard JSON:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nexo-dashboard
  namespace: monitoring
  labels:
    grafana_dashboard: "1"
data:
  nexo-dashboard.json: |
    {
      "dashboard": {
        "title": "Nexo Applications",
        "panels": [
          {
            "title": "CPU Usage",
            "targets": [
              {
                "expr": "rate(container_cpu_usage_seconds_total{namespace=~\"nexo-.*\"}[5m])"
              }
            ]
          }
        ]
      }
    }
```

Aplicar:

```bash
kubectl apply -f nexo-dashboard.yaml
```

O Grafana detecta automaticamente ConfigMaps com label `grafana_dashboard: "1"`.

---

## 🔍 Dashboards Recomendados do Grafana.com

### Para Kubernetes

| ID    | Nome                            | Descrição                      |
| ----- | ------------------------------- | ------------------------------ |
| 15757 | Kubernetes / Views / Global     | Visão global avançada          |
| 15758 | Kubernetes / Views / Namespaces | Por namespace                  |
| 15759 | Kubernetes / Views / Pods       | Detalhes de pods               |
| 13824 | Istio Service Dashboard         | Se usar Istio (não usado aqui) |

### Para Node.js / NestJS

| ID    | Nome                | Descrição                        |
| ----- | ------------------- | -------------------------------- |
| 11159 | Node.js Application | Métricas gerais de Node.js       |
| 12486 | Node Exporter Full  | Versão completa do Node Exporter |

### Para PostgreSQL

| ID    | Nome                | Descrição                         |
| ----- | ------------------- | --------------------------------- |
| 9628  | PostgreSQL Database | Métricas de database              |
| 12485 | PostgreSQL Exporter | Completo com queries, locks, etc. |

### Para Ingress/Nginx

| ID    | Nome                     | Descrição       |
| ----- | ------------------------ | --------------- |
| 9614  | NGINX Ingress Controller | ✅ Já instalado |
| 14314 | NGINX Ingress - Advanced | Versão avançada |

**Como importar:**

1. Acessar http://grafana.nexo.local
2. "+" → "Import"
3. Digitar o ID
4. Selecionar datasource "Prometheus"
5. Import

---

## 📊 Dashboard Customizado: Nexo Full Stack

### JSON Template

```json
{
  "dashboard": {
    "title": "Nexo Full Stack Monitoring",
    "timezone": "America/Sao_Paulo",
    "panels": [
      {
        "title": "Backend - Requests/sec",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{namespace=~\"nexo-.*\", job=\"nexo-be\"}[5m])) by (namespace)"
          }
        ]
      },
      {
        "title": "Backend - Response Time (P95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{namespace=~\"nexo-.*\", job=\"nexo-be\"}[5m])) by (namespace, le))"
          }
        ]
      },
      {
        "title": "Frontend - Page Views",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate(nextjs_page_views_total{namespace=~\"nexo-.*\"}[1m]))"
          }
        ]
      },
      {
        "title": "Database - Connections",
        "type": "gauge",
        "targets": [
          {
            "expr": "sum(pg_stat_database_numbackends{namespace=~\"nexo-.*\"}) by (namespace)"
          }
        ]
      },
      {
        "title": "Keycloak - Active Sessions",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(keycloak_user_sessions{namespace=~\"nexo-.*\"}) by (namespace)"
          }
        ]
      },
      {
        "title": "Pods - Status por Ambiente",
        "type": "table",
        "targets": [
          {
            "expr": "count(kube_pod_status_phase{namespace=~\"nexo-.*\"}) by (namespace, phase)"
          }
        ]
      }
    ]
  }
}
```

**Como usar:**

1. Copiar o JSON acima
2. Acessar Grafana → "+" → "Import"
3. Colar JSON
4. Ajustar datasource se necessário
5. Salvar

---

## 🚨 Alertas Customizados

### Criar Alerta para CPU Alto

1. **Abrir dashboard** com painel de CPU
2. **Editar painel** → "Alert" tab
3. **Configurar:**
   - Condição: `avg() > 80`
   - Durante: `5m`
   - Avaliação: `1m`
4. **Notificação:** Escolher canal (email, Slack, etc.)
5. **Salvar**

### Alertas Recomendados

| Métrica              | Condição | Threshold | Duração |
| -------------------- | -------- | --------- | ------- |
| CPU Usage            | >        | 80%       | 5m      |
| Memory Usage         | >        | 90%       | 5m      |
| Pod Restarts         | rate > 0 | 2         | 5m      |
| HTTP 5xx Errors      | rate >   | 10/s      | 1m      |
| Response Time P95    | >        | 1s        | 5m      |
| Database Connections | >        | 90        | 1m      |

---

## 🔧 Troubleshooting Dashboards

### Dashboards Não Aparecem

**Verificar:**

```bash
# Ver se Grafana está rodando
kubectl get pods -n monitoring | grep grafana

# Ver logs do Grafana
kubectl logs -n monitoring deployment/kube-prometheus-stack-grafana -f

# Verificar ConfigMaps de dashboards
kubectl get configmaps -n monitoring | grep dashboard
```

**Soluções:**

1. **Aguardar 2-3 minutos** - Sidecar precisa de tempo
2. **Atualizar página** do Grafana (Ctrl+F5)
3. **Verificar datasource:**
   - Configuration → Data Sources → Prometheus
   - Deve estar verde

4. **Reinstalar dashboards via Helm:**
   ```bash
   helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \
     --namespace monitoring \
     --reuse-values
   ```

### Métricas Não Aparecem nos Painéis

**Verificar se Prometheus está coletando:**

```bash
# Acessar Prometheus
open http://prometheus.nexo.local

# Executar query de teste
sum(up)  # Deve retornar > 0
```

**Verificar ServiceMonitors:**

```bash
kubectl get servicemonitors -n monitoring
```

Se métricas das apps Nexo não aparecem, criar ServiceMonitor:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: nexo-be
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: nexo-be
  namespaceSelector:
    matchNames:
      - nexo-develop
      - nexo-qa
      - nexo-staging
      - nexo-prod
  endpoints:
    - port: metrics
      interval: 30s
```

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Grafana:** https://grafana.com/docs/grafana/latest/
- **Dashboards Públicos:** https://grafana.com/grafana/dashboards/
- **PromQL (Prometheus Query Language):** https://prometheus.io/docs/prometheus/latest/querying/basics/

### Comunidade

- **Grafana Community:** https://community.grafana.com/
- **Prometheus Community:** https://prometheus.io/community/

### Tutoriais

- Criar dashboard personalizado: https://grafana.com/tutorials/
- Configurar alertas: https://grafana.com/docs/grafana/latest/alerting/

---

## 🎯 Próximos Passos

1. **Explorar dashboards existentes** - Familiarizar-se com métricas
2. **Instrumentar aplicações** - Adicionar métricas customizadas no backend/frontend
3. **Criar dashboards Nexo-específicos** - Métricas de negócio
4. **Configurar alertas** - Notificações para problemas críticos
5. **Documentar métricas** - Criar guia de métricas para o time

---

**Última atualização:** 17 de fevereiro de 2026  
**Versão do Grafana:** 10.x  
**Stack:** kube-prometheus-stack
