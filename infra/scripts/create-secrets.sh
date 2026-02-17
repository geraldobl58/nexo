#!/bin/bash
# ============================================================================
# Nexo Platform - Criar Secrets para DO Managed Database
# ============================================================================
# Uso:
#   export DB_HOST=your-db-host.db.ondigitalocean.com
#   export DB_PORT=25060
#   export DB_USERNAME=doadmin
#   export DB_PASSWORD=your-db-password
#   export GHCR_TOKEN=your-ghcr-token
#   ./create-secrets.sh
# ============================================================================
set -euo pipefail

# ============================================================================
# CONFIGURAÇÃO - Defina via variáveis de ambiente ou altere aqui
# ============================================================================
DB_HOST="${DB_HOST:-your-db-host.db.ondigitalocean.com}"
DB_PORT="${DB_PORT:-25060}"
DB_USERNAME="${DB_USERNAME:-doadmin}"
DB_PASSWORD="${DB_PASSWORD:-your-db-password}"
DB_SSLMODE="${DB_SSLMODE:-require}"

# Bancos de dados (criar manualmente no painel DO Database)
DB_NAME_APP="${DB_NAME_APP:-nexo_app}"
DB_NAME_KEYCLOAK="${DB_NAME_KEYCLOAK:-nexo_keycloak}"

# Keycloak admin
KC_ADMIN_USER="${KC_ADMIN_USER:-admin}"
KC_ADMIN_PASS="${KC_ADMIN_PASS:-CHANGE-ME-IN-PRODUCTION}"

# GHCR Token (Personal Access Token com packages:read)
GHCR_TOKEN="${GHCR_TOKEN:-your-ghcr-token}"
GHCR_USER="${GHCR_USER:-geraldobl58}"

echo "🔐 Criando secrets para todos os namespaces..."

# Namespaces onde criar secrets
NAMESPACES=("nexo-develop" "nexo-prod")

for NS in "${NAMESPACES[@]}"; do
  echo ""
  echo "📦 Namespace: $NS"

  # Garantir namespace existe
  kubectl create namespace "$NS" --dry-run=client -o yaml | kubectl apply -f -

  # --- nexo-db-secret (para nexo-be) ---
  DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME_APP}?sslmode=${DB_SSLMODE}"
  kubectl create secret generic nexo-db-secret \
    --namespace="$NS" \
    --from-literal=DATABASE_URL="$DATABASE_URL" \
    --dry-run=client -o yaml | kubectl apply -f -
  echo "  ✅ nexo-db-secret"

  # --- nexo-auth-db-secret (para nexo-auth / Keycloak) ---
  KC_DB_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME_KEYCLOAK}?sslmode=${DB_SSLMODE}"
  kubectl create secret generic nexo-auth-db-secret \
    --namespace="$NS" \
    --from-literal=KC_DB=postgres \
    --from-literal=KC_DB_URL="$KC_DB_URL" \
    --from-literal=KC_DB_USERNAME="$DB_USERNAME" \
    --from-literal=KC_DB_PASSWORD="$DB_PASSWORD" \
    --dry-run=client -o yaml | kubectl apply -f -
  echo "  ✅ nexo-auth-db-secret"

  # --- nexo-auth-admin-secret (Keycloak admin credentials) ---
  kubectl create secret generic nexo-auth-admin-secret \
    --namespace="$NS" \
    --from-literal=KEYCLOAK_ADMIN="$KC_ADMIN_USER" \
    --from-literal=KEYCLOAK_ADMIN_PASSWORD="$KC_ADMIN_PASS" \
    --dry-run=client -o yaml | kubectl apply -f -
  echo "  ✅ nexo-auth-admin-secret"

  # --- ghcr-secret (para pull de imagens do GHCR) ---
  kubectl create secret docker-registry ghcr-secret \
    --namespace="$NS" \
    --docker-server=ghcr.io \
    --docker-username="$GHCR_USER" \
    --docker-password="$GHCR_TOKEN" \
    --dry-run=client -o yaml | kubectl apply -f -
  echo "  ✅ ghcr-secret"
done

echo ""
echo "============================================"
echo "✅ Todos os secrets criados!"
echo "============================================"
echo ""
echo "Secrets criados em cada namespace:"
echo "  - nexo-db-secret          → DATABASE_URL para nexo-be"
echo "  - nexo-auth-db-secret     → KC_DB_* para Keycloak"
echo "  - nexo-auth-admin-secret  → KEYCLOAK_ADMIN credentials"
echo "  - ghcr-secret             → Docker registry auth para GHCR"
