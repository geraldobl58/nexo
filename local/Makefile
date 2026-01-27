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

build-be: ## Build imagem do backend para registry local
	@echo "$(Y)Building nexo-be...$(N)"
	@docker build -t nexo-registry.localhost:5111/nexo-be:local ../apps/nexo-be
	@docker push nexo-registry.localhost:5111/nexo-be:local
	@k3d image import nexo-registry.localhost:5111/nexo-be:local -c nexo-local
	@echo "$(G)✓ nexo-be built, pushed and imported$(N)"

build-fe: ## Build imagem do frontend para registry local
	@echo "$(Y)Building nexo-fe...$(N)"
	@docker build -t nexo-registry.localhost:5111/nexo-fe:local ../apps/nexo-fe
	@docker push nexo-registry.localhost:5111/nexo-fe:local
	@k3d image import nexo-registry.localhost:5111/nexo-fe:local -c nexo-local
	@echo "$(G)✓ nexo-fe built, pushed and imported$(N)"

build-auth: ## Build imagem do auth para registry local
	@echo "$(Y)Building nexo-auth...$(N)"
	@docker build -t nexo-registry.localhost:5111/nexo-auth:local ../apps/nexo-auth
	@docker push nexo-registry.localhost:5111/nexo-auth:local
	@k3d image import nexo-registry.localhost:5111/nexo-auth:local -c nexo-local
	@echo "$(G)✓ nexo-auth built, pushed and imported$(N)"

build-all: build-be build-fe build-auth ## Build todas as imagens

deploy-be: build-be ## Build e deploy do backend
	@kubectl rollout restart deployment/nexo-be-local -n nexo-local
	@echo "$(G)✓ nexo-be deployed$(N)"

deploy-fe: build-fe ## Build e deploy do frontend
	@kubectl rollout restart deployment/nexo-fe-local -n nexo-local
	@echo "$(G)✓ nexo-fe deployed$(N)"

deploy-auth: build-auth ## Build e deploy do auth
	@kubectl rollout restart deployment/nexo-auth-local -n nexo-local
	@echo "$(G)✓ nexo-auth deployed$(N)"

deploy-all: build-all ## Build e deploy de todos
	@kubectl rollout restart deployment -n nexo-local
	@echo "$(G)✓ All services deployed$(N)"

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
