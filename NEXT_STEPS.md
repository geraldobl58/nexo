# ⚡ Ações Imediatas - Nexo CloudLab

## 📋 Resumo das Respostas

### 1. ❌ g3developer.online + Let's Encrypt no CloudLab Local

**NÃO É POSSÍVEL** usar Let's Encrypt no CloudLab local porque:

- Let's Encrypt precisa validar o domínio via internet (HTTP-01 ou DNS-01 challenge)
- CloudLab está em `127.0.0.1` (localhost) - não acessível externamente
- Solução correta:
  - ✅ **Local (cloudlab):** HTTP simples
  - ✅ **Produção (DigitalOcean):** HTTPS com Let's Encrypt

📖 **Documentação:** [Ambientes e Domínios](./local/docs/11-environments-and-domains.md)

---

### 2. ✅ Sim, Precisa Aumentar o Cluster!

**Atual:** 3 nodes (1 server + 2 agents) = 6 CPUs, 12GB RAM
**Recomendado:** 7 nodes (1 server + 6 agents) = 14+ CPUs, 28+ GB RAM

**Motivo:** Nossa infraestrutura é pesada:

- ArgoCD
- Prometheus + Grafana + AlertManager
- Elasticsearch + Kibana + Filebeat (3 nodes)
- Harbor Registry
- 4 ambientes x 3 apps = 12 aplicações

**✅ JÁ AJUSTADO:** [local/config/k3d-config.yaml](/local/config/k3d-config.yaml) agora usa 7 nodes

---

### 3. 🌿 Branches Necessárias

**✅ Existem:**

- `main` (produção)
- `develop` (desenvolvimento)

**❌ Criar:**

- `qa` (quality assurance)
- `staging` (homologação)

📖 **Guia completo:** [BRANCHES.md](./BRANCHES.md)

---

## 🚀 Próximos Passos

### Passo 1: Aumentar Recursos do Docker Desktop

```bash
# Abrir Docker Desktop
# Settings > Resources:
# - CPUs: 8-12
# - Memory: 12-16 GB
# - Swap: 4 GB
# - Disk: 100 GB

# Restart Docker Desktop
```

### Passo 2: Recriar Cluster com 7 Nodes

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo/local

# Destruir cluster antigo (3 nodes)
k3d cluster delete nexo-local

# Criar novo cluster (7 nodes)
./scripts/01-create-cluster.sh

# Verificar nodes
kubectl get nodes
# Deve mostrar: k3d-nexo-local-server-0 + k3d-nexo-local-agent-0 a 5 = 7 nodes
```

### Passo 3: Reinstalar Infraestrutura

```bash
# Setup automático
make setup

# Ou passo a passo:
./scripts/02-install-argocd.sh
./scripts/03-install-observability.sh
./scripts/04-install-elasticsearch.sh
./scripts/06-install-harbor.sh
./scripts/05-deploy-apps.sh

# Ver status
make status
make urls
```

### Passo 4: Criar Branches QA e Staging

```bash
# Branch QA
git checkout develop
git pull origin develop
git checkout -b qa
git push -u origin qa

# Branch Staging
git checkout develop
git pull origin develop
git checkout -b staging
git push -u origin staging

# Verificar
git branch -a
# Deve mostrar: develop, qa, staging, main
```

### Passo 5: Proteger Branches no GitHub

```bash
# Acessar: https://github.com/seu-usuario/nexo/settings/branches

# Para cada branch (develop, qa, staging, main):
# 1. Add rule
# 2. Branch name pattern: develop (ou qa, staging, main)
# 3. ✅ Require pull request before merging
# 4. ✅ Require approvals (1 para develop/qa/staging, 2+ para main)
# 5. ✅ Require status checks to pass (CI)
# 6. Save
```

### Passo 6: Criar Namespaces no CloudLab

```bash
# Criar namespaces para novos ambientes
kubectl create namespace nexo-qa
kubectl create namespace nexo-staging

