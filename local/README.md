# 🏠 Nexo Platform - Ambiente Local K3D

Ambiente de desenvolvimento local que **espelha exatamente a produção**.

## 📋 O que está incluído

| Componente    | Descrição                  | URL / Porta Local       |
| ------------- | -------------------------- | ----------------------- |
| K3D Cluster   | Kubernetes local (3 nodes) | -                       |
| ArgoCD        | GitOps CD                  | http://localhost:30080  |
| Prometheus    | Métricas                   | http://localhost:30090  |
| Grafana       | Dashboards                 | http://localhost:30030  |
| Alertmanager  | Alertas                    | http://localhost:30093  |
| **nexo-fe**   | Frontend Next.js           | http://nexo.local       |
| **nexo-be**   | Backend NestJS             | http://api.nexo.local   |
| **nexo-auth** | Keycloak                   | http://auth.nexo.local  |

## 🌐 URLs de Acesso

```
http://nexo.local/           # Frontend
http://api.nexo.local/       # Backend API
http://api.nexo.local/health # Health Check
http://auth.nexo.local/      # Keycloak Admin
```

> **Nota:** Adicione no `/etc/hosts`:
> ```
> 127.0.0.1 nexo.local api.nexo.local auth.nexo.local
> ```

## 🐳 DockerHub

As imagens são sempre puxadas do **DockerHub** (registry público).

### Repositórios

- `docker.io/geraldobl58/nexo-be` - Backend NestJS
- `docker.io/geraldobl58/nexo-fe` - Frontend Next.js
- `quay.io/keycloak/keycloak` - Keycloak (imagem oficial)

## 🔄 Fluxo de Desenvolvimento

### ⚠️ Importante: Quando preciso fazer build?

| Ambiente | Quando Buildar | Automático? |
|----------|----------------|-------------|
| **LOCAL (K3D)** | Após alterar código | ❌ Manual (`make build-all`) |
| **CLOUD (Prod)** | Push para GitHub | ✅ GitHub Actions |

### Desenvolvimento Diário

```bash
# 1. Faça suas alterações no código

# 2. Build e push para DockerHub
make build-all   # ou build-be / build-fe

# 3. Atualizar K3D com novas imagens
make pull-latest

# 4. Ver logs
make logs-be
make logs-fe
make logs-auth
```

## 🛠️ Comandos

### Setup Inicial

```bash
cd local/
make doctor   # Verificar dependências
make setup    # Setup completo
```

### Build e Deploy

```bash
make docker-login   # Login DockerHub
make build-be       # Build backend
make build-fe       # Build frontend
make build-all      # Build todos
make pull-latest    # Atualizar imagens
```

### Outros

```bash
make status           # Ver status
make pods             # Listar pods
make argocd-password  # Senha ArgoCD
make grafana-password # Senha Grafana
make destroy          # Destruir ambiente
```

## 📊 Observabilidade

### Grafana Dashboards

- **Nexo Backend** - Métricas HTTP, latência
- **Nexo Frontend** - Performance, requests
- **Nexo Auth** - Keycloak metrics

Acesse: http://localhost:30030

## 🔐 Credenciais Padrão

| Serviço | Usuário | Senha |
|---------|---------|-------|
| ArgoCD | admin | `make argocd-password` |
| Grafana | admin | admin123 |
| Keycloak | admin | admin |

## 📖 Documentação

Veja [/documentation/local](../documentation/local/README.md).

