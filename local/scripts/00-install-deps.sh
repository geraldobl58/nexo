#!/bin/bash
set -e

echo "🚀 Nexo CloudLab - Instalando Dependências"
echo "============================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Homebrew
if ! command_exists brew; then
    echo -e "${RED}❌ Homebrew não encontrado. Instalando...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo -e "${GREEN}✅ Homebrew já instalado${NC}"
fi

# Instalar k3d
if ! command_exists k3d; then
    echo -e "${YELLOW}📦 Instalando k3d...${NC}"
    brew install k3d
else
    echo -e "${GREEN}✅ k3d já instalado${NC}"
    k3d version
fi

# Instalar kubectl
if ! command_exists kubectl; then
    echo -e "${YELLOW}📦 Instalando kubectl...${NC}"
    brew install kubectl
else
    echo -e "${GREEN}✅ kubectl já instalado${NC}"
    kubectl version --client
fi

# Instalar helm
if ! command_exists helm; then
    echo -e "${YELLOW}📦 Instalando helm...${NC}"
    brew install helm
else
    echo -e "${GREEN}✅ helm já instalado${NC}"
    helm version
fi

# Instalar k9s (opcional mas muito útil)
if ! command_exists k9s; then
    echo -e "${YELLOW}📦 Instalando k9s...${NC}"
    brew install k9s
else
    echo -e "${GREEN}✅ k9s já instalado${NC}"
fi

# Instalar kubectx e kubens (útil para trocar contextos)
if ! command_exists kubectx; then
    echo -e "${YELLOW}📦 Instalando kubectx...${NC}"
    brew install kubectx
else
    echo -e "${GREEN}✅ kubectx já instalado${NC}"
fi

# Instalar jq (para processar JSON)
if ! command_exists jq; then
    echo -e "${YELLOW}📦 Instalando jq...${NC}"
    brew install jq
else
    echo -e "${GREEN}✅ jq já instalado${NC}"
fi

# Instalar yq (para processar YAML)
if ! command_exists yq; then
    echo -e "${YELLOW}📦 Instalando yq...${NC}"
    brew install yq
else
    echo -e "${GREEN}✅ yq já instalado${NC}"
fi

# Verificar Docker
if ! command_exists docker; then
    echo -e "${RED}❌ Docker não encontrado!${NC}"
    echo "Instale Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
else
    echo -e "${GREEN}✅ Docker já instalado${NC}"
    docker --version
fi

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando!${NC}"
    echo "Inicie o Docker Desktop e tente novamente."
    exit 1
else
    echo -e "${GREEN}✅ Docker está rodando${NC}"
fi

# Verificar SSD externo
if [ ! -d "/Volumes/Backup" ]; then
    echo -e "${YELLOW}⚠️  SSD externo não encontrado em /Volumes/Backup${NC}"
    echo "Montando ou criando diretório..."
    echo "Se o SSD estiver com outro nome, ajuste o path em k3d-config.yaml"
fi

# Criar diretórios no SSD
echo -e "${YELLOW}📁 Criando diretórios no SSD...${NC}"
mkdir -p /Volumes/Backup/nexo-cloudlab/{data,postgres,prometheus,grafana,elasticsearch,backups}
echo -e "${GREEN}✅ Diretórios criados${NC}"

# Adicionar repositórios Helm
echo -e "${YELLOW}📦 Adicionando repositórios Helm...${NC}"
helm repo add argo https://argoproj.github.io/argo-helm 2>/dev/null || true
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
helm repo add grafana https://grafana.github.io/helm-charts 2>/dev/null || true
helm repo add elastic https://helm.elastic.co 2>/dev/null || true
helm repo add bitnami https://charts.bitnami.com/bitnami 2>/dev/null || true
helm repo update

echo ""
echo -e "${GREEN}✅ Todas as dependências foram instaladas!${NC}"
echo ""
echo "Próximo passo: ./scripts/01-create-cluster.sh"
