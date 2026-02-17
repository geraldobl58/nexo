# 🚀 Nexo CloudLab - Setup Completo

## ✅ Tudo Criado com Sucesso!

A infraestrutura completa de CloudLab foi configurada. Aqui está um resumo do que foi criado:

---

## 📁 Estrutura Criada

```
/Users/geraldoluiz/Development/fullstack/nexo/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              ✅ CI: Tests + Lint + Security
│   │   ├── deploy-local.yml    ✅ CD: Deploy para CloudLab
│   │   └── release.yml         ✅ Release para produção
│   ├── SECRETS.md              ✅ Guia de configuração de secrets
│   └── workflows/README.md     ✅ Documentação dos workflows
│
├── local/
│   ├── README.md               ✅ Documentação principal
│   ├── Makefile                ✅ Comandos automatizados
│   ├── setup.sh                ✅ Setup automatizado completo
│   │
│   ├── config/
│   │   ├── k3d-config.yaml     ✅ Cluster k3d (3 nodes)
│   │   ├── storage-class.yaml  ✅ Persistent Volumes
│   │   └── secrets.example.yaml ✅ Template de secrets
│   │
│   ├── scripts/
│   │   ├── 00-install-deps.sh       ✅ Instalar k3d, kubectl, helm, k9s
│   │   ├── 01-create-cluster.sh     ✅ Criar cluster + auto /etc/hosts
│   │   ├── 02-install-argocd.sh     ✅ ArgoCD + Ingress
│   │   ├── 03-install-observability.sh ✅ Prometheus + Grafana
│   │   ├── 04-install-elasticsearch.sh ❌ ELK Stack (REMOVIDO - muito pesado)
│   │   ├── 05-deploy-apps.sh        ✅ Deploy aplicações
│   │   ├── 06-install-harbor.sh     ❌ Harbor Registry (REMOVIDO - usa ghcr.io)
│   ├── configure-hosts.sh       ✅ Configurar hosts (sem duplicar)
   │   ├── update-hosts.sh          ✅ Atualizar hosts (recriar todos)│   │   ├── 99-show-urls.sh          ✅ Mostrar todas URLs
│   │   └── troubleshoot.sh          ✅ Diagnóstico automático
│   │
│   ├── helm/
│   │   ├── nexo-be/values-local.yaml   ✅ Backend config
│   │   ├── nexo-fe/values-local.yaml   ✅ Frontend config
│   │   └── nexo-auth/values-local.yaml ✅ Auth config
│   │
│   └── docs/
│       ├── README.md                ✅ Índice da documentação
│       ├── 01-installation.md       ✅ Setup e troubleshooting
│       ├── 02-kubernetes.md         ✅ Gerenciamento do cluster
│       ├── 03-argocd.md             ✅ GitOps workflows
│       ├── 04-observability.md      ✅ Prometheus + Grafana
│       ├── 05-logging.md            ❌ Elasticsearch + Kibana (REMOVIDO)
│       ├── 06-applications.md       ✅ Deploy e gestão de apps
│       ├── 07-troubleshooting.md    ✅ Problemas comuns
│       ├── 08-cheatsheet.md         ✅ Comandos úteis
│       ├── 09-github-integration.md ✅ CI/CD setup completo
│       └── 10-architecture.md       ✅ Diagramas da infraestrutura
```

---

## 🎯 Próximos Passos

### 1️⃣ Preparar Ambiente

**Pré-requisitos importantes:**

```bash
# Aumentar recursos do Docker Desktop
# Settings > Resources:
# - CPUs: 8-12
# - Memory: 12-16 GB
# - Swap: 4 GB
# - Disk: 100 GB
```

### 2️⃣ Instalar a CloudLab

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo/local

# Opção 1: Setup automático (RECOMENDADO)
make setup

