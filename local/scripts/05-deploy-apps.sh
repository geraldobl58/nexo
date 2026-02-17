#!/bin/bash
set -e

echo "🚀 Nexo CloudLab - Deploy de Aplicações via ArgoCD"
echo "==================================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se ArgoCD está instalado
if ! kubectl get namespace argocd >/dev/null 2>&1; then
    echo -e "${RED}❌ ArgoCD não está instalado!${NC}"
    echo "Execute: ./scripts/02-install-argocd.sh"
    exit 1
fi

# Login no ArgoCD
echo -e "${YELLOW}🔐 Fazendo login no ArgoCD...${NC}"
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
argocd login argocd.local.nexo.dev --username admin --password "$ARGOCD_PASSWORD" --insecure

# Criar projeto ArgoCD para nexo-local
echo -e "${YELLOW}🏗️  Criando projeto ArgoCD...${NC}"
cat <<EOF | kubectl apply -f -
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: nexo-local
  namespace: argocd
spec:
  description: Nexo applications for local development
  sourceRepos:
  - '*'
  destinations:
  - namespace: nexo-local
    server: https://kubernetes.default.svc
  - namespace: '*'
    server: https://kubernetes.default.svc
  clusterResourceWhitelist:
  - group: '*'
    kind: '*'
  namespaceResourceWhitelist:
  - group: '*'
    kind: '*'
EOF

# Criar ApplicationSet para apps locais
echo -e "${YELLOW}📦 Criando ApplicationSet...${NC}"
cat <<EOF | kubectl apply -f -
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: nexo-apps-local
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - service: nexo-be
            path: local/helm/nexo-be
          - service: nexo-fe
            path: local/helm/nexo-fe
          - service: nexo-auth
            path: local/helm/nexo-auth
  
  template:
    metadata:
      name: "{{service}}-local"
      labels:
        app: "{{service}}"
        environment: local
    spec:
      project: nexo-local
      source:
        repoURL: https://github.com/geraldobl58/nexo.git
        targetRevision: main
        path: "{{path}}"
        helm:
          valueFiles:
            - values-local.yaml
      destination:
        server: https://kubernetes.default.svc
        namespace: nexo-local
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
          - CreateNamespace=true
        retry:
          limit: 3
          backoff:
            duration: 5s
            factor: 2
            maxDuration: 3m
EOF

# Aguardar apps ficarem prontos
echo -e "${YELLOW}⏳ Aguardando aplicações sincronizarem...${NC}"
echo "Isso pode levar alguns minutos na primeira vez..."

# Verificar status
sleep 10
argocd app list

echo ""
echo -e "${GREEN}✅ Aplicações deployadas!${NC}"
echo ""
echo -e "${BLUE}📊 Status das Aplicações:${NC}"
kubectl get pods -n nexo-local
echo ""
echo -e "${BLUE}🌐 URLs das Aplicações:${NC}"
echo "  Backend:  http://nexo-be.local.nexo.dev"
echo "  Frontend: http://nexo-fe.local.nexo.dev"
echo "  Auth:     http://nexo-auth.local.nexo.dev"
echo ""
echo -e "${BLUE}📦 Comandos úteis:${NC}"
echo "  argocd app list"
echo "  argocd app get nexo-be-local"
echo "  argocd app sync nexo-be-local"
echo "  kubectl get pods -n nexo-local"
echo "  kubectl logs -n nexo-local -l app=nexo-be"
echo ""
echo "Próximo passo: ./scripts/99-show-urls.sh para ver todas as URLs"
