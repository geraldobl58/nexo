#!/bin/bash
# ============================================================================
# Nexo Platform - Setup DigitalOcean Kubernetes (DOKS)
# ============================================================================
# Pré-requisitos:
#   - doctl instalado (brew install doctl)
#   - doctl autenticado (doctl auth init)
#   - helm instalado (brew install helm)
#   - kubectl instalado (brew install kubectl)
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Configurando cluster DOKS para Nexo Platform..."
echo ""

# --- Variáveis ---
CLUSTER_NAME="nexo-cluster"
REGION="nyc1"
NODE_SIZE="s-2vcpu-4gb"
NODE_COUNT=3
K8S_VERSION="1.31"

# --- 1. Criar cluster (se não existir) ---
if doctl kubernetes cluster get "$CLUSTER_NAME" &>/dev/null; then
  echo "✅ Cluster $CLUSTER_NAME já existe"
else
  echo "📦 Criando cluster $CLUSTER_NAME..."
  K8S_SLUG=$(doctl kubernetes options versions -o json | jq -r ".[].slug" | grep "^${K8S_VERSION}" | head -1)
  doctl kubernetes cluster create "$CLUSTER_NAME" \
    --region "$REGION" \
    --size "$NODE_SIZE" \
    --count "$NODE_COUNT" \
    --version "$K8S_SLUG" \
    --auto-upgrade \
    --surge-upgrade \
    --tag nexo
fi

# --- 2. Configurar kubeconfig ---
echo "🔑 Configurando kubeconfig..."
doctl kubernetes cluster kubeconfig save "$CLUSTER_NAME"

# --- 3. Instalar NGINX Ingress Controller ---
echo "🌐 Instalando NGINX Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 2>/dev/null || true
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.publishService.enabled=true \
  --set controller.service.type=LoadBalancer \
  --wait

# --- 4. Instalar cert-manager ---
echo "🔒 Instalando cert-manager..."
helm repo add jetstack https://charts.jetstack.io 2>/dev/null || true
helm repo update
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.16.3 \
  --set crds.enabled=true \
  --wait

# --- 5. Aplicar ClusterIssuers ---
echo "📜 Aplicando ClusterIssuers..."
kubectl apply -f "$SCRIPT_DIR/../k8s/base/cert-manager-issuer.yaml"

# --- 6. Criar namespaces ---
echo "📁 Criando namespaces..."
kubectl apply -f "$SCRIPT_DIR/../k8s/base/namespaces.yaml"

# --- 7. Instalar ArgoCD ---
echo "🔄 Instalando ArgoCD..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "⏳ Aguardando ArgoCD ficar pronto..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# --- 8. Senha do ArgoCD ---
echo ""
echo "🔐 Senha inicial do ArgoCD:"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""
echo ""

# --- 9. Aplicar ArgoCD projects e apps ---
echo "📋 Aplicando ArgoCD projects..."
kubectl apply -f "$SCRIPT_DIR/../argocd/projects/nexo-environments.yaml"

echo "📋 Aplicando ArgoCD ApplicationSet..."
kubectl apply -f "$SCRIPT_DIR/../argocd/applicationsets/nexo-apps.yaml"

# --- 10. Obter IP do LoadBalancer ---
echo ""
echo "⏳ Aguardando LoadBalancer IP..."
sleep 30
LB_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")

echo ""
echo "============================================"
echo "✅ Setup DOKS concluído!"
echo "============================================"
echo ""
echo "📌 LoadBalancer IP: $LB_IP"
echo ""
echo "🌐 URLs disponíveis via g3developer.online (DigitalOcean DNS apontando para $LB_IP):"
echo ""
echo "   DEVELOP:"
echo "   https://develop.g3developer.online"
echo "   https://develop.api.g3developer.online"
echo "   https://develop.auth.g3developer.online"
echo ""
echo "   PRODUCTION:"
echo "   https://app.g3developer.online"
echo "   https://api.g3developer.online"
echo "   https://auth.g3developer.online"
echo ""
echo "🔑 Próximo passo: executar ./create-secrets.sh"
