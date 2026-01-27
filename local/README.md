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

## 🚀 Quick Start

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