# Opção 2: Passo a passo manual
./scripts/00-install-deps.sh
./scripts/01-create-cluster.sh
./scripts/02-install-argocd.sh
./scripts/03-install-observability.sh
# ./scripts/04-install-elasticsearch.sh  # REMOVIDO - muito pesado
# ./scripts/06-install-harbor.sh         # REMOVIDO - usa ghcr.io
./scripts/05-deploy-apps.sh

# Ver todas as URLs de acesso
make urls
```

**Tempo estimado:** 10-15 minutos

---

### 2️⃣ Configurar GitHub Actions

#### a) Adicionar secrets no GitHub

Acesse: `Settings > Secrets and variables > Actions`

**Secrets obrigatórios:**

```bash
ARGOCD_AUTH_TOKEN=<obter do ArgoCD>
DISCORD_WEBHOOK=<webhook do Discord para notificações>
```

> ℹ️ **NOTA:** O `GITHUB_TOKEN` é **automaticamente fornecido** pelo GitHub Actions.
> Você **NÃO precisa criar este secret manualmente**.
> GitHub não permite criar secrets com o nome `GITHUB_TOKEN` - ele é reservado.

**Como obter o token do ArgoCD:**

```bash
# Token do ArgoCD:
argocd login argocd.nexo.local --insecure --username admin
argocd account generate-token --account github-actions
```

📖 **Documentação completa:** [.github/SECRETS.md](./.github/SECRETS.md)

#### b) Configurar Self-Hosted Runner

```bash
# No seu Mac (com cloudlab rodando)

# 1. Acessar no GitHub: Settings > Actions > Runners > New self-hosted runner
# 2. Seguir instruções de instalação
# 3. Instalar como serviço:

cd ~/actions-runner
./svc.sh install
./svc.sh start
./svc.sh status
```

📖 **Documentação completa:** [local/docs/09-github-integration.md](./local/docs/09-github-integration.md)

---

### 3️⃣ Testar o Workflow Completo

```bash
# 1. Fazer uma mudança no código
echo "// teste" >> apps/nexo-be/src/main.ts

# 2. Commit e push
git add .
git commit -m "test: validar CI/CD pipeline"
git push origin develop

# 3. Acompanhar execução
# GitHub: https://github.com/seu-usuario/nexo/actions
# Ou via CLI:
gh run watch

# 4. Verificar deploy no ArgoCD
open http://argocd.nexo.local

# 5. Verificar aplicação rodando
open http://develop.nexo.local
open http://develop.api.nexo.local
```

---

## 🌐 URLs Disponíveis

Após a instalação, você terá acesso a:

### 🛠️ Ferramentas

| Serviço      | URL                            | Usuário | Senha          |
| ------------ | ------------------------------ | ------- | -------------- |
| ArgoCD       | http://argocd.nexo.local       | admin   | kubectl get... |
| Grafana      | http://grafana.nexo.local      | admin   | prom-operator  |
| Prometheus   | http://prometheus.nexo.local   | -       | -              |
| AlertManager | http://alertmanager.nexo.local | -       | -              |
| Kibana       | http://kibana.nexo.local       | -       | -              |
| Harbor       | http://harbor.nexo.local       | admin   | Harbor12345    |
| Traefik      | http://traefik.nexo.local      | -       | -              |

### 🚀 Aplicações (Develop)

```
Frontend:  http://develop.nexo.local
Backend:   http://develop.api.nexo.local
Auth:      http://develop.auth.nexo.local
```

### 🎨 Outros Ambientes

```
QA:        http://qa.nexo.local
Staging:   http://staging.nexo.local
Prod:      http://prod.nexo.local
```

---

## 📚 Documentação Essencial

### Para começar:

- **[Local README](./local/README.md)** - Visão geral da CloudLab
- **[Instalação](./local/docs/01-installation.md)** - Setup detalhado
- **[Cheat Sheet](./local/docs/08-cheatsheet.md)** - Comandos rápidos

### Para desenvolvimento:

- **[Kubernetes](./local/docs/02-kubernetes.md)** - Gerenciar o cluster
- **[Aplicações](./local/docs/06-applications.md)** - Deploy e gestão
- **[Troubleshooting](./local/docs/07-troubleshooting.md)** - Resolver problemas

### Para CI/CD:

- **[GitHub Integration](./local/docs/09-github-integration.md)** - Setup completo
- **[GitHub Workflows](./.github/workflows/README.md)** - Workflows disponíveis
- **[GitHub Secrets](./.github/SECRETS.md)** - Configurar secrets

### Para entender a infraestrutura:

- **[Arquitetura](./local/docs/10-architecture.md)** - Diagramas completos
- **[ArgoCD](./local/docs/03-argocd.md)** - GitOps workflows
- **[Observability](./local/docs/04-observability.md)** - Métricas e alertas
- **[Logging](./local/docs/05-logging.md)** - Logs centralizados

---

## 🎮 Comandos Úteis

```bash
# Ver status do cluster
make status

