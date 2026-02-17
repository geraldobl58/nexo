.PHONY: help setup install start stop restart destroy delete clean status urls logs port-forward backup k9s shell top troubleshoot grafana prometheus

# Cores
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
BLUE   := $(shell tput -Txterm setaf 4)
RED    := $(shell tput -Txterm setaf 1)
RESET  := $(shell tput -Txterm sgr0)

help: ## Mostra este menu de ajuda
	@echo "$(BLUE)Nexo CloudLab - Comandos Disponíveis$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

setup: ## Setup completo automatizado (recomendado para primeira instalação)
	@echo "$(GREEN)🚀 Iniciando setup completo do CloudLab...$(RESET)"
	@chmod +x setup.sh
	@./setup.sh

start: ## Inicia o cluster (se estiver parado)
	@echo "$(GREEN)▶️  Iniciando cluster...$(RESET)"
	@k3d cluster start nexo-local
	@echo "$(GREEN)✅ Cluster iniciado$(RESET)"

stop: ## Para o cluster (mantém dados)
	@echo "$(YELLOW)⏸️  Parando cluster...$(RESET)"
	@k3d cluster stop nexo-local
	@echo "$(YELLOW)✅ Cluster parado$(RESET)"

restart: stop start ## Reinicia o cluster

destroy: ## Destroi TUDO (interativo): cluster, volumes, hosts
	@echo "$(RED)🗑️  Destroy completo do CloudLab...$(RESET)"
	@chmod +x destroy.sh
	@./destroy.sh

status: ## Mostra status completo do cluster e aplicações
	@chmod +x status.sh
	@./status.sh

urls: ## Mostra as URLs de acesso
	@chmod +x scripts/99-show-urls.sh
	@./scripts/99-show-urls.sh

logs: ## Ver logs de um serviço. Uso: make logs SERVICE=nexo-be NAMESPACE=nexo-develop
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(YELLOW)⚠️  Especifique o SERVICE. Exemplo: make logs SERVICE=nexo-be NAMESPACE=nexo-develop$(RESET)"; \
		exit 1; \
	fi
	@kubectl logs -n $(or $(NAMESPACE),nexo-develop) -l app=$(SERVICE) --tail=100 -f

port-forward: ## Port-forward de um serviço. Uso: make port-forward SERVICE=nexo-be PORT=3000
	@if [ -z "$(SERVICE)" ] || [ -z "$(PORT)" ]; then \
		echo "$(YELLOW)⚠️  Especifique SERVICE e PORT. Exemplo: make port-forward SERVICE=nexo-be PORT=3000$(RESET)"; \
		exit 1; \
	fi
	@kubectl port-forward -n $(or $(NAMESPACE),nexo-develop) svc/$(SERVICE) $(PORT):$(PORT)

backup: ## Faz backup completo do cluster
	@echo "$(GREEN)💾 Fazendo backup...$(RESET)"
	@mkdir -p /Volumes/Backup/nexo-cloudlab/backups
	@kubectl get all -A -o yaml > /Volumes/Backup/nexo-cloudlab/backups/all-resources-$$(date +%Y%m%d-%H%M%S).yaml
	@echo "$(GREEN)✅ Backup concluído$(RESET)"

k9s: ## Abre k9s para gerenciamento visual
	@k9s

shell: ## Abre shell em um pod. Uso: make shell POD=nexo-be-xxx NAMESPACE=nexo-develop
	@if [ -z "$(POD)" ]; then \
		echo "$(YELLOW)⚠️  Especifique o POD. Exemplo: make shell POD=nexo-be-xxx$(RESET)"; \
		exit 1; \
	fi
	@kubectl exec -it -n $(or $(NAMESPACE),nexo-develop) $(POD) -- /bin/sh

top: ## Mostra uso de recursos (CPU/memória)
	@echo "$(BLUE)📊 Uso de Recursos$(RESET)"
	@echo ""
	@echo "$(BLUE)Nodes:$(RESET)"
	@kubectl top nodes 2>/dev/null || echo "Metrics não disponíveis"
	@echo ""
	@echo "$(BLUE)Pods (Top 10):$(RESET)"
	@kubectl top pods -A --sort-by=memory 2>/dev/null | head -n 11 || echo "Metrics não disponíveis"

grafana: ## Abre o Grafana no browser
	@open http://grafana.nexo.local

prometheus: ## Abre o Prometheus no browser
	@open http://prometheus.nexo.local

argocd: ## Abre o ArgoCD no browser
	@open http://argocd.nexo.local

troubleshoot: ## Mostra informações de troubleshooting
	@echo "$(BLUE)🔍 Troubleshooting$(RESET)"
	@echo ""
	@echo "$(BLUE)Cluster:$(RESET)"
	@k3d cluster list
	@echo ""
	@echo "$(BLUE)Nodes:$(RESET)"
	@kubectl get nodes
	@echo ""
	@echo "$(BLUE)Pods com problemas:$(RESET)"
	@kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded
	@echo ""
	@echo "$(BLUE)Últimos eventos:$(RESET)"
	@kubectl get events -A --sort-by='.lastTimestamp' | tail -n 20

.DEFAULT_GOAL := help
