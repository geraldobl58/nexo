#!/bin/bash
set -e

echo "🚀 Nexo CloudLab - Instalando ArgoCD"
echo "====================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se ArgoCD já está instalado
if kubectl get namespace argocd >/dev/null 2>&1; then
    if kubectl get deployment argocd-server -n argocd >/dev/null 2>&1; then
        echo -e "${BLUE}ℹ️  ArgoCD já está instalado${NC}"
        read -p "Deseja reinstalar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
fi

# Instalar ArgoCD
echo -e "${YELLOW}📦 Instalando ArgoCD via Helm...${NC}"
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

helm upgrade --install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set server.extraArgs[0]="--insecure" \
  --set configs.params."server\.insecure"=true \
  --set server.service.type=ClusterIP \
  --set controller.metrics.enabled=true \
  --set server.metrics.enabled=true \
  --set repoServer.metrics.enabled=true \
  --wait

# Aguardar pods ficarem prontos
echo -e "${YELLOW}⏳ Aguardando ArgoCD ficar pronto...${NC}"
kubectl wait --for=condition=ready pod \
  --selector=app.kubernetes.io/name=argocd-server \
  --namespace=argocd \
  --timeout=300s

# Criar Ingress
echo -e "${YELLOW}🌐 Configurando Ingress...${NC}"
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server
  namespace: argocd
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
spec:
  ingressClassName: nginx
  rules:
  - host: argocd.local.nexo.dev
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 80
EOF

# Obter senha inicial
echo -e "${YELLOW}🔑 Obtendo senha inicial do ArgoCD...${NC}"
sleep 5
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

# Instalar ArgoCD CLI
echo -e "${YELLOW}📦 Instalando ArgoCD CLI...${NC}"
if ! command -v argocd >/dev/null 2>&1; then
    brew install argocd
fi

echo ""
echo -e "${GREEN}✅ ArgoCD instalado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📊 Informações de Acesso:${NC}"
echo "  URL: https://argocd.local.nexo.dev"
echo "  Usuário: admin"
echo "  Senha: $ARGOCD_PASSWORD"
echo ""
echo -e "${YELLOW}💾 Salvando credenciais...${NC}"
cat <<EOF > "$(pwd)/argocd-credentials.txt"
ArgoCD Credentials
==================
URL: https://argocd.local.nexo.dev
Username: admin
Password: $ARGOCD_PASSWORD

CLI Login:
argocd login argocd.local.nexo.dev --username admin --password $ARGOCD_PASSWORD --insecure
EOF

echo -e "${GREEN}✅ Credenciais salvas em argocd-credentials.txt${NC}"
echo ""
echo -e "${BLUE}📦 Comandos úteis:${NC}"
echo "  kubectl get pods -n argocd"
echo "  argocd login argocd.local.nexo.dev --insecure"
echo "  argocd app list"
echo ""
echo "Próximo passo: ./scripts/03-install-observability.sh"
