#!/bin/bash

# ============================================================================
# Script para corrigir e reinstalar serviços do CloudLab
# ============================================================================
# Este script corrige os problemas de:
# - Ingress com hosts errados (*.local.nexo.dev → *.nexo.local)
# - Grafana datasource conflitante (CrashLoopBackOff)
# - ArgoCD, Prometheus, Grafana, AlertManager
# ============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Nexo CloudLab - Fix Services${NC}"
echo "=================================="
echo ""
echo "Este script irá:"
echo "  1. Remover versões antigas dos serviços"
echo "  2. Deletar ingress com hosts errados"
echo "  3. Reinstalar ArgoCD e Observability com hosts corretos"
echo ""
read -p "Continuar? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Abortado."
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 STEP 1/4: Removendo releases antigos...${NC}"
echo ""

# Remove ArgoCD
if helm list -n argocd 2>/dev/null | grep -q argocd; then
    echo "  Removendo ArgoCD..."
    helm uninstall argocd -n argocd --wait 2>/dev/null || true
fi

# Remove Observability stack
if helm list -n monitoring 2>/dev/null | grep -q kube-prometheus-stack; then
    echo "  Removendo kube-prometheus-stack..."
    helm uninstall kube-prometheus-stack -n monitoring --wait 2>/dev/null || true
fi

echo ""
echo -e "${YELLOW}🗑️  STEP 2/4: Deletando ingress com hosts errados...${NC}"
echo ""

kubectl delete ingress -n argocd argocd-server 2>/dev/null || echo "  (já deletado ou não existe)"
kubectl delete ingress -n monitoring kube-prometheus-stack-grafana 2>/dev/null || echo "  (já deletado ou não existe)"
kubectl delete ingress -n monitoring kube-prometheus-stack-prometheus 2>/dev/null || echo "  (já deletado ou não existe)"
kubectl delete ingress -n monitoring kube-prometheus-stack-alertmanager 2>/dev/null || echo "  (já deletado ou não existe)"

# Aguardar um pouco para Kubernetes limpar recursos
sleep 5

echo ""
echo -e "${YELLOW}🔄 STEP 3/4: Reinstalando ArgoCD...${NC}"
echo ""
cd "$(dirname "$0")"
./scripts/02-install-argocd.sh

echo ""
echo -e "${YELLOW}📊 STEP 4/4: Reinstalando Observability...${NC}"
echo ""
./scripts/03-install-observability.sh

echo ""
echo -e "${GREEN}✅ Fix completo!${NC}"
echo ""
echo -e "${BLUE}📋 Verificando serviços...${NC}"
echo ""
kubectl get ingress -A | grep -E 'argocd|grafana|prometheus|alertmanager'
echo ""
echo -e "${BLUE}📦 Status dos pods:${NC}"
echo ""
kubectl get pods -n argocd
echo ""
kubectl get pods -n monitoring | grep -E 'grafana|prometheus|alertmanager'
echo ""
echo -e "${GREEN}🎉 Pronto! Acesse:${NC}"
echo ""
echo "  ArgoCD:       http://argocd.nexo.local"
echo "  Grafana:      http://grafana.nexo.local"
echo "  Prometheus:   http://prometheus.nexo.local"
echo "  AlertManager: http://alertmanager.nexo.local"
echo ""
