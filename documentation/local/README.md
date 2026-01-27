# 🏠 Ambiente Local K3D - Documentação Completa

Este documento descreve como configurar e usar o ambiente de desenvolvimento local usando K3D, que **espelha exatamente o ambiente de produção**.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Quick Start](#quick-start)
4. [Arquitetura Local](#arquitetura-local)
5. [Componentes](#componentes)
6. [Comandos](#comandos)
7. [URLs de Acesso](#urls-de-acesso)
8. [Ambientes](#ambientes)
9. [Troubleshooting](#troubleshooting)

### 📚 Documentação Relacionada

- [Ambientes Locais](./environments.md) - Configuração de dev, qa, staging e prod locais

---

## Visão Geral

O ambiente local K3D é uma réplica do ambiente de produção, permitindo:

- ✅ Testar deploys antes de ir para produção
- ✅ Validar configurações de Kubernetes
- ✅ Testar pipelines de CI/CD
- ✅ Desenvolver com ambiente idêntico à produção
- ✅ Testar observabilidade (Prometheus, Grafana, Alertmanager)
- ✅ Simular múltiplos ambientes (dev, qa, staging, prod)

### Comparação: Local vs Produção

| Aspecto         | Local (K3D)               | Produção                     |
| --------------- | ------------------------- | ---------------------------- |
| Kubernetes      | K3s (via K3D)             | Kubernetes 1.29+             |
| Nodes           | 1 server + 2 agents       | Node Pool (2+ nodes)         |
| Ingress         | NGINX Ingress             | NGINX Ingress                |
| GitOps          | ArgoCD                    | ArgoCD                       |
| Observabilidade | Prometheus + Grafana + AM | Prometheus + Grafana + AM    |
| Registry        | Registry local (K3D)      | GHCR (ghcr.io)               |
| TLS             | Não (HTTP)                | Cert-Manager + Let's Encrypt |
| Domínio         | \*.nexo.local             | \*.nexo.io                   |

---

## Pré-requisitos

### Software Necessário

```bash
# macOS - Instalar via Homebrew
brew install k3d kubectl helm

# Verificar instalação
k3d version      # v5.x
kubectl version  # v1.29+
helm version     # v3.x
docker --version # 24.x+
```

### Requisitos de Sistema

| Recurso | Mínimo  | Recomendado |
| ------- | ------- | ----------- |
| RAM     | 8GB     | 16GB        |
| CPU     | 4 cores | 8 cores     |
| Disco   | 20GB    | 50GB        |

### Docker Desktop

Certifique-se de que o Docker Desktop está:

- ✅ Instalado e rodando
- ✅ Com pelo menos 4GB de RAM alocados
- ✅ Com Kubernetes **desabilitado** (usamos K3D)

---

## Quick Start

### Setup Completo (Uma vez)

```bash
# Entrar no diretório local
cd local/

# Verificar dependências
make doctor

# Setup completo
make setup
```

Isso vai:

1. Criar cluster K3D com 3 nodes
2. Instalar NGINX Ingress Controller
3. Instalar ArgoCD
4. Instalar stack de observabilidade (Prometheus + Grafana + Alertmanager)
5. Configurar secrets do registry
6. Aplicar ArgoCD Applications

### Verificar Status

```bash
cd local/
make status
```

### Destruir Ambiente

```bash
cd local/
make destroy
```

---

## Arquitetura Local

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           K3D Cluster (nexo-local)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    NGINX Ingress Controller                       │   │
│  │                   (LoadBalancer: 80/443)                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│           │                    │                    │                    │
│           ▼                    ▼                    ▼                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   nexo.local    │  │ api.nexo.local  │  │ auth.nexo.local │         │
│  │    (nexo-fe)    │  │    (nexo-be)    │  │  (nexo-auth)    │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         Observabilidade                           │   │
│  ├────────────────┬─────────────────┬────────────────────────────────┤   │
│  │  Prometheus    │    Grafana      │      Alertmanager              │   │
│  │  :30090        │    :30030       │      :30093                    │   │
│  └────────────────┴─────────────────┴────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                            ArgoCD                                 │   │
│  │                           :30080                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Nodes:
├── k3d-nexo-local-server-0 (control plane)
├── k3d-nexo-local-agent-0  (worker)
└── k3d-nexo-local-agent-1  (worker)
```

---

## Componentes

### ArgoCD

GitOps controller que gerencia os deploys de forma declarativa.

| Propriedade | Valor                  |
| ----------- | ---------------------- |
| URL         | http://localhost:30080 |
| Usuário     | admin                  |
| Senha       | `make argocd-password` |

**Applications configuradas:**

- `nexo-be-local` - Backend NestJS
- `nexo-fe-local` - Frontend Next.js
- `nexo-auth-local` - Keycloak

### Prometheus

Sistema de métricas e monitoramento.

| Propriedade | Valor                                              |
| ----------- | -------------------------------------------------- |
| URL         | http://localhost:30090                             |
| Targets     | Pods com annotation `prometheus.io/scrape: "true"` |

### Grafana

Dashboards e visualização de métricas.

| Propriedade | Valor                   |
| ----------- | ----------------------- |
| URL         | http://localhost:30030  |
| Usuário     | admin                   |
| Senha       | `make grafana-password` |

**Datasources:**

- Prometheus (default)
- Alertmanager

### Alertmanager

Gerenciamento de alertas.

| Propriedade | Valor                  |
| ----------- | ---------------------- |
| URL         | http://localhost:30093 |

---

## Comandos

Todos os comandos do ambiente local estão no diretório `/local/`:

```bash
cd local/

# Verificar dependências
make doctor               # Verifica K3D, kubectl, helm, docker

# Setup/Destroy
make setup                # Setup completo
make destroy              # Destruir ambiente
make status               # Ver status

# Pods e Serviços
make pods                 # Listar pods
make services             # Listar serviços
make nodes                # Listar nodes

# Logs
make logs-be              # Logs backend
make logs-fe              # Logs frontend
make logs-auth            # Logs Keycloak
make logs-argocd          # Logs ArgoCD

# Port Forward
make pf-argocd            # ArgoCD em localhost:8080
make pf-grafana           # Grafana em localhost:3000
make pf-prometheus        # Prometheus em localhost:9090

# Build
make build-be             # Build backend
make build-fe             # Build frontend
make build-all            # Build todos

# Credenciais
make argocd-password      # Senha do ArgoCD
make grafana-password     # Senha do Grafana

# ArgoCD
make argocd-sync          # Sincronizar todas as apps

# Utilitários
make shell-be             # Shell no pod do backend
make shell-fe             # Shell no pod do frontend
make restart-all          # Restart todos os pods
```

---

## URLs de Acesso

### Serviços via NodePort

| Serviço      | URL                    | Credenciais         |
| ------------ | ---------------------- | ------------------- |
| ArgoCD       | http://localhost:30080 | admin / ver comando |
| Grafana      | http://localhost:30030 | admin / admin123    |
| Prometheus   | http://localhost:30090 | -                   |
| Alertmanager | http://localhost:30093 | -                   |

### Aplicações via Ingress

Para acessar as aplicações via domínio local, adicione ao `/etc/hosts`:

```bash
# Adicionar ao /etc/hosts
echo "127.0.0.1 nexo.local api.nexo.local auth.nexo.local" | sudo tee -a /etc/hosts
```

| Aplicação   | URL                    |
| ----------- | ---------------------- |
| Frontend    | http://nexo.local      |
| Backend API | http://api.nexo.local  |
| Keycloak    | http://auth.nexo.local |

---

## Troubleshooting

### Cluster não inicia

```bash
# Verificar Docker
docker info

# Verificar se há conflito de portas
lsof -i :80
lsof -i :443
lsof -i :30080

# Limpar e recriar
make local-destroy
make local-setup
```

### Pods não iniciam

```bash
# Ver eventos
kubectl get events -n nexo-local --sort-by='.lastTimestamp'

# Descrever pod
kubectl describe pod <pod-name> -n nexo-local

# Ver logs
kubectl logs <pod-name> -n nexo-local
```

### Imagens não são encontradas

```bash
# Verificar registry local
docker images | grep nexo-registry.localhost

# Rebuild e push
make -C local build-all
```

### ArgoCD não sincroniza

```bash
# Ver status das applications
kubectl get applications -n argocd

# Ver logs do ArgoCD
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller

# Forçar sync
kubectl -n argocd patch application nexo-be-local --type merge -p '{"operation":{"sync":{}}}'
```

---

## Próximos Passos

1. [Configurar GitHub](github-config.md) - Secrets e environments
2. [Workflow CI/CD](workflows.md) - Pipelines de deploy
3. [Observabilidade](observability.md) - Dashboards e alertas
