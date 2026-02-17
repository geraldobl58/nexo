#!/bin/bash

cat << "EOF"
 ____            _                   
|  _ \  ___  ___| |_ _ __ ___  _   _ 
| | | |/ _ \/ __| __| '__/ _ \| | | |
| |_| |  __/\__ \ |_| | | (_) | |_| |
|____/ \___||___/\__|_|  \___/ \__, |
                                |___/ 
🗑️  Nexo CloudLab - Destroy
==========================
EOF

echo ""
echo "⚠️  ATENÇÃO: Este script irá DESTRUIR completamente o CloudLab!"
echo ""
echo "O que será removido:"
echo "  - Todos os Helm releases"
echo "  - Todos os namespaces"
echo "  - Cluster k3d completo"
echo "  - Entradas no /etc/hosts (opcional)"
echo "  - Volumes persistentes (opcional)"
echo ""
read -p "Tem certeza que deseja continuar? (digite 'yes' para confirmar): " -r
echo
if [[ ! $REPLY == "yes" ]]; then
    echo "❌ Operação cancelada."
    exit 0
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if cluster exists
if ! k3d cluster list | grep -q "nexo-local"; then
    echo -e "${YELLOW}⚠️  Cluster 'nexo-local' não encontrado.${NC}"
    echo ""
    read -p "Deseja limpar volumes e /etc/hosts mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        CLUSTER_EXISTS=false
    else
        echo "✅ Nada para fazer."
        exit 0
    fi
else
    CLUSTER_EXISTS=true
fi

if [ "$CLUSTER_EXISTS" = true ]; then
    echo ""
    echo -e "${RED}🗑️  ETAPA 1/4: Removendo Helm Releases...${NC}"
    echo ""
    
    # Remove Harbor (se existir)
    if helm list -n harbor 2>/dev/null | grep -q harbor; then
        echo "  Removendo Harbor..."
        helm uninstall harbor -n harbor --wait 2>/dev/null || true
    fi
    
    # Remove Filebeat
    if helm list -n logging 2>/dev/null | grep -q filebeat; then
        echo "  Removendo Filebeat..."
        helm uninstall filebeat -n logging --wait 2>/dev/null || true
    fi
    
    # Remove Kibana
    if helm list -n logging 2>/dev/null | grep -q kibana; then
        echo "  Removendo Kibana..."
        helm uninstall kibana -n logging --wait 2>/dev/null || true
    fi
    
    # Remove Elasticsearch
    if helm list -n logging 2>/dev/null | grep -q elasticsearch; then
        echo "  Removendo Elasticsearch..."
        helm uninstall elasticsearch -n logging --wait 2>/dev/null || true
    fi
    
    # Remove Prometheus Stack
    if helm list -n monitoring 2>/dev/null | grep -q kube-prometheus-stack; then
        echo "  Removendo Prometheus Stack..."
        helm uninstall kube-prometheus-stack -n monitoring --wait 2>/dev/null || true
    fi
    
    # Remove ArgoCD
    if helm list -n argocd 2>/dev/null | grep -q argocd; then
        echo "  Removendo ArgoCD..."
        helm uninstall argocd -n argocd --wait 2>/dev/null || true
    fi
    
    # Remove NGINX Ingress
    if helm list -n ingress-nginx 2>/dev/null | grep -q ingress-nginx; then
        echo "  Removendo NGINX Ingress..."
        helm uninstall ingress-nginx -n ingress-nginx --wait 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Helm releases removidos${NC}"
    
    echo ""
    echo -e "${RED}🗑️  ETAPA 2/4: Removendo Namespaces...${NC}"
    echo ""
    
    # Delete namespaces
    for ns in harbor logging monitoring argocd ingress-nginx nexo-local nexo-develop nexo-qa nexo-staging nexo-prod; do
        if kubectl get namespace $ns 2>/dev/null | grep -q $ns; then
            echo "  Deletando namespace: $ns"
            kubectl delete namespace $ns --wait=false 2>/dev/null || true
        fi
    done
    
    echo -e "${GREEN}✅ Namespaces marcados para deleção${NC}"
fi

echo ""
echo -e "${RED}🗑️  ETAPA 3/4: Deletando Cluster k3d...${NC}"
echo ""

# Delete cluster
k3d cluster delete nexo-local 2>/dev/null || echo "  Cluster já foi removido"

echo -e "${GREEN}✅ Cluster deletado${NC}"

echo ""
echo -e "${YELLOW}🗑️  ETAPA 4/4: Limpeza Adicional (Opcional)...${NC}"
echo ""

# Ask about persistent volumes
read -p "Deseja remover os volumes persistentes do SSD? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Removendo volumes persistentes...${NC}"
    
    sudo rm -rf /Volumes/Backup/nexo-cloudlab/data/* 2>/dev/null || true
    sudo rm -rf /Volumes/Backup/nexo-cloudlab/postgres/* 2>/dev/null || true
    sudo rm -rf /Volumes/Backup/nexo-cloudlab/prometheus/* 2>/dev/null || true
    sudo rm -rf /Volumes/Backup/nexo-cloudlab/grafana/* 2>/dev/null || true
    sudo rm -rf /Volumes/Backup/nexo-cloudlab/elasticsearch/* 2>/dev/null || true
    sudo rm -rf /Volumes/Backup/nexo-cloudlab/harbor/* 2>/dev/null || true
    
    echo -e "${GREEN}✅ Volumes removidos${NC}"
else
    echo "⏭️  Volumes persistentes mantidos"
fi

echo ""
# Ask about /etc/hosts
read -p "Deseja remover as entradas do /etc/hosts? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Removendo entradas do /etc/hosts...${NC}"
    
    # Create backup
    sudo cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d_%H%M%S)
    
    # Remove Nexo CloudLab entries
    sudo sed -i '' '/# Nexo CloudLab - START/,/# Nexo CloudLab - END/d' /etc/hosts
    
    echo -e "${GREEN}✅ Entradas removidas do /etc/hosts${NC}"
    echo "   (backup criado em /etc/hosts.backup.*)"
else
    echo "⏭️  Entradas do /etc/hosts mantidas"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🗑️  Destroy Completo! 🗑️         ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}O que foi removido:${NC}"
echo "  ✅ Todos os Helm releases"
echo "  ✅ Todos os namespaces"
echo "  ✅ Cluster k3d"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  ✅ Volumes persistentes"
    echo "  ✅ Entradas no /etc/hosts"
fi
echo ""
echo -e "${BLUE}Para recriar o CloudLab:${NC}"
echo "  make setup"
echo ""
echo -e "${YELLOW}🥷 CloudLab destruído com sucesso!${NC}"
echo ""
