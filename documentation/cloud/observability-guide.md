# 📊 Guia de Observabilidade

Guia prático para monitoramento e observabilidade no Nexo Platform.

> ⚠️ **Nota**: Este guia é para ambientes com stack de observabilidade configurada (Prometheus, Grafana, Loki).
> Em desenvolvimento local, use logs diretos do Docker: `docker logs <container-name>`

## 🌊 Observabilidade no DOKS

A stack de observabilidade roda no cluster DigitalOcean Kubernetes:

- **Prometheus** - Coleta de métricas
- **Grafana** - Visualização de dashboards e logs
- **Loki** - Agregação de logs
- **Promtail** - Coleta de logs dos pods

## 🚀 Acessando os Serviços

### Via Ingress (Produção)

```bash
# Grafana - https://grafana.yourdomain.com
# Prometheus - https://prometheus.yourdomain.com
# (configurado no Ingress do cluster)
```

### Via Port-Forward (Debug)

```bash
# Grafana
kubectl port-forward svc/grafana 3000:80 -n monitoring

# Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n monitoring

# Loki
kubectl port-forward svc/loki 3100:3100 -n monitoring
```

## 🌐 URLs de Acesso

| Serviço        | URL (via Port-Forward) | Credenciais   | Propósito                  |
| -------------- | ---------------------- | ------------- | -------------------------- |
| **Grafana**    | http://localhost:3000  | admin / admin | Dashboards, Logs, Métricas |
| **Prometheus** | http://localhost:9090  | -             | Coleta de métricas         |
| **Loki**       | http://localhost:3100  | -             | API de logs (sem UI)       |

> ⚠️ **Importante**: O Loki não tem interface web própria! Os logs são visualizados pelo **Grafana**.

---

## 📋 Ver Logs no Grafana

### 1. Acessar Grafana

1. Abra http://localhost:3001
2. Login: `admin` / `admin`
3. No menu lateral, clique em **Explore** (ícone de bússola)

### 2. Selecionar Loki como Datasource

1. No topo, mude de "Prometheus" para **"Loki"**
2. Agora você pode buscar logs!

### 3. Consultas de Logs (LogQL)

#### Ver todos os logs

```logql
{job="docker"}
```

#### Logs de um container específico

```logql
{container="nexo-auth-dev"}
```

```logql
{container="nexo-postgres-dev"}
```

```logql
{container="nexo-redis-dev"}
```

#### Buscar por texto

```logql
{container="nexo-auth-dev"} |= "error"
```

```logql
{container="nexo-auth-dev"} |= "login"
```

#### Logs dos últimos 5 minutos com erro

```logql
{job="docker"} |= "error" | json
```

---

## 📈 Ver Métricas no Grafana

### 1. Acessar Prometheus via Grafana

1. No Grafana, vá em **Explore**
2. Selecione **"Prometheus"** como datasource

### 2. Consultas Úteis (PromQL)

#### Status dos serviços

```promql
up
```

#### Conexões PostgreSQL

```promql
pg_stat_activity_count
```

#### Memória do Redis

```promql
redis_memory_used_bytes / 1024 / 1024
```

#### Comandos Redis por segundo

```promql
rate(redis_commands_total[1m])
```

#### Taxa de hits no Redis

```promql
redis_keyspace_hits_total / (redis_keyspace_hits_total + redis_keyspace_misses_total)
```

---

## 🔴 Monitoramento do Redis

### Métricas Disponíveis

| Métrica         | Descrição                | Query PromQL                     |
| --------------- | ------------------------ | -------------------------------- |
| Memória usada   | RAM consumida pelo Redis | `redis_memory_used_bytes`        |
| Conexões ativas | Clientes conectados      | `redis_connected_clients`        |
| Comandos/seg    | Taxa de comandos         | `rate(redis_commands_total[1m])` |
| Cache hits      | Taxa de acertos          | `redis_keyspace_hits_total`      |
| Cache misses    | Taxa de erros            | `redis_keyspace_misses_total`    |
| Keys expiradas  | Chaves removidas por TTL | `redis_expired_keys_total`       |
| Uptime          | Tempo online             | `redis_uptime_in_seconds`        |

### Dashboard Redis no Grafana

1. Vá em **Dashboards** → **Import**
2. Use o ID: **763** (Redis Dashboard oficial)
3. Selecione Prometheus como datasource
4. Clique em **Import**

### Testar Redis Manualmente

```bash
# Conectar ao Redis
docker exec -it nexo-redis-dev redis-cli

# Comandos úteis
INFO                    # Informações gerais
INFO memory             # Uso de memória
INFO stats              # Estatísticas
INFO clients            # Conexões
DBSIZE                  # Quantidade de chaves
KEYS *                  # Listar todas as chaves
```

---

## 🧪 Estressar o Sistema (Load Testing)

### Opção 1: Estressar PostgreSQL