# Ver todas as URLs
make urls

# Abrir dashboards
make dashboard    # ArgoCD
make grafana      # Grafana
make kibana       # Kibana

# Gerenciamento
make start        # Iniciar cluster
make stop         # Parar cluster
make restart      # Reiniciar cluster

# Troubleshooting
make troubleshoot # Diagnóstico completo
make top          # Uso de recursos

# Interface visual (K9s)
k9s
```

---

## 🔥 Features Principais

✅ **Cluster Kubernetes local** com k3d (3 nodes)
✅ **GitOps** com ArgoCD (auto-sync)
✅ **Observability completa** (Prometheus + Grafana + AlertManager)
✅ **Logging centralizado** (Elasticsearch + Kibana + Filebeat)
✅ **Container Registry** (Harbor com Trivy security scan)
✅ **Multi-ambiente** (develop, qa, staging, prod)
✅ **CI/CD automatizado** (GitHub Actions + Self-hosted Runner)
✅ **DNS local** (auto-configurado em /etc/hosts)
✅ **Zero port-forwarding** (tudo via DNS + Ingress)
✅ **Documentação completa** (10 guias + diagramas)
✅ **Comandos make** para automação
✅ **Troubleshooting** automatizado

---

## 🎓 Conceitos Importantes

### GitOps Flow

```
Code Change → Git Push → GitHub Actions (CI/CD) →
Harbor (Images) → Git Commit (Helm) → ArgoCD Sync →
Kubernetes Deploy → Health Checks → Live!
```

### Estrutura de Ambientes

- **develop**: Branch develop → develop.\*.nexo.local
- **qa**: Branch qa → qa.\*.nexo.local
- **staging**: Branch staging → staging.\*.nexo.local
- **prod**: Tags v*.*._ → prod._.nexo.local / g3developer.online

### Monitoramento

- **Métricas**: Prometheus coleta → Grafana visualiza
- **Logs**: Filebeat coleta → Elasticsearch armazena → Kibana visualiza
- **Alertas**: AlertManager notifica via webhook

---

## 🆘 Precisa de Ajuda?

### Problemas comuns:

**Cluster não inicia:**

```bash
docker ps  # Verificar se Docker está rodando
make troubleshoot
```

**Pods não sobem:**

```bash
kubectl get pods -A
kubectl describe pod <pod-name> -n <namespace>
make troubleshoot
```

**URLs não resolvem:**

```bash
cat /etc/hosts | grep nexo.local
./scripts/01-create-cluster.sh  # Re-run para reconfigurar hosts
```

**Harbor não aceita push:**

```bash
docker login harbor.nexo.local
# User: admin / Password: Harbor12345
```

### Documentação completa:

📖 **[Troubleshooting Guide](./local/docs/07-troubleshooting.md)**

---

## 🚀 Está Pronto para Começar!

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo/local
make setup
```

Boa sorte! 🎉

---

## 📞 Suporte

- **Documentação**: `./local/docs/`
- **GitHub Issues**: Para reportar problemas
- **Makefile**: `make help` para ver todos os comandos

**Versão:** 1.0.0  
**Última atualização:** 2025-06-10
