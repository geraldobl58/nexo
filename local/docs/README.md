# Nexo CloudLab - Documentação

Documentação completa do ambiente de desenvolvimento local CloudLab.

## 📚 Índice

1. **[Instalação e Configuração](./01-installation.md)**
   - Pré-requisitos
   - Instalação rápida vs manual
   - Configuração do SSD externo
   - Verificação da instalação

2. **[Kubernetes Local (k3d)](./02-kubernetes.md)**
   - Arquitetura do cluster
   - Gestão do cluster (criar, parar, deletar)
   - Namespaces e contextos
   - Storage e volumes
   - Networking e ingress
   - Registry local

3. **[ArgoCD GitOps](./03-argocd.md)**
   - Conceitos (Application, ApplicationSet, Project)
   - Gestão de aplicações
   - Sync policies e hooks
   - Secrets management
   - Notificações
   - Multi-cluster

4. **[Observabilidade](./04-observability.md)**
   - Stack Prometheus + Grafana + AlertManager
   - Dashboards pré-configurados
   - Métricas customizadas
   - Alertas e recording rules
   - Queries úteis

5. **[Logging (ELK)](./05-logging.md)**
   - Stack Elasticsearch + Kibana + Filebeat
   - Queries no Kibana
   - Structured logging
   - Dashboards e alertas
   - Retention e ILM

6. **[Deploy de Aplicações](./06-applications.md)**
   - Workflow de desenvolvimento
   - Build e push de imagens
   - Configuração Helm charts
   - Rollback e scaling
   - Migrations
   - CI/CD integration

7. **[Troubleshooting](./07-troubleshooting.md)**
   - Problemas comuns
   - Script de diagnóstico
   - Logs importantes
   - Comandos de emergência

8. **[Cheat Sheet](./08-cheatsheet.md)**
   - Comandos kubectl essenciais
   - k3d, ArgoCD, Helm, Docker
   - Prometheus queries
   - Elasticsearch queries
   - Aliases úteis
   - One-liners poderosos

9. **[Integração com GitHub](./09-github-integration.md)**
   - Configurar secrets no GitHub
   - CI/CD com GitHub Actions
   - Self-hosted runner
   - Deploy automatizado
   - Release para produção (g3developer.online)

10. **[Arquitetura CloudLab](./10-architecture.md)**
    - Diagrama completo da infraestrutura
    - Componentes e suas interações
    - Fluxo de deployment GitOps
    - Estratégia multi-ambiente
    - Alocação de recursos
    - Segurança e controle de acesso
    - Monitoramento e observabilidade

11. **[Ambientes e Domínios](./11-environments-and-domains.md)**
    - CloudLab Local vs Produção Real
    - Por que HTTP local e HTTPS em produção
    - Configuração de DNS e Let's Encrypt
    - Fluxo de deploy por ambiente
    - Setup de produção no DigitalOcean

12. **[Configuração de DNS](./12-dns-configuration.md)**
    - Como configurar /etc/hosts automaticamente
    - Todos os domínios disponíveis
    - Troubleshooting de DNS
    - Alternativas ao /etc/hosts
    - Restaurar backups

## 🚀 Quick Links

### Instalação

```bash
# Setup completo em um comando
./setup.sh

# Ou passo a passo
make install
```

### Acesso Rápido

```bash
# Ver todas as URLs
make urls

# Abrir dashboards
make dashboard   # ArgoCD
make grafana     # Grafana
make kibana      # Kibana
make prometheus  # Prometheus

# Status do cluster
make status
```

### Gestão

```bash
make start       # Iniciar cluster
make stop        # Parar cluster
make restart     # Reiniciar cluster
make clean       # Limpar tudo
```

## 📖 Leitura Recomendada

### Iniciantes

1. [01 - Instalação](./01-installation.md)
2. [02 - Kubernetes](./02-kubernetes.md)
3. [08 - Cheat Sheet](./08-cheatsheet.md)
4. [07 - Troubleshooting](./07-troubleshooting.md)