```bash
# Instalar pgbench (se necessário)
brew install postgresql  # macOS

# Criar banco de teste
docker exec -it nexo-postgres-dev psql -U nexo -d nexo_db -c "CREATE TABLE IF NOT EXISTS test (id SERIAL, data TEXT);"

# Rodar teste de stress (1000 inserts)
for i in {1..1000}; do
  docker exec nexo-postgres-dev psql -U nexo -d nexo_db -c "INSERT INTO test (data) VALUES ('test data $i');" &
done

# Ver conexões no Grafana
# Query: pg_stat_activity_count
```

### Opção 2: Estressar Redis

```bash
# Benchmark nativo do Redis
docker exec -it nexo-redis-dev redis-benchmark -n 10000 -c 50

# Isso vai:
# - Executar 10.000 comandos
# - Com 50 conexões simultâneas
# - E mostrar resultados de performance
```

**No Grafana, observe:**

- `rate(redis_commands_total[1m])` subindo
- `redis_connected_clients` aumentando
- `redis_memory_used_bytes` crescendo

### Opção 3: Estressar Keycloak

```bash
# Requisições simultâneas de health check
for i in {1..100}; do
  curl -s http://localhost:8080/health &
done

# Múltiplas tentativas de login
for i in {1..50}; do
  curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
    -d "client_id=admin-cli" \
    -d "username=admin" \
    -d "password=admin" \
    -d "grant_type=password" &
done
```

### Opção 4: Usando Apache Bench (ab)

```bash
# Instalar
brew install httpd  # macOS (inclui ab)

# Testar Keycloak (1000 requests, 10 concurrent)
ab -n 1000 -c 10 http://localhost:8080/health

# Testar API (quando rodando)
ab -n 1000 -c 10 http://localhost:3001/health
```

### Opção 5: Usando hey (recomendado)

```bash
# Instalar
brew install hey  # macOS

# Testar Keycloak
hey -n 1000 -c 50 http://localhost:8080/health

# Output mostra:
# - Requests/sec
# - Latência (média, p99)
# - Status codes
```

---

## 📊 Criar Dashboard Customizado

### 1. Criar Novo Dashboard

1. Grafana → **Dashboards** → **New** → **New Dashboard**
2. **Add visualization**
3. Selecione **Prometheus** como datasource

### 2. Painéis Sugeridos

#### Painel 1: Status dos Serviços

- Query: `up`
- Visualization: **Stat**
- Color mode: **Background**

#### Painel 2: Conexões PostgreSQL

- Query: `pg_stat_activity_count`
- Visualization: **Gauge**
- Max: 100

#### Painel 3: Memória Redis

- Query: `redis_memory_used_bytes / 1024 / 1024`
- Visualization: **Gauge**
- Unit: **MB**
- Max: 256

#### Painel 4: Comandos Redis/sec

- Query: `rate(redis_commands_total[1m])`
- Visualization: **Time series**

#### Painel 5: Logs de Erro

- Datasource: **Loki**
- Query: `{job="docker"} |= "error"`
- Visualization: **Logs**

### 3. Salvar Dashboard

1. Clique no ícone de **salvar** (💾)
2. Nome: "Nexo Platform Overview"
3. Clique **Save**

---

## 🔔 Alertas (Básico)

### Criar Alerta no Grafana

1. Vá em **Alerting** → **Alert rules**
2. **New alert rule**
3. Configure:
   - Query: `redis_memory_used_bytes / 1024 / 1024 > 200`
   - Condition: **Is above 200**
   - Evaluation: Every 1m for 5m
4. **Save rule**

### Exemplos de Alertas Úteis

| Alerta                     | Query                                   | Threshold |
| -------------------------- | --------------------------------------- | --------- |
| Redis memória alta         | `redis_memory_used_bytes / 1024 / 1024` | > 200 MB  |
| PostgreSQL muitas conexões | `pg_stat_activity_count`                | > 50      |
| Serviço down               | `up == 0`                               | -         |

---

## 🔑 Senhas e Acesso

### ArgoCD (Produção DOKS)

```bash
# Obter senha inicial do ArgoCD
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo
```

**Acesso:** https://argocd.yourdomain.com (configurado no Ingress)
**Usuário:** admin
**Senha:** (resultado do comando acima ou definida nos secrets)

### Grafana

**URL:** http://localhost:3000 (via port-forward) ou https://grafana.yourdomain.com
**Usuário:** admin
**Senha:** admin

### Keycloak

**URL:** http://localhost:8080
**Usuário:** admin
**Senha:** admin

---

## 🚀 Comandos Rápidos

```bash
# Iniciar observabilidade
make obs-start

# Parar observabilidade
make obs-stop

# Ver status
make status

# Abrir Grafana
make open-grafana

# Ver logs de um container
docker logs -f nexo-auth-dev
docker logs -f nexo-postgres-dev
docker logs -f nexo-redis-dev
```

---

## 📚 Próximos Passos

1. **Importar Dashboards Prontos**
   - Redis: ID 763
   - PostgreSQL: ID 9628
   - Docker: ID 893

2. **Configurar Alertas por Email/Slack**
   - Grafana → Alerting → Contact points

3. **Adicionar Métricas da Aplicação**
   - Backend: Endpoint `/metrics`
   - Frontend: Web Vitals

4. **Logs Estruturados**
   - Usar JSON logs no backend
   - Facilita buscas no Loki