# Verificar
kubectl get namespaces
```

### Passo 7: Configurar ArgoCD para Novos Ambientes

Criar: `local/argocd/applicationsets/nexo-multi-env.yaml`

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: nexo-apps-multi-env
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - env: develop
            branch: develop
            namespace: nexo-local
          - env: qa
            branch: qa
            namespace: nexo-qa
          - env: staging
            branch: staging
            namespace: nexo-staging
          - env: prod
            branch: main
            namespace: nexo-prod

  template:
    metadata:
      name: "nexo-be-{{env}}"
    spec:
      project: default
      source:
        repoURL: https://github.com/geraldobl58/nexo.git
        targetRevision: "{{branch}}"
        path: local/helm/nexo-be
        helm:
          valueFiles:
            - values-local.yaml
      destination:
        server: https://kubernetes.default.svc
        namespace: "{{namespace}}"
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
          - CreateNamespace=true
---
# Repetir para nexo-fe e nexo-auth
```

```bash
# Aplicar no ArgoCD
kubectl apply -f local/argocd/applicationsets/nexo-multi-env.yaml

# Verificar apps
argocd app list
```

---

## 📊 Checklist Completo

### Infraestrutura

- [ ] Docker Desktop: 12+ GB RAM, 8+ CPUs
- [ ] Cluster k3d recriado com 7 nodes
- [ ] ArgoCD instalado
- [ ] Prometheus + Grafana instalados
- [ ] Elasticsearch + Kibana instalados
- [ ] Harbor Registry instalado
- [ ] Apps deployadas em develop

### Git & GitHub

- [ ] Branch `qa` criada e publicada
- [ ] Branch `staging` criada e publicada
- [ ] Branch protection rules configuradas
- [ ] GitHub secrets configurados
- [ ] Self-hosted runner instalado (opcional)

### Kubernetes

- [ ] Namespace `nexo-qa` criado
- [ ] Namespace `nexo-staging` criado
- [ ] ArgoCD ApplicationSet configurado para 4 ambientes
- [ ] Apps sincronizadas em todos os ambientes
- [ ] `/etc/hosts` configurado (automático)

### Validação

- [ ] `kubectl get nodes` mostra 7 nodes
- [ ] `argocd app list` mostra apps para 4 ambientes
- [ ] Todas as URLs acessíveis:
  - http://develop.nexo.local
  - http://qa.nexo.local
  - http://staging.nexo.local
  - http://prod.nexo.local
- [ ] Todas as ferramentas acessíveis (ArgoCD, Grafana, etc)

---

## 🎯 Comandos Rápidos

```bash
# Ver recursos do cluster
make top

# Ver status de todos os pods
kubectl get pods -A

# Ver apps do ArgoCD
argocd app list

# Ver todas as URLs
make urls

# Acessar ArgoCD
open http://argocd.nexo.local

# Ver branches
git branch -a

# Troubleshooting
make troubleshoot
```

---

## 📖 Documentação Relevante

1. **[BRANCHES.md](./BRANCHES.md)** - Estratégia completa de branches
2. **[Ambientes e Domínios](./local/docs/11-environments-and-domains.md)** - HTTP vs HTTPS
3. **[Arquitetura CloudLab](./local/docs/10-architecture.md)** - Diagramas completos
4. **[Instalação](./local/docs/01-installation.md)** - Setup detalhado
5. **[GitHub Integration](./local/docs/09-github-integration.md)** - CI/CD

---

## ⚠️ Pontos de Atenção

### Let's Encrypt

- ❌ **NÃO FUNCIONA** no cloudlab local (127.0.0.1)
- ✅ **FUNCIONA** no servidor de produção (DigitalOcean)
- Motivo: Precisa validar domínio via internet

### Recursos

- 3 nodes é POUCO para nossa infraestrutura
- 7 nodes é IDEAL para rodar tudo confortavelmente
- Aumentar RAM do Docker é ESSENCIAL

### Branches

- Sempre desenvolver em `feature/*` → PR para `develop`
- QA e Staging servem como gates de qualidade
- Main = produção, precisa aprovação rigorosa

---

## 🆘 Precisa de Ajuda?

### Problemas com recursos

```bash
# Ver uso
kubectl top nodes
kubectl top pods -A

# Docker stats
docker stats
```

### Cluster não sobe

```bash
# Limpar tudo
docker system prune -af

# Aumentar recursos do Docker
# Settings > Resources > Memory: 16GB
```

### Branches não sincronizam no ArgoCD

```bash
# Forçar sync
argocd app sync <app-name> --force

# Ver logs
argocd app logs <app-name>
```

---

**Comece agora:** Executar Passo 1 (aumentar Docker) e Passo 2 (recriar cluster)! 🚀
