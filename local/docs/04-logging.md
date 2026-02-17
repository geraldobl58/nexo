# 🔍 Logging com Elasticsearch Stack - Nexo CloudLab

## Stack Completa

- **Elasticsearch**: Armazenamento e indexação de logs
- **Kibana**: Visualização e análise de logs
- **Filebeat**: Coleta de logs dos containers

## Arquitetura

```
┌───────────────────────────────────────────────┐
│         Kubernetes Nodes                      │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Container │  │Container │  │Container │   │
│  │  Logs    │  │  Logs    │  │  Logs    │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
│        │             │             │         │
│        └─────────────┼─────────────┘         │
│                      ↓                        │
│        /var/log/containers/*.log              │
└───────────────────┬───────────────────────────┘
                    │
                    │  Read logs
                    ↓
        ┌───────────────────────┐
        │    Filebeat DaemonSet │
        │   (runs on all nodes) │
        └───────────┬───────────┘
                    │
                    │  Ship logs
                    ↓
        ┌───────────────────────┐
        │    Elasticsearch      │
        │  (Index & Store logs) │
        └───────────┬───────────┘
                    │
                    │  Query
                    ↓
        ┌───────────────────────┐
        │       Kibana          │
        │  (Visualize & Search) │
        └───────────────────────┘
```

## Acesso ao Kibana

```bash
# Abrir Kibana
make kibana

# URL: http://kibana.local.nexo.dev
# Sem autenticação (ambiente local)

# Ou port-forward
kubectl port-forward -n logging svc/kibana-kibana 5601:5601
open http://localhost:5601
```

## Configuração Inicial do Kibana

### 1. Criar Index Pattern

1. Acessar Kibana
2. Menu → Stack Management → Index Patterns
3. Create index pattern
4. Pattern: `filebeat-*`
5. Time field: `@timestamp`
6. Create

### 2. Discover

Menu → Discover

- Ver logs em tempo real
- Filtrar, pesquisar, analisar

## Queries Úteis

### Logs por Namespace

```
kubernetes.namespace: "nexo-local"
```

### Logs de um Pod Específico

```
kubernetes.pod.name: "nexo-be-*"
```

### Logs de Erro

```
log.level: "error"
```

```
message: *error* OR message: *exception*
```

### Logs por Container

```
kubernetes.container.name: "nexo-be"
```

### Timerange Específico

```
@timestamp >= "2026-02-17T00:00:00" AND @timestamp <= "2026-02-17T23:59:59"
```

### Combinar Filtros

```
kubernetes.namespace: "nexo-local" AND log.level: "error" AND kubernetes.pod.name: "nexo-be-*"
```

## Elasticsearch Queries

### Via API

```bash
# Port-forward
kubectl port-forward -n logging svc/elasticsearch-master 9200:9200

# Health check
curl http://localhost:9200/_cluster/health?pretty

# Listar indices
curl http://localhost:9200/_cat/indices?v

# Ver documentos
curl http://localhost:9200/filebeat-*/_search?pretty
```

### Queries DSL

```bash
# Buscar logs de erro
curl -X GET "localhost:9200/filebeat-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        { "match": { "kubernetes.namespace": "nexo-local" }},
        { "match": { "log.level": "error" }}
      ]
    }
  },
  "size": 100,
  "sort": [
    { "@timestamp": { "order": "desc" }}
  ]
}
'
```

### Aggregations

```bash
# Count de logs por namespace
curl -X GET "localhost:9200/filebeat-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "by_namespace": {
      "terms": {
        "field": "kubernetes.namespace.keyword",
        "size": 10
      }
    }
  }
}
'
```

## Filebeat Configuration

### Ver Configuração

```bash
kubectl get cm -n logging filebeat-filebeat-config -o yaml
```

### Processors

Filebeat já inclui processors para enriquecer logs:

```yaml
processors:
  - add_kubernetes_metadata:
      host: ${NODE_NAME}
      matchers:
        - logs_path:
            logs_path: "/var/log/containers/"
  - add_cloud_metadata: ~
  - add_host_metadata: ~
  - add_docker_metadata: ~
```

### Logs Estruturados

Para apps que loggam em JSON:

```yaml
# Em filebeat config
filebeat.inputs:
  - type: container
    paths:
      - /var/log/containers/*nexo-be*.log
    json.keys_under_root: true
    json.add_error_key: true
    json.message_key: message
```

## Structured Logging nas Apps

### Node.js com Winston

```typescript
// nexo-be/src/libs/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    service: "nexo-be",
    version: process.env.APP_VERSION || "unknown",
    environment: process.env.NODE_ENV || "local",
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

// Uso
logger.info("User logged in", { userId: 123, email: "user@example.com" });
logger.error("Database error", { error: err.message, stack: err.stack });
```

### Pino (mais performático)

```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    service: "nexo-be",
    env: process.env.NODE_ENV,
  },
});

export default logger;
```

## Kibana Dashboards

### Criar Dashboard

1. Menu → Dashboard → Create dashboard
2. Add visualization
3. Tipos:
   - Line chart: Logs over time
   - Pie chart: Logs by level
   - Data table: Recent errors

### Visualizações Úteis

#### 1. Logs por Nível

```
Visualization: Pie chart
Metrics: Count
Buckets: Split slices
  Aggregation: Terms
  Field: log.level.keyword
```

#### 2. Logs ao Longo do Tempo

```
Visualization: Line chart
Metrics: Count
Buckets: X-Axis
  Aggregation: Date Histogram
  Field: @timestamp
  Interval: Auto
```

#### 3. Top Pods com Erros

