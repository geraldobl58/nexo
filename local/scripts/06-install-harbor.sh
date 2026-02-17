#!/bin/bash
set -e

echo "🚀 Nexo CloudLab - Instalando Harbor Registry"
echo "=============================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

NAMESPACE="harbor"

echo -e "${YELLOW}📦 Instalando Harbor (Container Registry com UI)...${NC}"

# Adicionar repo
helm repo add harbor https://helm.goharbor.io
helm repo update

# Criar namespace
kubectl create namespace $NAMESPACE 2>/dev/null || true

# Instalar Harbor
cat <<EOF > /tmp/harbor-values.yaml
# Harbor configuration for local development
expose:
  type: ingress
  tls:
    enabled: false
  ingress:
    hosts:
      core: harbor.nexo.local
    className: nginx

externalURL: http://harbor.nexo.local

# Persistence
persistence:
  enabled: true
  persistentVolumeClaim:
    registry:
      storageClass: local-path-ssd
      size: 10Gi
    chartmuseum:
      storageClass: local-path-ssd
      size: 5Gi
    jobservice:
      storageClass: local-path-ssd
      size: 1Gi
    database:
      storageClass: local-path-ssd
      size: 1Gi
    redis:
      storageClass: local-path-ssd
      size: 1Gi
    trivy:
      storageClass: local-path-ssd
      size: 5Gi

# Credentials
harborAdminPassword: "Harbor12345"

# Disable unnecessary components for local
notary:
  enabled: false

trivy:
  enabled: true

# Resources (optimized for local)
portal:
  resources:
    requests:
      memory: 128Mi
      cpu: 100m
    limits:
      memory: 256Mi
      cpu: 500m

core:
  resources:
    requests:
      memory: 256Mi
      cpu: 100m
    limits:
      memory: 512Mi
      cpu: 1000m

registry:
  resources:
    requests:
      memory: 256Mi
      cpu: 100m
    limits:
      memory: 512Mi
      cpu: 1000m

database:
  internal:
    resources:
      requests:
        memory: 256Mi
        cpu: 100m
      limits:
        memory: 512Mi
        cpu: 500m

redis:
  internal:
    resources:
      requests:
        memory: 128Mi
        cpu: 100m
      limits:
        memory: 256Mi
        cpu: 500m
EOF

helm upgrade --install harbor harbor/harbor \
  --namespace $NAMESPACE \
  --values /tmp/harbor-values.yaml \
  --timeout 15m

# Aguardar pods ficarem prontos
echo -e "${YELLOW}⏳ Aguardando Harbor ficar pronto (pode levar vários minutos)...${NC}"
kubectl wait --for=condition=ready pod \
  --selector=app=harbor \
  --namespace=$NAMESPACE \
  --timeout=900s 2>/dev/null || echo "⚠️  Alguns pods do Harbor ainda estão inicializando..."

# Configurar Harbor como registry adicional do k3d
echo -e "${YELLOW}🔧 Configurando Harbor no cluster...${NC}"

# Criar secret para pull/push
kubectl create secret docker-registry harbor-registry \
  --docker-server=harbor.nexo.local \
  --docker-username=admin \
  --docker-password=Harbor12345 \
  --namespace=default \
  --dry-run=client -o yaml | kubectl apply -f -

# Criar em outros namespaces também
for ns in nexo-local argocd monitoring logging; do
  kubectl create secret docker-registry harbor-registry \
    --docker-server=harbor.nexo.local \
    --docker-username=admin \
    --docker-password=Harbor12345 \
    --namespace=$ns \
    --dry-run=client -o yaml | kubectl apply -f - 2>/dev/null || true
done

echo ""
echo -e "${GREEN}✅ Harbor Registry instalado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📊 Informações de Acesso:${NC}"
echo ""
echo "  Harbor Registry:"
echo "    URL: http://harbor.nexo.local"
echo "    Usuário: admin"
echo "    Senha: Harbor12345"
echo ""
echo -e "${BLUE}📦 Como usar o Harbor:${NC}"
echo ""
echo "  1. Login no Harbor:"
echo "     docker login harbor.nexo.local"
echo "     Username: admin"
echo "     Password: Harbor12345"
echo ""
echo "  2. Tag e push de imagem:"
echo "     docker tag myimage:latest harbor.nexo.local/library/myimage:latest"
echo "     docker push harbor.nexo.local/library/myimage:latest"
echo ""
echo "  3. Pull de imagem:"
echo "     docker pull harbor.nexo.local/library/myimage:latest"
echo ""
echo -e "${BLUE}🔐 Configurar Docker para Harbor insecure (requer reiniciar Docker):${NC}"
echo ""
echo "  Docker Desktop → Settings → Docker Engine → Adicionar:"
echo '  {'
echo '    "insecure-registries": ["harbor.nexo.local"]'
echo '  }'
echo ""
echo -e "${BLUE}📦 Comandos úteis:${NC}"
echo "  kubectl get pods -n harbor"
echo "  kubectl logs -n harbor -l app=harbor"
echo ""
echo "Acesse: http://harbor.nexo.local"
