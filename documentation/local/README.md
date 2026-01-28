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

### Docker Hub Rate Limit (429 Too Many Requests)

```bash
# Verificar eventos do pod
kubectl describe pod -n nexo-local -l app=nexo-be | grep -A5 "Events:"

# Se aparecer "429 Too Many Requests", configurar credenciais:
# Ver seção "Docker Hub Authentication" acima
```

### Tema Keycloak não aparece no dropdown

```bash
# Verificar se o tema existe no container
kubectl exec -n nexo-local deployment/nexo-auth-local -- ls -la /opt/keycloak/themes/

# Verificar theme.properties
kubectl exec -n nexo-local deployment/nexo-auth-local -- cat /opt/keycloak/themes/nexo/login/theme.properties

# Reiniciar Keycloak
kubectl rollout restart deployment nexo-auth-local -n nexo-local
```

---

## Build e Deploy de Imagens Locais

O ambiente local usa imagens importadas diretamente no K3D. Isso é necessário porque o registry local pode ter problemas de conectividade com os nodes.

### Workflow Recomendado

```bash
# 1. Build das imagens
cd apps/nexo-be
docker build -t nexo-registry.localhost:5111/nexo-be:local .

cd ../nexo-fe
docker build -t nexo-registry.localhost:5111/nexo-fe:local .

cd ../nexo-auth
docker build -t nexo-registry.localhost:5111/nexo-auth:local .

# 2. Push para registry local (opcional)
docker push nexo-registry.localhost:5111/nexo-be:local
docker push nexo-registry.localhost:5111/nexo-fe:local
docker push nexo-registry.localhost:5111/nexo-auth:local

# 3. Import direto no K3D (recomendado)
k3d image import nexo-registry.localhost:5111/nexo-be:local -c nexo-local
k3d image import nexo-registry.localhost:5111/nexo-fe:local -c nexo-local
k3d image import nexo-registry.localhost:5111/nexo-auth:local -c nexo-local

# 4. Restart dos pods para pegar nova imagem
kubectl rollout restart deployment/nexo-be-local -n nexo-local
kubectl rollout restart deployment/nexo-fe-local -n nexo-local
kubectl rollout restart deployment/nexo-auth-local -n nexo-local
```

### Por que usar k3d image import?

O K3D cria um cluster isolado que nem sempre consegue acessar o registry local. Usando `k3d image import`, a imagem é copiada diretamente para todos os nodes do cluster, garantindo disponibilidade.

### ImagePullPolicy

As imagens locais usam `imagePullPolicy: IfNotPresent` para permitir uso de imagens importadas via `k3d image import`.

---

## Docker Hub Authentication

Ao usar imagens do Docker Hub, é comum encontrar rate limits (erro 429 Too Many Requests). Para resolver, configure credenciais de autenticação:

### Criar Secret

```bash
kubectl create secret docker-registry dockerhub-creds \
  --docker-server=docker.io \
  --docker-username=SEU_USUARIO \
  --docker-password=SEU_ACCESS_TOKEN \
  -n nexo-local
```

> **Dica:** Crie um [Personal Access Token](https://hub.docker.com/settings/security) no Docker Hub.

### Configurar nas Aplicações ArgoCD

Para que as credenciais persistam após sincronizações do ArgoCD:

```bash
# Adicionar imagePullSecrets via parâmetros Helm
kubectl patch application nexo-be-local -n argocd --type='json' \
  -p='[{"op":"add","path":"/spec/source/helm/parameters/-","value":{"name":"imagePullSecrets[0].name","value":"dockerhub-creds"}}]'

kubectl patch application nexo-fe-local -n argocd --type='json' \
  -p='[{"op":"add","path":"/spec/source/helm/parameters/-","value":{"name":"imagePullSecrets[0].name","value":"dockerhub-creds"}}]'
```

### Verificar

```bash
# Verificar se deployments têm imagePullSecrets
kubectl get deployment -n nexo-local -o jsonpath='{range .items[*]}{.metadata.name}: {.spec.template.spec.imagePullSecrets}{"\n"}{end}'
```

---

## Keycloak Tema Customizado

O Keycloak usa o tema **nexo** para personalizar as telas de login e emails.

### Estrutura

```
apps/nexo-auth/themes/nexo/
├── login/
│   ├── theme.properties      # Configuração do tema
│   ├── resources/
│   │   └── css/
│   │       └── tailwind.css  # Estilos customizados
│   └── ...
└── email/
    └── theme.properties
```

### Configuração para Keycloak 26+

O arquivo `theme.properties` deve usar `parent=keycloak`:

```properties
# login/theme.properties
parent=keycloak
styles=css/tailwind.css
locales=pt-BR,en
defaultLocale=pt-BR
cacheThemes=false
cacheTemplates=false
```

> **⚠️ Importante:** Versões anteriores usavam `parent=base` com `import=common/keycloak`.
> Para Keycloak 26+, use apenas `parent=keycloak`.

### Habilitar o Tema

1. Acesse o Keycloak Admin: http://auth.nexo.local
2. Login com admin/admin
3. Vá em **Realm Settings** → **Themes**
4. Selecione **nexo** em "Login theme"
5. Clique **Save**

### Build com Tema Incluído

Para incluir o tema na imagem Docker:

```dockerfile
# apps/nexo-auth/Dockerfile
FROM quay.io/keycloak/keycloak:26.0.7 AS builder

COPY themes/nexo /opt/keycloak/themes/nexo

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.0.7 AS production
COPY --from=builder /opt/keycloak /opt/keycloak

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
```

---

## Próximos Passos

1. [Configurar GitHub](../github-config.md) - Secrets e environments
2. [Workflow CI/CD](../development.md) - Pipelines de deploy
3. [Observabilidade](../observability-guide.md) - Dashboards e alertas
