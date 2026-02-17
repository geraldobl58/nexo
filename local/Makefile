.PHONY: help install start stop restart clean status logs port-forward backup restore

# Cores
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
BLUE   := $(shell tput -Txterm setaf 4)
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

install: ## Instala todas as dependências e cria o cluster completo
	@echo "$(GREEN)🚀 Instalando CloudLab completo...$(RESET)"
	@chmod +x scripts/*.sh
	@./scripts/00-install-deps.sh
	@./scripts/01-create-cluster.sh
	@./scripts/02-install-argocd.sh
	@./scripts/03-install-observability.sh
	# @./scripts/04-install-elasticsearch.sh  # DESABILITADO - muito pesado
	@echo "$(GREEN)✅ CloudLab instalado com sucesso!$(RESET)"
	@make urls

install-deps: ## Instala apenas as dependências (brew, k3d, kubectl, etc)
	@chmod +x scripts/00-install-deps.sh
	@./scripts/00-install-deps.sh

create-cluster: ## Cria apenas o cluster Kubernetes
	@chmod +x scripts/01-create-cluster.sh
	@./scripts/01-create-cluster.sh

update-hosts: ## Atualiza o /etc/hosts com os domínios do CloudLab (recria tudo)
	@chmod +x scripts/update-hosts.sh
	@./scripts/update-hosts.sh

configure-hosts: ## Adiciona apenas hosts faltando ao /etc/hosts (sem duplicar)
	@chmod +x scripts/configure-hosts.sh
	@./scripts/configure-hosts.sh

install-argocd: ## Instala apenas o ArgoCD
	@chmod +x scripts/02-install-argocd.sh
	@./scripts/02-install-argocd.sh

install-observability: ## Instala apenas a stack de observabilidade
	@chmod +x scripts/03-install-observability.sh
	@./scripts/03-install-observability.sh

# install-logging: ## Instala apenas o Elasticsearch/Kibana (DESABILITADO - muito pesado)
# 	@chmod +x scripts/04-install-elasticsearch.sh
# 	@./scripts/04-install-elasticsearch.sh

deploy-apps: ## Deploy das aplicações via ArgoCD
	@chmod +x scripts/05-deploy-apps.sh
	@./scripts/05-deploy-apps.sh

start: ## Inicia o cluster (se estiver parado)
	@echo "$(GREEN)▶️  Iniciando cluster...$(RESET)"
	@k3d cluster start nexo-local
	@echo "$(GREEN)✅ Cluster iniciado$(RESET)"

stop: ## Para o cluster (mas mantém dados)
	@echo "$(YELLOW)⏸️  Parando cluster...$(RESET)"
	@k3d cluster stop nexo-local
	@echo "$(YELLOW)✅ Cluster parado$(RESET)"

restart: stop start ## Reinicia o cluster

destroy: ## Destroi TUDO (interactive): releases, namespaces, cluster, volumes, hosts
	@echo "$(RED)🗑️  Destroy completo do CloudLab...$(RESET)"
	@chmod +x destroy.sh
	@./destroy.sh

delete: ## Deleta apenas o cluster k3d (mantém volumes)
	@echo "$(YELLOW)⚠️  Deletando cluster...$(RESET)"
	@k3d cluster delete nexo-local
	@echo "$(YELLOW)✅ Cluster deletado$(RESET)"

clean: delete ## Remove cluster e limpa dados do SSD (sem confirmação)
	@echo "$(YELLOW)🧹 Limpando dados...$(RESET)"
	@sudo rm -rf /Volumes/Backup/nexo-cloudlab/data/* 2>/dev/null || true
	@sudo rm -rf /Volumes/Backup/nexo-cloudlab/postgres/* 2>/dev/null || true
	@sudo rm -rf /Volumes/Backup/nexo-cloudlab/prometheus/* 2>/dev/null || true
	@sudo rm -rf /Volumes/Backup/nexo-cloudlab/grafana/* 2>/dev/null || true
	# @sudo rm -rf /Volumes/Backup/nexo-cloudlab/elasticsearch/* 2>/dev/null || true  # Removido
	# @sudo rm -rf /Volumes/Backup/nexo-cloudlab/harbor/* 2>/dev/null || true  # Removido
	@echo "$(GREEN)✅ Limpeza concluída$(RESET)"

status: ## Mostra status do cluster
	@echo "$(BLUE)📊 Status do Cluster$(RESET)"
	@echo ""
	@k3d cluster list
	@echo ""
	@echo "$(BLUE)Nodes:$(RESET)"
	@kubectl get nodes -o wide 2>/dev/null || echo "Cluster não está rodando"
	@echo ""
	@echo "$(BLUE)Pods:$(RESET)"
	@kubectl get pods -A 2>/dev/null || echo "Cluster não está rodando"

urls: ## Mostra as URLs de acesso
	@chmod +x scripts/99-show-urls.sh
	@./scripts/99-show-urls.sh

logs: ## Ver logs de um serviço. Uso: make logs SERVICE=nexo-be NAMESPACE=nexo-local
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(YELLOW)⚠️  Especifique o SERVICE. Exemplo: make logs SERVICE=nexo-be$(RESET)"; \
		exit 1; \
	fi
	@kubectl logs -n $(or $(NAMESPACE),nexo-local) -l app=$(SERVICE) --tail=100 -f

port-forward: ## Port-forward de um serviço. Uso: make port-forward SERVICE=nexo-be PORT=3000
	@if [ -z "$(SERVICE)" ] || [ -z "$(PORT)" ]; then \
		echo "$(YELLOW)⚠️  Especifique SERVICE e PORT. Exemplo: make port-forward SERVICE=nexo-be PORT=3000$(RESET)"; \
		exit 1; \
	fi
	@kubectl port-forward -n $(or $(NAMESPACE),nexo-local) svc/$(SERVICE) $(PORT):$(PORT)

backup: ## Faz backup completo do cluster
	@echo "$(GREEN)💾 Fazendo backup...$(RESET)"
	@mkdir -p /Volumes/Backup/nexo-cloudlab/backups
	@kubectl get all -A -o yaml > /Volumes/Backup/nexo-cloudlab/backups/all-resources-$$(date +%Y%m%d-%H%M%S).yaml
	@echo "$(GREEN)✅ Backup concluído$(RESET)"

restore: ## Restaura backup do cluster (em desenvolvimento)
	@echo "$(YELLOW)⚠️  Funcionalidade em desenvolvimento$(RESET)"

k9s: ## Abre k9s para gerenciamento visual
	@k9s

shell: ## Abre shell em um pod. Uso: make shell POD=nexo-be-xxx NAMESPACE=nexo-local
	@if [ -z "$(POD)" ]; then \
		echo "$(YELLOW)⚠️  Especifique o POD. Exemplo: make shell POD=nexo-be-xxx$(RESET)"; \
		exit 1; \
	fi
	@kubectl exec -it -n $(or $(NAMESPACE),nexo-local) $(POD) -- /bin/sh

top: ## Mostra uso de recursos
	@echo "$(BLUE)📊 Uso de Recursos$(RESET)"
	@echo ""
	@echo "$(BLUE)Nodes:$(RESET)"
	@kubectl top nodes 2>/dev/null || echo "Metrics não disponíveis"
	@echo ""
	@echo "$(BLUE)Pods (Top 10):$(RESET)"
	@kubectl top pods -A --sort-by=memory 2>/dev/null | head -n 11 || echo "Metrics não disponíveis"

dashboard: ## Abre o dashboard do ArgoCD
	@open http://argocd.local.nexo.dev

grafana: ## Abre o Grafana
	@open http://grafana.local.nexo.dev

# kibana: ## Abre o Kibana (REMOVIDO)
# 	@open http://kibana.local.nexo.dev

prometheus: ## Abre o Prometheus
	@open http://prometheus.local.nexo.dev

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
