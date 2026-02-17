#!/bin/bash
# ============================================================================
# Script: Criar secrets ghcr-secret nos namespaces
# Uso: ./create-ghcr-secrets.sh [GITHUB_TOKEN]
# ============================================================================

set -e

NAMESPACES=("nexo-develop" "nexo-qa" "nexo-staging" "nexo-prod")
REGISTRY="ghcr.io"
USERNAME="geraldobl58"

# Token pode ser passado como argumento ou lido de variável de ambiente
TOKEN="${1:-$GITHUB_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "❌ Erro: GitHub Token não fornecido"
  echo ""
  echo "Uso:"
  echo "  ./create-ghcr-secrets.sh YOUR_GITHUB_TOKEN"
  echo "  ou"
  echo "  export GITHUB_TOKEN=your_token"
  echo "  ./create-ghcr-secrets.sh"
  echo ""
  echo "📝 Para criar um token:"
  echo "  1. Acesse https://github.com/settings/tokens"
  echo "  2. Generate new token (classic)"
  echo "  3. Selecione scopes: read:packages"
  echo ""
  exit 1
fi

echo "🔐 Criando secrets ghcr-secret nos namespaces..."
echo ""

for NS in "${NAMESPACES[@]}"; do
  echo "📦 Namespace: $NS"
  
  # Verificar se namespace existe
  if ! kubectl get namespace "$NS" &> /dev/null; then
    echo "  ⚠️  Namespace não existe, criando..."
    kubectl create namespace "$NS"
  fi
  
  # Deletar secret se já existe
  if kubectl get secret ghcr-secret -n "$NS" &> /dev/null; then
    echo "  🗑️  Secret já existe, deletando..."
    kubectl delete secret ghcr-secret -n "$NS"
  fi
  
  # Criar secret
  kubectl create secret docker-registry ghcr-secret \
    --docker-server="$REGISTRY" \
    --docker-username="$USERNAME" \
    --docker-password="$TOKEN" \
    --namespace="$NS"
  
  echo "  ✅ Secret criado com sucesso"
  echo ""
done

echo "🎉 Todos os secrets criados!"
echo ""
echo "Verificar secrets:"
for NS in "${NAMESPACES[@]}"; do
  echo "  kubectl get secret ghcr-secret -n $NS"
done
