#!/bin/bash
set -e

echo "🔧 Nexo CloudLab - Atualizar /etc/hosts"
echo "========================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}ℹ️  Este comando irá RECONFIGURAR todos os hosts do CloudLab.${NC}"
echo -e "${YELLOW}   Para adicionar apenas hosts faltando, use: make configure-hosts${NC}"
echo ""

read -p "$(echo -e ${YELLOW}Deseja continuar? \(y/N\): ${NC})" -n 1 -r
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

# Remover TODAS as entradas antigas do Nexo CloudLab
echo -e "${YELLOW}🧹 Removendo TODAS as entradas antigas...${NC}"
sudo sed -i '' '/# Nexo CloudLab - START/,/# Nexo CloudLab - END/d' /etc/hosts 2>/dev/null || true
sudo sed -i '' '/# Nexo CloudLab/d' /etc/hosts 2>/dev/null || true
sudo sed -i '' '/nexo.local/d' /etc/hosts 2>/dev/null || true

# Adicionar todas as entradas novamente
echo -e "${YELLOW}✏️  Adicionando novas entradas...${NC}"

sudo tee -a /etc/hosts > /dev/null << 'EOF'

# Nexo CloudLab - START (não remova esta linha)

# Nexo CloudLab - Ferramentas
127.0.0.1 argocd.nexo.local
127.0.0.1 grafana.nexo.local
127.0.0.1 prometheus.nexo.local
127.0.0.1 alertmanager.nexo.local

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
127.0.0.1 prod.auth.nexo.local

# Nexo CloudLab - END (não remova esta linha)
EOF

# Verificar
echo ""
echo -e "${GREEN}✅ /etc/hosts RECONFIGURADO com sucesso!${NC}"
echo -e "${BLUE}📦 Backup salvo em: $BACKUP_FILE${NC}"
echo ""

# Mostrar as entradas adicionadas
echo -e "${BLUE}📋 Entradas configuradas (19 hosts):${NC}"
grep -A 50 "# Nexo CloudLab - START" /etc/hosts | grep -B 50 "# Nexo CloudLab - END" | grep "127.0.0.1" | sed 's/^/  /'
echo ""

# Testar DNS
echo -e "${YELLOW}🧪 Testando resolução DNS...${NC}"
if ping -c 1 argocd.nexo.local &> /dev/null; then
    echo -e "${GREEN}✅ DNS funcionando corretamente!${NC}"
else
    echo -e "${YELLOW}⚠️  Aguarde alguns segundos para o DNS propagar${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Reconfiguração concluída!${NC}"
echo ""
echo -e "${BLUE}🔧 Para restaurar backup:${NC}"
echo "  sudo cp $BACKUP_FILE /etc/hosts"
echo ""
