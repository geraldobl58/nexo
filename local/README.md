# 🏠 Nexo Platform - Ambiente Local K3D

Ambiente de desenvolvimento local que **espelha exatamente a produção**.

## 📋 O que está incluído

| Componente    | Descrição                  | Porta Local |
| ------------- | -------------------------- | ----------- |
| K3D Cluster   | Kubernetes local (3 nodes) | -           |
| ArgoCD        | GitOps CD                  | 30080       |
| Prometheus    | Métricas                   | 30090       |
| Grafana       | Dashboards                 | 30030       |
| Alertmanager  | Alertas                    | 30093       |
| NGINX Ingress | Load Balancer              | 80/443      |
| nexo-be       | Backend NestJS             | -           |
| nexo-fe       | Frontend Next.js           | -           |
| nexo-auth     | Keycloak                   | -           |

## � DockerHub

As imagens são sempre puxadas do **DockerHub** (registry público), simulando o ambiente de produção.

### Repositórios

- `docker.io/geraldobl58/nexo-be` - Backend NestJS
- `docker.io/geraldobl58/nexo-fe` - Frontend Next.js
- `quay.io/keycloak/keycloak` - Keycloak (imagem oficial)

### Comandos

```bash
# Login no DockerHub (necessário para push)
make docker-login

# Build e push para DockerHub
make build-be    # Backend
make build-fe    # Frontend
make build-all   # Ambos

# Deploy (puxa imagens do DockerHub)
make deploy-be
make deploy-fe
make deploy-all

# Forçar pull das últimas imagens
make pull-latest
```

### Fluxo de Desenvolvimento

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Código    │────▶│   Docker    │────▶│  DockerHub  │
│   Local     │     │   Build     │     │   Push      │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    K3D      │◀────│  Kubernetes │◀────│    Pull     │
│   Cluster   │     │   Deploy    │     │   Image     │
└─────────────┘     └─────────────┘     └─────────────┘
```

## �🚀 Quick Start

```bash
cd local/

# Verificar dependências
make doctor

# Setup completo (uma vez)
make setup

# Ver status
make status

# Destruir ambiente
make destroy
```

## 📂 Estrutura

```
local/
├── k3d/
│   └── config.yaml           # Configuração do cluster K3D
├── argocd/
│   ├── nodeport.yaml         # Service NodePort ArgoCD
│   ├── apps/                 # Applications ArgoCD
│   └── projects/             # AppProjects
├── helm/
│   ├── nexo-be/
│   │   └── values-local.yaml # Values backend local
│   ├── nexo-fe/
│   │   └── values-local.yaml # Values frontend local
│   └── nexo-auth/
│       └── values-local.yaml # Values Keycloak local
├── observability/
│   └── values.yaml           # Prometheus + Grafana + Alertmanager
├── scripts/
│   ├── setup.sh              # Setup completo
│   ├── destroy.sh            # Limpar tudo
│   └── status.sh             # Status do cluster
└── Makefile                  # Comandos locais
```

## 📖 Documentação

Veja a documentação completa em [/documentation/local](../documentation/local/README.md).
