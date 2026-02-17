#!/bin/bash
set -e

cat << "EOF"
 _   _                        ____ _                 _ _          _     
| \ | | _____  _____         / ___| | ___  _   _  __| | |    __ _| |__  
|  \| |/ _ \ \/ / _ \ _____ | |   | |/ _ \| | | |/ _` | |   / _` | '_ \ 
| |\  |  __/>  < (_) |_____|| |___| | (_) | |_| | (_| | |__| (_| | |_) |
|_| \_|\___/_/\_\___/        \____|_|\___/ \__,_|\__,_|_____\__,_|_.__/ 
                                                                         
🚀 Nexo CloudLab - Setup Completo
==================================
EOF

echo ""
echo "Este script irá configurar todo o CloudLab do zero."
echo ""
read -p "Deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelado."
    exit 0
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🎯 Etapas do Setup:${NC}"
echo "1. Instalar dependências (brew, k3d, kubectl, helm, k9s...)"
echo "2. Criar cluster Kubernetes local (1 server + 6 agents)"
echo "3. Instalar ArgoCD para GitOps"
echo "4. Instalar stack de observabilidade (Prometheus + Grafana)"
echo ""
echo "Tempo estimado: 10-15 minutos"
echo ""
read -p "Iniciar setup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelado."
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 Iniciando setup completo...${NC}"
echo ""

# Step 1
echo -e "${YELLOW}📦 ETAPA 1/4: Instalando dependências...${NC}"
./scripts/00-install-deps.sh
echo ""

# Step 2
echo -e "${YELLOW}🎯 ETAPA 2/4: Criando cluster Kubernetes...${NC}"
./scripts/01-create-cluster.sh
echo ""

# Step 3
echo -e "${YELLOW}🔧 ETAPA 3/4: Instalando ArgoCD...${NC}"
./scripts/02-install-argocd.sh
echo ""

# Step 4
echo -e "${YELLOW}📊 ETAPA 4/4: Instalando Observabilidade...${NC}"
./scripts/03-install-observability.sh
echo ""

# Step 5 - Elasticsearch/Kibana (DESABILITADO - muito pesado)
# echo -e "${YELLOW}🔍 ETAPA 5/5: Instalando Logging...${NC}"
# ./scripts/04-install-elasticsearch.sh
# echo ""

# Final
echo ""
echo -e "${GREEN}✨ Setup Completo! ✨${NC}"
echo ""
./scripts/99-show-urls.sh
echo ""
echo -e "${BLUE}📚 Próximos Passos:${NC}"
echo ""
echo "1. Acesse os dashboards (URLs acima)"
echo "2. Leia a documentação: docs/README.md"
echo "3. Deploy suas apps: make deploy-apps"
echo "4. Explore com k9s: k9s"
echo ""
echo -e "${GREEN}🥷 Você é um DevOps Ninja agora!${NC}"
echo ""
