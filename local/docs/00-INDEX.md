# 📚 Nexo CloudLab - Índice da Documentação

Documentação completa do ambiente de desenvolvimento local CloudLab - 100% local, sem dependências de cloud.

---

## 🚀 Início Rápido

- **[QUICK-START.md](./QUICK-START.md)** - 3 comandos principais: setup, status, destroy
- **[README.md](./README.md)** - Visão geral do CloudLab

---

## 📖 Documentação Detalhada

### **[00 - Instalação e Configuração](./00-installation.md)**

- Pré-requisitos do sistema
- Instalação rápida vs manual
- Configuração do SSD externo
- Verificação da instalação
- Problemas comuns na instalação

### **[01 - Kubernetes Local (k3d)](./01-kubernetes.md)**

- Arquitetura do cluster (7 nodes)
- Gestão do cluster (criar, parar, deletar)
- Namespaces e contextos
- Storage e volumes persistentes
- Networking e ingress (Traefik)
- Registry local

### **[02 - ArgoCD GitOps](./02-argocd.md)**

- Conceitos (Application, ApplicationSet, Project)
- Gestão de 12 aplicações (3 serviços × 4 ambientes)
- Sync policies e hooks
- Secrets management
- Troubleshooting aplicações degradadas

### **[03 - Observabilidade](./03-observability.md)**

- Stack Prometheus + Grafana + AlertManager
- Dashboards pré-configurados (6 no total)
- Métricas customizadas
- Alertas e recording rules
- Queries úteis do PromQL

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

### **[09 - Arquitetura CloudLab](./09-architecture.md)**

- Diagrama completo da infraestrutura local
- Componentes e suas interações
- Fluxo de deployment GitOps
- Estratégia multi-ambiente (4 ambientes)
- Alocação de recursos
- Monitoramento e observabilidade

---

## 📄 Guias Especializados

### **[ENVIRONMENTS.md](./ENVIRONMENTS.md)** - 4 Ambientes Completos

- Develop, QA, Staging, Production
- URLs e namespaces de cada ambiente
- Fluxo de promoção entre ambientes
- Estratégias de deploy e rollback
- Recursos e réplicas por ambiente

### **[GRAFANA-DASHBOARDS.md](./GRAFANA-DASHBOARDS.md)** - Monitoramento

- 6 dashboards instalados (4 padrão + 2 customizados)
- Acesso e credenciais do Grafana
- Painéis disponíveis e métricas
- Como criar dashboards customizados

### **[FIX-DEGRADED-APPS.md](./FIX-DEGRADED-APPS.md)** - Solução Rápida

- Resolver apps "Degraded" no ArgoCD
- Criar secrets do GitHub (ghcr-secret)
- Aplicar secrets em todos os namespaces
- Verificação pós-correção

---

## 🚀 Quick Links

### Instalação Rápida

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo
make setup
```

### Comandos Essenciais

```bash
make status   # Ver status do cluster
make destroy  # Destruir tudo e começar de novo
```

### URLs Principais

```
ArgoCD:       http://argocd.nexo.local
Grafana:      http://grafana.nexo.local
Prometheus:   http://prometheus.nexo.local
AlertManager: http://alertmanager.nexo.local
```

---

## 📚 Ordem Recomendada de Leitura

### Para Iniciantes

1. [README.md](./README.md) - Visão geral do CloudLab
2. [QUICK-START.md](./QUICK-START.md) - 3 comandos principais
3. [00 - Instalação](./00-installation.md) - Pré-requisitos e instalação
4. [FIX-DEGRADED-APPS.md](./FIX-DEGRADED-APPS.md) - Configurar GitHub token
5. [06 - Troubleshooting](./06-troubleshooting.md) - Resolver problemas

### Para Uso Diário

1. [07 - Cheat Sheet](./07-cheatsheet.md) - Comandos úteis
2. [ENVIRONMENTS.md](./ENVIRONMENTS.md) - Entender os 4 ambientes
3. [05 - Deploy](./05-applications.md) - Fazer deploy de apps
4. [02 - ArgoCD](./02-argocd.md) - GitOps workflow
5. [GRAFANA-DASHBOARDS.md](./GRAFANA-DASHBOARDS.md) - Monitorar aplicações

### Para Aprofundamento

1. [09 - Arquitetura](./09-architecture.md) - Como tudo funciona
2. [03 - Observabilidade](./03-observability.md) - Métricas e dashboards
3. [01 - Kubernetes](./01-kubernetes.md) - Gestão do cluster k3d

---

## 🆘 Precisa de Ajuda?

- **Problemas comuns**: [06 - Troubleshooting](./06-troubleshooting.md)
- **Apps degradados**: [FIX-DEGRADED-APPS.md](./FIX-DEGRADED-APPS.md)
- **Comandos rápidos**: [07 - Cheat Sheet](./07-cheatsheet.md)
- **Logs**: `kubectl logs -n <namespace> <pod>`
- **Destroy e reinstalar**: `make destroy && make setup`

---

**CloudLab 100% Local - Zero dependências de cloud! 🚀**
