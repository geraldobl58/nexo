# 🚀 Nexo CloudLab Local - DevOps Ninja Edition

Ambiente de desenvolvimento local completo que simula uma infraestrutura cloud profissional para prática e desenvolvimento de aplicações com stack DevOps completa.

## 🎯 Objetivo

Criar um ambiente local robusto para:

- Desenvolvimento e testes de aplicações
- Prática de DevOps e infraestrutura como código
- Simulação de ambientes de produção
- Aprendizado de ferramentas enterprise

## 🛠️ Stack Completa

- **Kubernetes**: k3d (K3s local) - Cluster Kubernetes leve e completo
- **GitOps**: ArgoCD - Continuous Deployment
- **Observability**: Prometheus, Grafana, AlertManager
- **Logging**: Elasticsearch + Kibana + Filebeat
- **Container Registry**: Harbor (registry local)
- **Storage**: Volumes persistentes em SSD externo (/Volumes/Backup)
- **Ingress**: Traefik (incluído no k3d)
- **Service Mesh**: Opcional - Linkerd/Istio

## 📋 Pré-requisitos

- Docker Desktop (macOS)
- 8GB+ RAM disponível
- SSD Externo montado em `/Volumes/Backup`
- Homebrew instalado

## 🚀 Quick Start

### Setup Automático (Recomendado)

```bash
cd local
make setup
# ou
./setup.sh
```

### Setup Manual (Passo a Passo)

```bash
# 1. Instalar dependências
./scripts/00-install-deps.sh

# 2. Criar cluster Kubernetes local
./scripts/01-create-cluster.sh

# 3. Instalar ArgoCD
./scripts/02-install-argocd.sh

# 4. Instalar stack de observabilidade
./scripts/03-install-observability.sh

# 5. Instalar Elasticsearch Stack
./scripts/04-install-elasticsearch.sh

# 6. Instalar Harbor Registry (opcional)
./scripts/06-install-harbor.sh

# 7. Deploy das aplicações
./scripts/05-deploy-apps.sh

# 8. Acessar dashboards
./scripts/99-show-urls.sh
# ou
make urls
```

## 📖 Documentação

- [01 - Instalação e Configuração](./docs/01-installation.md)
- [02 - Kubernetes Local (k3d)](./docs/02-kubernetes.md)
- [03 - ArgoCD GitOps](./docs/03-argocd.md)
- [04 - Observabilidade](./docs/04-observability.md)
- [05 - Logging (ELK)](./docs/05-logging.md)
- [06 - Deploy de Aplicações](./docs/06-applications.md)
- [07 - Troubleshooting](./docs/07-troubleshooting.md)
- [08 - Comandos Úteis](./docs/08-cheatsheet.md)
- [09 - GitHub Integration](./docs/09-github-integration.md)
- [10 - Arquitetura CloudLab](./docs/10-architecture.md)
- [11 - Ambientes e Domínios](./docs/11-environments-and-domains.md)
- [12 - Configuração de DNS](./docs/12-dns-configuration.md)

## 🌐 URLs de Acesso

Após instalação completa:

### Ferramentas

```
ArgoCD:           http://argocd.nexo.local
Grafana:          http://grafana.nexo.local
Prometheus:       http://prometheus.nexo.local
AlertManager:     http://alertmanager.nexo.local
Kibana:           http://kibana.nexo.local
Harbor Registry:  http://harbor.nexo.local
Traefik:          http://traefik.nexo.local
```

### Aplicações por Ambiente

```
# Develop
Frontend:         http://develop.nexo.local
API:              http://develop.api.nexo.local
Auth:             http://develop.auth.nexo.local

# QA
Frontend:         http://qa.nexo.local
API:              http://qa.api.nexo.local
Auth:             http://qa.auth.nexo.local

# Setup completo
make setup

# Status do cluster
make status

# Ver todas as URLs
make urls

# Abrir dashboards
make dashboard        # ArgoCD
make grafana          # Grafana
make kibana           # Kibana
make prometheus       # Prometheus

# Gerenciamento
make start            # Iniciar cluster
make stop             # Parar cluster
make restart          # Reiniciar cluster

# Troubleshooting
make troubleshoot     # Diagnóstico completo
make top              # Ver uso de recursos

# Limpeza
make clean            # Limpar tudo
make backup           # Backup completo

# Ver logs
make logs SERVICE=nexo-be NAMESPACE=nexo-local

# Interface visual
k9s
# Limpar tudo
make clean

# Backup completo
make backup

# Restaurar backup
make restore

# Ver logs
make logs SERVICE=nexo-be

# Port-forward de serviços
make port-forward SERVICE=nexo-be PORT=3000
```

## 📦 Estrutura

```
local/
├── README.md                 # Este arquivo
├── Makefile                  # Comandos facilitados
├── config/                   # Configurações do cluster
│   ├── k3d-config.yaml      # Configuração k3d
│   └── storage-class.yaml   # StorageClass para SSD externo
├── scripts/                  # Scripts de instalação e gestão
│   ├── 00-install-deps.sh
│   ├── 01-create-cluster.sh
│   ├── 02-install-argocd.sh
│   ├── 03-install-observability.sh
│   ├── 04-install-elasticsearch.sh
│   ├── 05-deploy-apps.sh
│   └── 99-show-urls.sh
├── argocd/                   # Configurações ArgoCD local
│   ├── apps/                 # Applications
│   └── projects/             # Projects
├── observability/            # Stack Prometheus + Grafana
│   ├── prometheus/
│   ├── grafana/
│   └── alertmanager/
├── logging/                  # Stack Elasticsearch
│   ├── elasticsearch/
│   ├── kibana/
│   └── filebeat/
├── helm/                     # Helm values local
│   ├── nexo-be/
│   ├── nexo-fe/
│   └── nexo-auth/
└── docs/                     # Documentação detalhada
```

## 🔥 Features

✅ Cluster Kubernetes multi-node local  
✅ GitOps com ArgoCD  
✅ Métricas com Prometheus  
✅ Dashboards com Grafana  
✅ Alertas com AlertManager  
✅ Logs centralizados com Elasticsearch  
✅ Visualização de logs com Kibana  
✅ Container Registry local (Harbor)  
✅ Ingress com TLS (self-signed)  
✅ Persistent Volumes em SSD externo  
✅ Network Policies  
✅ Resource Limits otimizados  
✅ Auto-scaling (HPA)  
✅ Service Mesh (opcional)

## 💡 Dicas

- Use `k9s` para gerenciar o cluster visualmente
- Configure aliases no shell para comandos kubectl
- Monitore recursos com `kubectl top nodes/pods`
- Use port-forward para debug de serviços
- Backup regular com `make backup`

## 🐛 Troubleshooting

Se algo não funcionar:

```bash
# Ver logs do cluster
./scripts/troubleshoot.sh

# Ver status de todos pods
kubectl get pods -A

# Ver eventos
kubectl get events -A --sort-by='.lastTimestamp'

# Reiniciar um namespace
kubectl delete pods --all -n nexo-local
```

## 📚 Recursos

- [k3d Documentation](https://k3d.io/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Prometheus Operator](https://prometheus-operator.dev/)
- [Elastic Stack](https://www.elastic.co/guide/)

---

**Ambiente preparado para DevOps Ninja! 🥷**
