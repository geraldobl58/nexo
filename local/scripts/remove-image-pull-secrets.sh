#!/bin/bash
# ============================================================================
# Script: Remover imagePullSecrets (para imagens públicas)
# Uso: ./remove-image-pull-secrets.sh
# ============================================================================

set -e

echo "🔓 Removendo imagePullSecrets dos values files..."
echo ""
echo "⚠️  Use este script se:"
echo "  - Suas imagens no ghcr.io são PÚBLICAS"
echo "  - Você ainda não configurou o GITHUB_TOKEN"
echo ""
echo "📝 Caso contrário, use: ./create-ghcr-secrets.sh YOUR_TOKEN"
echo ""

read -p "Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelado"
    exit 1
fi

# Lista de arquivos
VALUES_FILES=(
  "infra/helm/nexo-be/values-develop.yaml"
  "infra/helm/nexo-be/values-qa.yaml"
  "infra/helm/nexo-be/values-staging.yaml"
  "infra/helm/nexo-be/values-prod.yaml"
  "infra/helm/nexo-fe/values-develop.yaml"
  "infra/helm/nexo-fe/values-qa.yaml"
  "infra/helm/nexo-fe/values-staging.yaml"
  "infra/helm/nexo-fe/values-prod.yaml"
  "infra/helm/nexo-auth/values-develop.yaml"
  "infra/helm/nexo-auth/values-qa.yaml"
  "infra/helm/nexo-auth/values-staging.yaml"
  "infra/helm/nexo-auth/values-prod.yaml"
)

# Backup
BACKUP_DIR="infra/helm/.backup-no-secrets-$(date +%Y%m%d-%H%M%S)"
echo "📦 Criando backup em: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

for FILE in "${VALUES_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    cp "$FILE" "$BACKUP_DIR/"
  fi
done

echo "✅ Backup criado"
echo ""

# Remover imagePullSecrets
echo "🔄 Removendo imagePullSecrets..."

for FILE in "${VALUES_FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    continue
  fi
  
  echo "  📝 $FILE"
  
  # macOS usa sed -i '' / Linux usa sed -i
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' '/^imagePullSecrets:$/,/^  - name: ghcr-secret$/d' "$FILE"
  else
    sed -i '/^imagePullSecrets:$/,/^  - name: ghcr-secret$/d' "$FILE"
  fi
done

echo ""
echo "✅ imagePullSecrets removidos!"
echo ""
echo "🔄 Próximos passos:"
echo "  1. Aplicar mudanças: kubectl apply -f infra/argocd/applicationsets/nexo-apps.yaml"
echo "  2. Forçar sync: argocd app sync nexo-be-develop --force"
echo ""
echo "📦 Backup disponível em: $BACKUP_DIR"
