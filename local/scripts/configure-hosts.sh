#!/bin/bash
set -e

# Script para configurar /etc/hosts com os domínios do Nexo CloudLab
# Pode ser executado independentemente ou chamado por outros scripts
# Verifica se os hosts já existem antes de adicionar

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Modo silencioso (para chamadas de outros scripts)
SILENT_MODE=${1:-false}

if [ "$SILENT_MODE" != "true" ]; then
    echo "🔧 Nexo CloudLab - Configurar /etc/hosts"
    echo "========================================"
    echo ""
fi

# Lista de hosts necessários
declare -a REQUIRED_HOSTS=(
    "argocd.nexo.local"
    "grafana.nexo.local"
    "prometheus.nexo.local"
    "alertmanager.nexo.local"
    "develop.nexo.local"
    "develop.api.nexo.local"
    "develop.auth.nexo.local"
    "qa.nexo.local"
    "qa.api.nexo.local"
    "qa.auth.nexo.local"
    "staging.nexo.local"
    "staging.api.nexo.local"
    "staging.auth.nexo.local"
    "prod.nexo.local"
    "prod.api.nexo.local"
    "prod.auth.nexo.local"
)

# Verificar quais hosts já existem
MISSING_HOSTS=()
EXISTING_HOSTS=()

for host in "${REQUIRED_HOSTS[@]}"; do
    if grep -q "$host" /etc/hosts 2>/dev/null; then
        EXISTING_HOSTS+=("$host")
    else
        MISSING_HOSTS+=("$host")
    fi
done

# Se todos os hosts já existem, não fazer nada
if [ ${#MISSING_HOSTS[@]} -eq 0 ]; then
    if [ "$SILENT_MODE" != "true" ]; then
        echo -e "${GREEN}✅ Todos os hosts já estão configurados no /etc/hosts${NC}"
        echo ""
        echo -e "${BLUE}Hosts existentes:${NC}"
        printf '  • %s\n' "${EXISTING_HOSTS[@]}"
        echo ""
        echo -e "${BLUE}💡 Para reconfigurar os hosts, use:${NC}"
        echo "  make update-hosts"
        echo ""
    fi
    exit 0
fi

# Mostrar status
if [ "$SILENT_MODE" != "true" ]; then
    if [ ${#EXISTING_HOSTS[@]} -gt 0 ]; then
        echo -e "${GREEN}✅ Hosts já configurados: ${#EXISTING_HOSTS[@]}${NC}"
    fi
    
    if [ ${#MISSING_HOSTS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Hosts faltando: ${#MISSING_HOSTS[@]}${NC}"
        echo ""
        echo -e "${BLUE}📋 Os seguintes hosts serão adicionados:${NC}"
        printf '  • %s\n' "${MISSING_HOSTS[@]}"
        echo ""
        
        read -p "$(echo -e ${YELLOW}Deseja adicionar os hosts faltando? \(y/N\): ${NC})" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Cancelado pelo usuário${NC}"
            exit 1
        fi
    fi
fi

# Configurar hosts
echo ""
if [ "$SILENT_MODE" != "true" ]; then
    echo -e "${YELLOW}🔐 Requer permissão sudo...${NC}"
fi

# Criar backup
BACKUP_FILE="/etc/hosts.backup-$(date +%Y%m%d-%H%M%S)"
if [ "$SILENT_MODE" != "true" ]; then
    echo -e "${BLUE}📦 Criando backup em: $BACKUP_FILE${NC}"
fi
sudo cp /etc/hosts "$BACKUP_FILE"

# Verificar se já existe o marcador de início
if ! grep -q "# Nexo CloudLab - START" /etc/hosts 2>/dev/null; then
    # Adicionar todas as entradas
    if [ "$SILENT_MODE" != "true" ]; then
        echo -e "${YELLOW}✏️  Adicionando entradas ao /etc/hosts...${NC}"
    fi
    
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
else
    # Adicionar apenas hosts individuais faltando
    if [ "$SILENT_MODE" != "true" ]; then
        echo -e "${YELLOW}✏️  Adicionando hosts faltando...${NC}"
    fi
    
    for host in "${MISSING_HOSTS[@]}"; do
        # Adicionar antes da linha "# Nexo CloudLab - END"
        sudo sed -i '' "/# Nexo CloudLab - END/i\\
127.0.0.1 $host
" /etc/hosts
    done
fi

# Verificação final
echo ""
if [ "$SILENT_MODE" != "true" ]; then
    echo -e "${GREEN}✅ /etc/hosts configurado com sucesso!${NC}"
    echo -e "${BLUE}📦 Backup salvo em: $BACKUP_FILE${NC}"
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
    echo -e "${BLUE}📋 Total de hosts configurados: ${#REQUIRED_HOSTS[@]}${NC}"
    echo ""
    echo -e "${BLUE}🔧 Para restaurar backup:${NC}"
    echo "  sudo cp $BACKUP_FILE /etc/hosts"
    echo ""
fi

exit 0
