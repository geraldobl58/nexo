#!/bin/bash
# ============================================================================
# Script: Atualizar URLs dos values files para ambiente LOCAL
# De: *.g3developer.online → *.nexo.local
# De: https:// → http:// (sem TLS no local)
# ============================================================================

set -e

echo "🔧 Atualizando URLs dos values files para ambiente LOCAL..."
echo ""

# Lista de arquivos para atualizar
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
BACKUP_DIR="infra/helm/.backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Criando backup em: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

for FILE in "${VALUES_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    cp "$FILE" "$BACKUP_DIR/"
  fi
done

echo "✅ Backup criado"
echo ""

# Atualizar URLs
echo "🔄 Atualizando URLs..."

for FILE in "${VALUES_FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "  ⚠️  Arquivo não encontrado: $FILE"
    continue
  fi
  
  echo "  📝 $FILE"
  
  # macOS usa sed -i '' / Linux usa sed -i
  if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_CMD="sed -i ''"
  else
    SED_CMD="sed -i"
  fi
  
  # Substituições de URLs
  $SED_CMD 's|develop\.api\.g3developer\.online|develop.api.nexo.local|g' "$FILE"
  $SED_CMD 's|develop\.g3developer\.online|develop.nexo.local|g' "$FILE"
  $SED_CMD 's|develop\.auth\.g3developer\.online|develop.auth.nexo.local|g' "$FILE"
  
  $SED_CMD 's|qa\.api\.g3developer\.online|qa.api.nexo.local|g' "$FILE"
  $SED_CMD 's|qa\.g3developer\.online|qa.nexo.local|g' "$FILE"
  $SED_CMD 's|qa\.auth\.g3developer\.online|qa.auth.nexo.local|g' "$FILE"
  
  $SED_CMD 's|staging\.api\.g3developer\.online|staging.api.nexo.local|g' "$FILE"
  $SED_CMD 's|staging\.g3developer\.online|staging.nexo.local|g' "$FILE"
  $SED_CMD 's|staging\.auth\.g3developer\.online|staging.auth.nexo.local|g' "$FILE"
  
  $SED_CMD 's|app\.g3developer\.online|nexo.local|g' "$FILE"
  $SED_CMD 's|api\.g3developer\.online|api.nexo.local|g' "$FILE"
  $SED_CMD 's|auth\.g3developer\.online|auth.nexo.local|g' "$FILE"
  
  # Trocar https:// por http:// (exceto em URLs internas do cluster)
  $SED_CMD 's|https://develop\.api\.nexo\.local|http://develop.api.nexo.local|g' "$FILE"
  $SED_CMD 's|https://develop\.auth\.nexo\.local|http://develop.auth.nexo.local|g' "$FILE"
  $SED_CMD 's|https://qa\.api\.nexo\.local|http://qa.api.nexo.local|g' "$FILE"
  $SED_CMD 's|https://qa\.auth\.nexo\.local|http://qa.auth.nexo.local|g' "$FILE"
  $SED_CMD 's|https://staging\.api\.nexo\.local|http://staging.api.nexo.local|g' "$FILE"
  $SED_CMD 's|https://staging\.auth\.nexo\.local|http://staging.auth.nexo.local|g' "$FILE"
  $SED_CMD 's|https://api\.nexo\.local|http://api.nexo.local|g' "$FILE"
  $SED_CMD 's|https://auth\.nexo\.local|http://auth.nexo.local|g' "$FILE"
  
  # Remover annotations de cert-manager e ssl-redirect (não precisa no local)
  $SED_CMD '/cert-manager\.io\/cluster-issuer/d' "$FILE"
  $SED_CMD '/nginx\.ingress\.kubernetes\.io\/ssl-redirect/d' "$FILE"
  
  # Remover seção TLS do ingress
  $SED_CMD '/^  tls:$/,/^        -.*\.nexo\.local$/d' "$FILE"
  
done

echo ""
echo "✅ URLs atualizadas!"
echo ""
echo "🔍 Verificar mudanças:"
echo "  git diff infra/helm/*/values-*.yaml"
echo ""
echo "📦 Backup disponível em: $BACKUP_DIR"
echo "  Para restaurar: cp $BACKUP_DIR/* infra/helm/*/"