### Intermediário

1. [03 - ArgoCD](./03-argocd.md)
2. [06 - Aplicações](./06-applications.md)
3. [04 - Observabilidade](./04-observability.md)

### Avançado

1. [05 - Logging](./05-logging.md)
2. [04 - Observabilidade](./04-observability.md) (alertas e recording rules)
3. [03 - ArgoCD](./03-argocd.md) (hooks e multi-cluster)

## 🎯 Casos de Uso

### Desenvolvimento Local

```bash
# Iniciar ambiente
make start

# Ver apps rodando
kubectl get pods -n nexo-local

# Ver logs
make logs SERVICE=nexo-be

# Port-forward para debug
make port-forward SERVICE=nexo-be PORT=3000
```

### Testes de Deploy

```bash
# Build nova versão
docker build -t registry.nexo.local:5000/nexo-be:v1.2.3 apps/nexo-be
docker push registry.nexo.local:5000/nexo-be:v1.2.3

# Atualizar Helm values
vim local/helm/nexo-be/values-local.yaml

# Git commit e push
git add . && git commit -m "release: v1.2.3" && git push

# ArgoCD sync automaticamente
argocd app sync nexo-be-local
```

### Aprendizado DevOps

```bash
# Explorar cluster com k9s
k9s

# Ver métricas no Grafana
make grafana

# Analisar logs no Kibana
make kibana

# Experimentar queries no Prometheus
make prometheus
```

### Troubleshooting

```bash
# Diagnóstico completo
./scripts/troubleshoot.sh

# Ver pods com problemas
kubectl get pods -A --field-selector=status.phase!=Running

# Ver eventos recentes
kubectl get events -A --sort-by='.lastTimestamp' | tail -n 20

# Restart serviço
kubectl rollout restart deployment nexo-be -n nexo-local
```

## 💡 Dicas

### Performance

- Alocar pelo menos 6GB de RAM para Docker Desktop
- Usar SSD externo para volumes persistentes
- Limpar imagens Docker antigas: `docker system prune -a`
- Monitorar recursos: `kubectl top nodes`

### Produtividade

- Instalar k9s para interface visual
- Configurar aliases (ver [Cheat Sheet](./08-cheatsheet.md))
- Usar kubectx/kubens para trocar contextos rapidamente
- Salvar queries úteis do Prometheus e Kibana

### Segurança (para produção)

- Nunca commitar secrets no Git
- Usar Sealed Secrets ou External Secrets Operator
- Habilitar Network Policies
- Configurar Resource Quotas
- Scan de imagens com Trivy

## 🔗 Recursos Externos

### Documentação Oficial

- [Kubernetes](https://kubernetes.io/docs/)
- [k3d](https://k3d.io/)
- [ArgoCD](https://argo-cd.readthedocs.io/)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
- [Elasticsearch](https://www.elastic.co/guide/)

### Tutoriais Recomendados

- [Kubernetes the Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way)
- [ArgoCD Tutorial](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)

### Comunidade

- [Kubernetes Slack](https://slack.k8s.io/)
- [CNCF Slack](https://slack.cncf.io/)
- [ArgoCD Community](https://argoproj.github.io/community/)

## 🆘 Precisa de Ajuda?

1. Verifique o [Troubleshooting Guide](./07-troubleshooting.md)
2. Execute `./scripts/troubleshoot.sh` para diagnóstico
3. Consulte o [Cheat Sheet](./08-cheatsheet.md) para comandos
4. Pesquise nos logs: `kubectl logs` ou Kibana

## 📝 Contribuindo

Este CloudLab é parte do projeto Nexo e pode ser melhorado:

- Adicionar novos componentes (Service Mesh, Vault, etc)
- Melhorar automação dos scripts
- Adicionar mais dashboards
- Documentar novos casos de uso

## 📜 Licença

Este projeto faz parte do ecossistema Nexo.

---

**Bom aprendizado e desenvolvimento! 🚀**
