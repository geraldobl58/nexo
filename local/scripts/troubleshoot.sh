#!/bin/bash

echo "🔍 Nexo CloudLab - Troubleshooting"
echo "=================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if cluster exists
if ! k3d cluster list | grep -q "nexo-local"; then
    echo -e "${RED}❌ Cluster nexo-local não encontrado!${NC}"
    echo "Execute: make create-cluster"
    exit 1
fi

echo -e "${BLUE}📊 1. Status do Cluster${NC}"
echo "======================="
k3d cluster list
echo ""

echo -e "${BLUE}📦 2. Nodes${NC}"
echo "==========="
kubectl get nodes -o wide
echo ""

echo -e "${BLUE}⚠️  3. Pods com Problemas${NC}"
echo "========================"
kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded
if [ $? -ne 0 ]; then
    echo -e "${GREEN}✅ Nenhum pod com problemas${NC}"
fi
echo ""

echo -e "${BLUE}🔄 4. Pods com Muitos Restarts${NC}"
echo "=============================="
kubectl get pods -A --sort-by='.status.containerStatuses[0].restartCount' | tail -n 10
echo ""

echo -e "${BLUE}📅 5. Últimos Eventos (20)${NC}"
echo "=========================="
kubectl get events -A --sort-by='.lastTimestamp' | tail -n 20
echo ""

echo -e "${BLUE}💾 6. Uso de Recursos - Nodes${NC}"
echo "============================="
kubectl top nodes 2>/dev/null || echo -e "${YELLOW}⚠️  Metrics não disponíveis${NC}"
echo ""

echo -e "${BLUE}📊 7. Uso de Recursos - Top 10 Pods${NC}"
echo "===================================="
kubectl top pods -A --sort-by=memory 2>/dev/null | head -n 11 || echo -e "${YELLOW}⚠️  Metrics não disponíveis${NC}"
echo ""

echo -e "${BLUE}🗄️  8. Volumes e Storage${NC}"
echo "========================"
kubectl get pv
echo ""
kubectl get pvc -A
echo ""

echo -e "${BLUE}🌐 9. Services e Ingress${NC}"
echo "========================"
echo "Services:"
kubectl get svc -A
echo ""
echo "Ingress:"
kubectl get ingress -A
echo ""

echo -e "${BLUE}🔍 10. Health Check - Componentes${NC}"
echo "=================================="

check_component() {
    local name=$1
    local namespace=$2
    local selector=$3
    
    if kubectl get pods -n $namespace -l $selector 2>/dev/null | grep -q "Running"; then
        echo -e "  ${GREEN}✅ $name${NC}"
    else
        echo -e "  ${RED}❌ $name${NC}"
        kubectl get pods -n $namespace -l $selector 2>/dev/null
    fi
}

check_component "ArgoCD" "argocd" "app.kubernetes.io/name=argocd-server"
check_component "Prometheus" "monitoring" "app.kubernetes.io/name=prometheus"
check_component "Grafana" "monitoring" "app.kubernetes.io/name=grafana"
check_component "Elasticsearch" "logging" "app=elasticsearch-master"
check_component "Kibana" "logging" "app=kibana"
check_component "Ingress NGINX" "ingress-nginx" "app.kubernetes.io/component=controller"

echo ""

echo -e "${BLUE}🔗 11. DNS e Conectividade${NC}"
echo "==========================="
echo "Testando DNS..."
kubectl run -it --rm dns-test --image=busybox --restart=Never -- nslookup kubernetes.default 2>/dev/null || \
    echo -e "${YELLOW}⚠️  Não foi possível testar DNS${NC}"
echo ""

echo -e "${BLUE}💿 12. Disk Usage do SSD${NC}"
echo "========================"
if [ -d "/Volumes/Backup/nexo-cloudlab" ]; then
    du -sh /Volumes/Backup/nexo-cloudlab/*
else
    echo -e "${YELLOW}⚠️  SSD não montado em /Volumes/Backup${NC}"
fi
echo ""

echo -e "${BLUE}🐳 13. Docker Status${NC}"
echo "===================="
docker info > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker está rodando${NC}"
    echo ""
    echo "Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" | grep k3d
else
    echo -e "${RED}❌ Docker não está rodando!${NC}"
fi
echo ""

echo -e "${BLUE}📝 14. Logs Recentes de Pods com Problemas${NC}"
echo "==========================================="
PROBLEM_PODS=$(kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded -o json | jq -r '.items[] | "\(.metadata.namespace) \(.metadata.name)"')

if [ -n "$PROBLEM_PODS" ]; then
    while IFS= read -r line; do
        namespace=$(echo $line | awk '{print $1}')
        pod=$(echo $line | awk '{print $2}')
        echo -e "${YELLOW}Logs de $pod em $namespace:${NC}"
        kubectl logs --tail=20 -n $namespace $pod 2>/dev/null || \
            kubectl logs --tail=20 -n $namespace $pod --previous 2>/dev/null || \
            echo "  Não foi possível obter logs"
        echo ""
    done <<< "$PROBLEM_PODS"
else
    echo -e "${GREEN}✅ Nenhum pod com problemas${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Troubleshooting Concluído!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}📚 Comandos Úteis:${NC}"
echo "  make status          # Status geral"
echo "  make logs SERVICE=x  # Logs de um serviço"
echo "  make restart         # Reiniciar cluster"
echo "  k9s                  # Interface visual"
echo ""
