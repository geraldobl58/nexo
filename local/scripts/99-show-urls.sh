#!/bin/bash

echo "🚀 Nexo CloudLab - URLs de Acesso"
echo "=================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🎯 Ferramentas de Gestão:${NC}"
echo ""
echo -e "  ${BLUE}ArgoCD (GitOps):${NC}"
echo "    URL: http://argocd.nexo.local"
echo "    User: admin"
ARGOCD_PASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d)
echo "    Pass: $ARGOCD_PASS"
echo ""

echo -e "  ${BLUE}Grafana (Métricas):${NC}"
echo "    URL: http://grafana.nexo.local"
echo "    User: admin"
echo "    Pass: nexo@local2026"
echo ""

echo -e "  ${BLUE}Prometheus (Métricas Raw):${NC}"
echo "    URL: http://prometheus.nexo.local"
echo ""

echo -e "  ${BLUE}AlertManager (Alertas):${NC}"
echo "    URL: http://alertmanager.nexo.local"
echo ""

echo -e "  ${BLUE}Kibana (Logs):${NC}"
echo "    URL: http://kibana.nexo.local"
echo ""

if kubectl get namespace harbor 2>/dev/null | grep -q harbor; then
echo -e "  ${BLUE}Harbor (Container Registry):${NC}"
echo "    URL: http://harbor.nexo.local"
echo "    User: admin"
echo "    Pass: Harbor12345"
echo ""
fi

echo -e "${GREEN}🌐 Aplicações por Ambiente:${NC}"
echo ""
echo -e "  ${BLUE}Develop:${NC}"
echo "    Frontend: http://develop.nexo.local"
echo "    API:      http://develop.api.nexo.local"
echo "    Auth:     http://develop.auth.nexo.local"
echo ""

echo -e "  ${BLUE}QA:${NC}"
echo "    Frontend: http://qa.nexo.local"
echo "    API:      http://qa.api.nexo.local"
echo "    Auth:     http://qa.auth.nexo.local"
echo ""

echo -e "  ${BLUE}Staging:${NC}"
echo "    Frontend: http://staging.nexo.local"
echo "    API:      http://staging.api.nexo.local"
echo "    Auth:     http://staging.auth.nexo.local"
echo ""

echo -e "  ${BLUE}Prod (Local):${NC}"
echo "    Frontend: http://prod.nexo.local"
echo "    API:      http://prod.api.nexo.local"
echo "    Auth:     http://prod.auth.nexo.local"
echo ""

echo -e "${YELLOW}📊 Status do Cluster:${NC}"
echo ""
kubectl get nodes -o wide
echo ""

echo -e "${YELLOW}📦 Pods por Namespace:${NC}"
echo ""
echo "Namespace: argocd"
kubectl get pods -n argocd --no-headers 2>/dev/null | wc -l | xargs echo "  Pods:"

echo "Namespace: monitoring"
kubectl get pods -n monitoring --no-headers 2>/dev/null | wc -l | xargs echo "  Pods:"

echo "Namespace: logging"
kubectl get pods -n logging --no-headers 2>/dev/null | wc -l | xargs echo "  Pods:"

echo "Namespace: nexo-local"
kubectl get pods -n nexo-local --no-headers 2>/dev/null | wc -l | xargs echo "  Pods:"

echo ""
echo -e "${GREEN}✅ CloudLab está rodando!${NC}"
echo ""
echo -e "${BLUE}📝 Comandos úteis:${NC}"
echo "  k9s                           # Interface visual para K8s"
echo "  kubectl get pods -A           # Ver todos os pods"
echo "  kubectl top nodes             # Uso de recursos dos nodes"
echo "  kubectl top pods -A           # Uso de recursos dos pods"
echo "  argocd app list               # Listar apps no ArgoCD"
echo ""
