# ============================================================================
# Nexo Platform - Makefile Local
# ============================================================================
# Comandos para gerenciar ambiente K3D local
# ============================================================================

.PHONY: help setup destroy status logs shell

# Cores
C := \033[36m
G := \033[32m
Y := \033[33m
R := \033[31m
N := \033[0m

# Diretórios
LOCAL_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
SCRIPTS_DIR := $(LOCAL_DIR)/scripts

help: ## Mostra esta ajuda
	@echo ""
	@echo "$(C)╔════════════════════════════════════════════════════════════════╗$(N)"
	@echo "$(C)║     🏠 Nexo Platform - Ambiente Local K3D                       ║$(N)"
	@echo "$(C)╚════════════════════════════════════════════════════════════════╝$(N)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(C)%-20s$(N) %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
# Setup e Destroy
# ============================================================================

doctor: ## Verifica dependências do K3D
	@echo "$(C)🩺 Verificando dependências K3D...$(N)"
	@printf "Docker:   "; docker --version 2>/dev/null | cut -d' ' -f3 | tr -d ',' || echo "❌ Não instalado"
	@printf "K3D:      "; if command -v k3d >/dev/null 2>&1; then k3d version 2>/dev/null | grep k3d | awk '{print $$3}'; else echo "❌ Não instalado (brew install k3d)"; fi
	@printf "kubectl:  "; kubectl version --client -o yaml 2>/dev/null | grep gitVersion | head -1 | awk '{print $$2}' || echo "❌ Não instalado"
	@printf "Helm:     "; helm version --short 2>/dev/null || echo "❌ Não instalado"
	@echo "$(G)✅ Verificação concluída$(N)"

setup: doctor ## Setup completo do ambiente local (K3D + ArgoCD + Observabilidade)
	@chmod +x $(SCRIPTS_DIR)/*.sh
	@$(SCRIPTS_DIR)/setup.sh

destroy: ## Destroi o ambiente local completamente
	@chmod +x $(SCRIPTS_DIR)/*.sh
	@$(SCRIPTS_DIR)/destroy.sh

# ============================================================================
# Status e Monitoramento
# ============================================================================

status: ## Mostra status do ambiente local
	@chmod +x $(SCRIPTS_DIR)/*.sh
	@$(SCRIPTS_DIR)/status.sh

pods: ## Lista todos os pods
	@kubectl get pods -A

services: ## Lista todos os serviços
	@kubectl get svc -A

nodes: ## Lista nodes do cluster
	@kubectl get nodes -o wide

# ============================================================================
# Logs
# ============================================================================

logs-be: ## Ver logs do backend
	@kubectl logs -n nexo-local -l app.kubernetes.io/name=nexo-be -f --tail=100

logs-fe: ## Ver logs do frontend
	@kubectl logs -n nexo-local -l app.kubernetes.io/name=nexo-fe -f --tail=100

logs-auth: ## Ver logs do Keycloak
	@kubectl logs -n nexo-local -l app.kubernetes.io/name=nexo-auth -f --tail=100

logs-argocd: ## Ver logs do ArgoCD
	@kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server -f --tail=100

# ============================================================================
# Port Forward (alternativa ao NodePort)
# ============================================================================

pf-argocd: ## Port-forward ArgoCD (localhost:8080)
	@echo "$(G)ArgoCD disponível em: http://localhost:8080$(N)"
	@kubectl port-forward svc/argocd-server -n argocd 8080:443

pf-grafana: ## Port-forward Grafana (localhost:3000)
	@echo "$(G)Grafana disponível em: http://localhost:3000$(N)"
	@kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80

pf-prometheus: ## Port-forward Prometheus (localhost:9090)
	@echo "$(G)Prometheus disponível em: http://localhost:9090$(N)"
	@kubectl port-forward svc/monitoring-kube-prometheus-prometheus -n monitoring 9090:9090

# ============================================================================
# Build e Deploy Local
# ============================================================================

# Diretório raiz do projeto
ROOT_DIR := $(shell dirname $(LOCAL_DIR))

# DockerHub username
DOCKER_USER := geraldobl58

# Build flags para compatibilidade com K3D (linux/amd64)
DOCKER_BUILD_FLAGS := --platform linux/amd64 --provenance=false --sbom=false

# ============================================================================
# Build e Push para DockerHub
# ============================================================================

docker-login: ## Login no DockerHub
	@echo "$(C)🔐 Login no DockerHub...$(N)"
	@docker login
	@echo "$(G)✓ Login realizado$(N)"

build-be: ## Build imagem do backend e push para DockerHub
	@echo "$(Y)🔨 Building nexo-be...$(N)"
	@docker build $(DOCKER_BUILD_FLAGS) -t $(DOCKER_USER)/nexo-be:latest -f $(ROOT_DIR)/apps/nexo-be/Dockerfile $(ROOT_DIR)
	@docker push $(DOCKER_USER)/nexo-be:latest
	@echo "$(G)✓ nexo-be built and pushed to DockerHub$(N)"

build-fe: ## Build imagem do frontend e push para DockerHub
	@echo "$(Y)🔨 Building nexo-fe...$(N)"
	@docker build $(DOCKER_BUILD_FLAGS) -t $(DOCKER_USER)/nexo-fe:latest -f $(ROOT_DIR)/apps/nexo-fe/Dockerfile $(ROOT_DIR)
	@docker push $(DOCKER_USER)/nexo-fe:latest
	@echo "$(G)✓ nexo-fe built and pushed to DockerHub$(N)"

build-auth: ## Build imagem do auth e push para DockerHub (se customizado)
	@echo "$(Y)🔨 Building nexo-auth...$(N)"
	@docker build $(DOCKER_BUILD_FLAGS) -t $(DOCKER_USER)/nexo-auth:latest -f $(ROOT_DIR)/apps/nexo-auth/Dockerfile $(ROOT_DIR)
	@docker push $(DOCKER_USER)/nexo-auth:latest
	@echo "$(G)✓ nexo-auth built and pushed to DockerHub$(N)"

build-all: build-be build-fe ## Build e push de todas as imagens (exceto auth que usa Keycloak oficial)

deploy-be: ## Deploy do backend (puxa imagem do DockerHub)
	@echo "$(Y)🚀 Deploying nexo-be...$(N)"
	@kubectl rollout restart deployment/nexo-be-local -n nexo-local 2>/dev/null || \
		helm upgrade --install nexo-be-local $(LOCAL_DIR)/helm/nexo-be -n nexo-local --create-namespace
	@echo "$(G)✓ nexo-be deployed$(N)"

deploy-fe: ## Deploy do frontend (puxa imagem do DockerHub)
	@echo "$(Y)🚀 Deploying nexo-fe...$(N)"
	@kubectl rollout restart deployment/nexo-fe-local -n nexo-local 2>/dev/null || \
		helm upgrade --install nexo-fe-local $(LOCAL_DIR)/helm/nexo-fe -n nexo-local --create-namespace
	@echo "$(G)✓ nexo-fe deployed$(N)"

deploy-auth: ## Deploy do Keycloak
	@echo "$(Y)🚀 Deploying nexo-auth...$(N)"
	@kubectl rollout restart deployment/nexo-auth-local -n nexo-local 2>/dev/null || \
		helm upgrade --install nexo-auth-local $(LOCAL_DIR)/helm/nexo-auth -n nexo-local --create-namespace
	@echo "$(G)✓ nexo-auth deployed$(N)"

deploy-all: deploy-be deploy-fe deploy-auth ## Deploy de todos os serviços
	@echo "$(G)✓ All services deployed$(N)"

pull-latest: ## Força K3D a puxar as últimas imagens do DockerHub
	@echo "$(Y)🔄 Forcing image pull from DockerHub...$(N)"
	@kubectl rollout restart deployment -n nexo-local
	@echo "$(G)✓ Deployments restarted - pulling latest images$(N)"

# ============================================================================
# ArgoCD
# ============================================================================

argocd-password: ## Mostra senha do ArgoCD
	@echo "$(C)ArgoCD Admin Password:$(N)"
	@kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
	@echo ""

argocd-sync: ## Sincroniza todas as applications
	@kubectl -n argocd get applications -o name | xargs -I {} kubectl -n argocd patch {} --type merge -p '{"operation":{"sync":{}}}'
	@echo "$(G)✓ Sync iniciado para todas as applications$(N)"

sync-all: argocd-sync ## Alias para argocd-sync

# ============================================================================
# ArgoCD Image Updater
# ============================================================================

image-updater: ## Ver logs do ArgoCD Image Updater
	@kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater -f --tail=50

image-updater-restart: ## Reiniciar ArgoCD Image Updater
	@echo "$(Y)🔄 Reiniciando Image Updater...$(N)"
	@kubectl rollout restart deployment argocd-image-updater -n argocd
	@kubectl rollout status deployment argocd-image-updater -n argocd
	@echo "$(G)✓ Image Updater reiniciado$(N)"

image-updater-status: ## Status do ArgoCD Image Updater
	@echo "$(C)📊 ArgoCD Image Updater Status:$(N)"
	@kubectl get pod -n argocd -l app.kubernetes.io/name=argocd-image-updater
	@echo ""
	@echo "$(C)🔍 Últimas atualizações:$(N)"
	@kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater --tail=20

# ============================================================================
# Observabilidade
# ============================================================================

grafana-password: ## Mostra senha do Grafana
	@echo "$(C)Grafana Admin Password:$(N)"
	@kubectl get secret --namespace monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
	@echo ""

# ============================================================================
# Utilitários
# ============================================================================

shell-be: ## Abre shell no pod do backend
	@kubectl exec -it -n nexo-local $$(kubectl get pod -n nexo-local -l app.kubernetes.io/name=nexo-be -o jsonpath='{.items[0].metadata.name}') -- /bin/sh

shell-fe: ## Abre shell no pod do frontend
	@kubectl exec -it -n nexo-local $$(kubectl get pod -n nexo-local -l app.kubernetes.io/name=nexo-fe -o jsonpath='{.items[0].metadata.name}') -- /bin/sh

restart-be: ## Restart pods do backend
	@kubectl rollout restart deployment -n nexo-local -l app.kubernetes.io/name=nexo-be

restart-fe: ## Restart pods do frontend
	@kubectl rollout restart deployment -n nexo-local -l app.kubernetes.io/name=nexo-fe

restart-all: ## Restart todos os pods da aplicação
	@kubectl rollout restart deployment -n nexo-local
