# ============================================================================
# Nexo CloudLab Ninja - Makefile Principal
# ============================================================================
# Gerenciamento unificado do ambiente local Kubernetes
#
# Apenas 3 comandos:
#   make setup   → Cria todo o ambiente
#   make status  → Verifica o que está rodando
#   make destroy → Destrói tudo (interativo)
# ============================================================================

.PHONY: help setup status destroy

# Mostrar ajuda (comando padrão)
help:
	@echo ""
	@echo "╔═══════════════════════════════════════════════════════════╗"
	@echo "║                                                           ║"
	@echo "║    _   _                    ____ _                 _ _    ║"
	@echo "║   | \ | | _____  _____    / ___| | ___  _   _  __| | |   ║"
	@echo "║   |  \| |/ _ \ \/ / _ \  | |   | |/ _ \| | | |/ _\` | |   ║"
	@echo "║   | |\  |  __/>  < (_) | | |___| | (_) | |_| | (_| | |__ ║"
	@echo "║   |_| \_|\___/_/\_\___/   \____|_|\___/ \__,_|\__,_|____|║"
	@echo "║                                                           ║"
	@echo "║   🥷 CloudLab Ninja - Kubernetes Local                    ║"
	@echo "║                                                           ║"
	@echo "╚═══════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Comandos:"
	@echo ""
	@echo "  make setup     🚀 Criar ambiente completo"
	@echo "                    • Cluster k3d (1 server + 6 agents)"
	@echo "                    • ArgoCD para GitOps automático"
	@echo "                    • Prometheus + Grafana (observabilidade)"
	@echo "                    • 12 aplicações em 4 ambientes"
	@echo "                    • DNS local configurado automaticamente"
	@echo ""
	@echo "  make status    📊 Verificar status de tudo"
	@echo "                    • Cluster, nodes e namespaces"
	@echo "                    • ArgoCD applications (sync/health)"
	@echo "                    • Ferramentas (Grafana, Prometheus)"
	@echo "                    • Pods por ambiente (develop/qa/staging/prod)"
	@echo ""
	@echo "  make destroy   🗑️  Destruir ambiente (interativo)"
	@echo "                    • Remove cluster k3d"
	@echo "                    • Limpa /etc/hosts"
	@echo "                    • Remove contexto kubeconfig"
	@echo "                    • Opcionalmente remove volumes persistentes"
	@echo ""
	@echo "Ambientes:  develop → qa → staging → prod"
	@echo ""
	@echo "Pipeline:   CI/CD via GitHub Actions (pipeline.yml)"
	@echo "Release:    Tags v*.*.* disparam release.yml"
	@echo ""
	@echo "Exemplo:"
	@echo ""
	@echo "  $$ make setup     # Primeira vez: criar tudo (~15 min)"
	@echo "  $$ make status    # Verificar o que está rodando"
	@echo "  $$ make destroy   # Destruir quando terminar"
	@echo ""

# Configurar ambiente completo (interativo: pede confirmação)
setup:
	@bash local/setup.sh

# Verificar status de todos os componentes
status:
	@bash local/status.sh

# Destruir ambiente completo (interativo: pede confirmação + opção de remover volumes)
destroy:
	@bash local/destroy.sh

# Alias para help (quando digitar apenas 'make')
.DEFAULT_GOAL := help
