#!/bin/bash
set -e

echo "🔧 Nexo CloudLab - Atualizar /etc/hosts"
echo "========================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Entradas para /etc/hosts
HOSTS_ENTRIES="# Nexo CloudLab - Ferramentas
127.0.0.1 argocd.nexo.local
127.0.0.1 grafana.nexo.local
127.0.0.1 prometheus.nexo.local
127.0.0.1 alertmanager.nexo.local
127.0.0.1 kibana.nexo.local
127.0.0.1 harbor.nexo.local
127.0.0.1 traefik.nexo.local

# Nexo CloudLab - Aplicações Develop
127.0.0.1 develop.nexo.local
127.0.0.1 develop.api.nexo.local
127.0.0.1 develop.auth.nexo.local

# Nexo CloudLab - Aplicações QA
127.0.0.1 qa.nexo.local
127.0.0.1 qa.api.nexo.local
127.0.0.1 qa.auth.nexo.local

# Nexo CloudLab - Aplicações Staging
127.0.0.1 staging.nexo.local
127.0.0.1 staging.api.nexo.local
127.0.0.1 staging.auth.nexo.local

# Nexo CloudLab - Aplicações Prod (Local)
127.0.0.1 prod.nexo.local
127.0.0.1 prod.api.nexo.local
127.0.0.1 prod.auth.nexo.local"

echo -e "${YELLOW}📋 Domínios que serão configurados:${NC}"
echo ""
echo -e "${BLUE}🛠️  Ferramentas:${NC}"
echo "  • http://argocd.nexo.local"
echo "  • http://grafana.nexo.local"
echo "  • http://prometheus.nexo.local"
echo "  • http://alertmanager.nexo.local"
echo "  • http://kibana.nexo.local"
echo "  • http://harbor.nexo.local"
echo "  • http://traefik.nexo.local"
echo ""
echo -e "${BLUE}🚀 Aplicações Develop:${NC}"
echo "  • http://develop.nexo.local"
echo "  • http://develop.api.nexo.local"
echo "  • http://develop.auth.nexo.local"
echo ""
echo -e "${BLUE}🧪 Aplicações QA:${NC}"
echo "  • http://qa.nexo.local"
echo "  • http://qa.api.nexo.local"
echo "  • http://qa.auth.nexo.local"
echo ""
echo -e "${BLUE}🎭 Aplicações Staging:${NC}"
echo "  • http://staging.nexo.local"
echo "  • http://staging.api.nexo.local"
echo "  • http://staging.auth.nexo.local"
echo ""
echo -e "${BLUE}🌐 Aplicações Prod (Local):${NC}"
echo "  • http://prod.nexo.local"
echo "  • http://prod.api.nexo.local"
echo "  • http://prod.auth.nexo.local"
echo ""

read -p "$(echo -e ${YELLOW}Continuar com a atualização do /etc/hosts? \(y/N\): ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Cancelado pelo usuário${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔐 Requer permissão sudo...${NC}"

# Fazer backup do hosts original
BACKUP_FILE="/etc/hosts.backup-$(date +%Y%m%d-%H%M%S)"
echo -e "${BLUE}📦 Criando backup em: $BACKUP_FILE${NC}"
sudo cp /etc/hosts "$BACKUP_FILE"

# Remover entradas antigas do Nexo CloudLab
echo -e "${YELLOW}🧹 Removendo entradas antigas...${NC}"
sudo sed -i '' '/# Nexo CloudLab/d' /etc/hosts 2>/dev/null || true
sudo sed -i '' '/nexo.local/d' /etc/hosts 2>/dev/null || true

# Adicionar novas entradas
echo -e "${YELLOW}✏️  Adicionando novas entradas...${NC}"
echo "$HOSTS_ENTRIES" | sudo tee -a /etc/hosts > /dev/null

# Verificar
echo ""
echo -e "${GREEN}✅ /etc/hosts atualizado com sucesso!${NC}"
echo -e "${BLUE}📦 Backup salvo em: $BACKUP_FILE${NC}"
echo ""

# Mostrar as entradas adicionadas
echo -e "${BLUE}📋 Entradas configuradas:${NC}"
grep "nexo.local" /etc/hosts | sed 's/^/  /'
echo ""

# Testar DNS
echo -e "${YELLOW}🧪 Testando resolução DNS...${NC}"
if ping -c 1 argocd.nexo.local &> /dev/null; then
    echo -e "${GREEN}✅ DNS funcionando corretamente!${NC}"
else
    echo -e "${YELLOW}⚠️  Aguarde alguns segundos para o DNS propagar${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuração concluída!${NC}"
echo ""
echo -e "${BLUE}📖 Próximos passos:${NC}"
echo "  1. Acessar http://argocd.nexo.local (após instalar ArgoCD)"
echo "  2. Acessar http://grafana.nexo.local (após instalar Prometheus Stack)"
echo "  3. Acessar http://develop.nexo.local (após deploy das apps)"
echo ""
echo -e "${BLUE}🔧 Para restaurar backup:${NC}"
echo "  sudo cp $BACKUP_FILE /etc/hosts"