```
Visualization: Data table
Metrics: Count
Buckets: Split rows
  Aggregation: Terms
  Field: kubernetes.pod.name.keyword
Filter: log.level: "error"
```

### Dashboard as Code

```yaml
# kibana-dashboard.ndjson
{
  "type": "dashboard",
  "id": "nexo-overview",
  "attributes": { "title": "Nexo Overview", "panels": [...] },
}
```

Importar:

```bash
# Via UI: Stack Management → Saved Objects → Import

# Via API
curl -X POST "localhost:5601/api/saved_objects/_import" \
  -H "kbn-xsrf: true" \
  --form file=@kibana-dashboard.ndjson
```

## Alertas no Kibana

### Watcher (Elasticsearch)

Criar alerta para muitos erros:

```json
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["filebeat-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                { "match": { "log.level": "error" } },
                { "range": { "@timestamp": { "gte": "now-5m" } } }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {
        "gt": 10
      }
    }
  },
  "actions": {
    "log_error": {
      "logging": {
        "text": "Found {{ctx.payload.hits.total}} errors in the last 5 minutes"
      }
    }
  }
}
```

## Log Retention

### Configurar ILM (Index Lifecycle Management)

```bash
# Ver policies
curl -X GET "localhost:9200/_ilm/policy?pretty"

# Criar policy customizada
curl -X PUT "localhost:9200/_ilm/policy/filebeat-policy?pretty" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "5GB",
            "max_age": "1d"
          }
        }
      },
      "delete": {
        "min_age": "7d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
'
```

### Deletar Índices Antigos

```bash
# Listar índices
curl -X GET "localhost:9200/_cat/indices/filebeat-*?v&s=index"

# Deletar índice específico
curl -X DELETE "localhost:9200/filebeat-2026.02.01?pretty"

# Deletar índices mais antigos que 7 dias
curl -X DELETE "localhost:9200/filebeat-$(date -d '7 days ago' +%Y.%m.%d)?pretty"
```

## Performance Tuning

### Elasticsearch

```yaml
# Aumentar heap
esJavaOpts: "-Xmx1g -Xms1g"

# Mais replicas (em produção)
replicas: 3

# Mais shards
indexSettings:
  number_of_shards: 3
  number_of_replicas: 1
```

### Filebeat

```yaml
# Bulk size
output.elasticsearch:
  bulk_max_size: 50

# Workers
worker: 2

# Queue
queue.mem:
  events: 4096
  flush.min_events: 512
  flush.timeout: 5s
```

## Troubleshooting

### Elasticsearch Yellow/Red

```bash
# Ver status
curl -X GET "localhost:9200/_cluster/health?pretty"

# Ver shards
curl -X GET "localhost:9200/_cat/shards?v"

# Tentar realocar
curl -X POST "localhost:9200/_cluster/reroute?retry_failed=true&pretty"
```

### Filebeat não envia logs

```bash
# Ver logs do Filebeat
kubectl logs -n logging -l app=filebeat

# Ver registro de arquivos
kubectl exec -n logging -it filebeat-xxx -- cat /usr/share/filebeat/data/registry/filebeat/log.json

# Testar output
kubectl exec -n logging -it filebeat-xxx -- filebeat test output
```

### Kibana lento

```bash
# Ver índices grandes
curl -X GET "localhost:9200/_cat/indices?v&s=store.size:desc"

# Deletar índices antigos
# Ver "Deletar Índices Antigos" acima

# Otimizar índice
curl -X POST "localhost:9200/filebeat-2026.02.17/_forcemerge?max_num_segments=1&pretty"
```

## Integração com Prometheus

### Exportar Métricas do Elasticsearch

```bash
# Instalar exporter
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install elasticsearch-exporter prometheus-community/prometheus-elasticsearch-exporter \
  --namespace logging \
  --set es.uri=http://elasticsearch-master:9200
```

## Comparativo: CloudLab vs SaaS

| Feature        | CloudLab (Local)    | Datadog     | New Relic   |
| -------------- | ------------------- | ----------- | ----------- |
| Custo          | 💰 Free             | 💰💰💰 Caro | 💰💰💰 Caro |
| Setup          | ⚙️ Manual           | ☁️ SaaS     | ☁️ SaaS     |
| Customização   | ⭐⭐⭐ Total        | ⭐⭐ Médio  | ⭐⭐ Médio  |
| Learning       | 📚 Alto             | 📚 Baixo    | 📚 Baixo    |
| Controle       | ✅ Total            | ❌ Limitado | ❌ Limitado |
| Escalabilidade | ⚠️ Limitado (local) | ✅ Infinito | ✅ Infinito |

## Comandos Úteis

```bash
# Status do Elasticsearch
kubectl get pods -n logging -l app=elasticsearch-master

# Logs do Elasticsearch
kubectl logs -n logging elasticsearch-master-0

# Shell no Elasticsearch
kubectl exec -it -n logging elasticsearch-master-0 -- bash

# Filebeat status
kubectl get pods -n logging -l app=filebeat

# Kibana logs
kubectl logs -n logging -l app=kibana

# Restart Filebeat
kubectl rollout restart daemonset -n logging filebeat-filebeat

# Ver usage de disco
kubectl exec -n logging elasticsearch-master-0 -- df -h
```

## Próximos Passos

- [06 - Deploy de Aplicações](./06-applications.md)
- [07 - Troubleshooting](./07-troubleshooting.md)
- [08 - Cheat Sheet](./08-cheatsheet.md)

---

**Anterior**: [04 - Observabilidade](./04-observability.md) | **Próximo**: [06 - Aplicações](./06-applications.md)
