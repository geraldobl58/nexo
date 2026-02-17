# 📚 Nexo CloudLab - Índice da Documentação

Documentação completa do ambiente de desenvolvimento local CloudLab.

---

## 📖 Documentação Completa

### **[00 - Instalação e Configuração](./00-installation.md)**

- Pré-requisitos do sistema
- Instalação rápida vs manual
- Configuração do SSD externo
- Verificação da instalação
- Problemas comuns na instalação

### **[01 - Kubernetes Local (k3d)](./01-kubernetes.md)**

- Arquitetura do cluster
- Gestão do cluster (criar, parar, deletar)
- Namespaces e contextos
- Storage e volumes
- Networking e ingress
- Registry local

### **[02 - ArgoCD GitOps](./02-argocd.md)**

- Conceitos (Application, ApplicationSet, Project)
- Gestão de aplicações
- Sync policies e hooks
- Secrets management
- Notificações
- Multi-cluster

### **[03 - Observabilidade](./03-observability.md)**

- Stack Prometheus + Grafana + AlertManager
- Dashboards pré-configurados
- Métricas customizadas
- Alertas e recording rules
- Queries úteis

<!-- Logging (ELK) foi removido - muito pesado para ambiente local -->
<!-- ### **[04 - Logging (ELK)](./04-logging.md)** -->
<!-- - Stack Elasticsearch + Kibana + Filebeat -->
<!-- - Queries no Kibana -->
<!-- - Structured logging -->

### **[05 - Deploy de Aplicações](./05-applications.md)**

- Workflow de desenvolvimento
- Build e push de imagens
- Configuração Helm charts
- Rollback e scaling
- Migrations
- CI/CD integration

### **[06 - Troubleshooting](./06-troubleshooting.md)**

- Problemas comuns e soluções
- Script de diagnóstico
- Logs importantes
- Comandos de emergência
- Quando reinstalar do zero (destroy)

### **[07 - Cheat Sheet](./07-cheatsheet.md)**

- Comandos kubectl essenciais
- k3d, ArgoCD, Helm, Docker
- Prometheus queries
- Aliases úteis
- One-liners poderosos

### **[08 - Integração com GitHub](./08-github-integration.md)**

- Configurar secrets no GitHub
- CI/CD com GitHub Actions
- Self-hosted runner
- Deploy automatizado
- Release para produção
- Notificações Discord

### **[09 - Arquitetura CloudLab](./09-architecture.md)**

- Diagrama completo da infraestrutura
- Componentes e suas interações
- Fluxo de deployment GitOps
- Estratégia multi-ambiente
- Alocação de recursos
- Segurança e controle de acesso
- Monitoramento e observabilidade

### **[10 - Ambientes e Domínios](./10-environments-and-domains.md)**

- CloudLab Local vs Produção Real
- Por que HTTP local e HTTPS em produção
- Configuração de DNS e Let's Encrypt
- Fluxo de deploy por ambiente
- Setup de produção no DigitalOcean

### **[11 - Configuração de DNS](./11-dns-configuration.md)**

- Como configurar /etc/hosts automaticamente
- Scripts configure-hosts vs update-hosts
- Todos os domínios disponíveis
- Troubleshooting de DNS
- Alternativas ao /etc/hosts
- Restaurar backups

---

## 📄 Guias Adicionais

- **[BRANCHES.md](./BRANCHES.md)** - Estratégia de branches (develop, qa, staging, main)
- **[DNS.md](./DNS.md)** - Resumo de configuração DNS
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Setup completo passo a passo
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Próximos passos após instalação
- **[README.md](./README.md)** - Visão geral do CloudLab

---

## 🚀 Quick Links

### Instalação Rápida

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo/local
make setup
```

### Comandos Essenciais

```bash
make status          # Ver status do cluster
make urls            # Ver todas as URLs
make configure-hosts # Configurar /etc/hosts (sem duplicar)
make troubleshoot    # Diagnóstico completo
make destroy         # Destruir tudo (com confirmações)
```

### URLs Principais

```
ArgoCD:    http://argocd.nexo.local
Grafana:   http://grafana.nexo.local
Prometheus: http://prometheus.nexo.local
AlertManager: http://alertmanager.nexo.local
```

---

## 📚 Ordem Recomendada de Leitura

### Para Iniciantes

1. [README.md](./README.md) - Visão geral
2. [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup inicial
3. [00 - Instalação](./00-installation.md) - Pré-requisitos e instalação
4. [11 - DNS](./11-dns-configuration.md) - Configurar domínios locais
5. [06 - Troubleshooting](./06-troubleshooting.md) - Resolver problemas

### Para Uso Diário

1. [07 - Cheat Sheet](./07-cheatsheet.md) - Comandos úteis
2. [05 - Deploy](./05-applications.md) - Fazer deploy de apps
3. [02 - ArgoCD](./02-argocd.md) - GitOps workflow

### Para Aprofundamento

1. [09 - Arquitetura](./09-architecture.md) - Como tudo funciona
2. [03 - Observabilidade](./03-observability.md) - Métricas e dashboards
3. [01 - Kubernetes](./01-kubernetes.md) - Gestão do cluster
<!-- 4. [04 - Logging](./04-logging.md) - Logs centralizados (REMOVIDO) -->

### Para CI/CD

1. [BRANCHES.md](./BRANCHES.md) - Estratégia de branches
2. [08 - GitHub](./08-github-integration.md) - CI/CD com GitHub Actions
3. [10 - Ambientes](./10-environments-and-domains.md) - Multi-ambiente

---

## 🆘 Precisa de Ajuda?

- **Problemas comuns**: [06 - Troubleshooting](./06-troubleshooting.md)
- **Comandos rápidos**: [07 - Cheat Sheet](./07-cheatsheet.md)
- **Diagnóstico**: `make troubleshoot`
- **Logs**: `kubectl logs -n <namespace> <pod>`
- **Destroy e reinstalar**: `make destroy && make setup`

---

**Ambiente preparado para DevOps Ninja! 🥷**
