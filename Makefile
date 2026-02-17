# Nexo CloudLab - Makefile
# =========================
# Gerenciamento simplificado do ambiente local

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
	@echo "║   CloudLab - Comandos Disponíveis                        ║"
	@echo "║                                                           ║"
	@echo "╚═══════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Comandos:"
	@echo ""
	@echo "  make setup     - Criar ambiente completo do CloudLab"
	@echo "                   • Cluster k3d (7 nodes)"
	@echo "                   • ArgoCD para GitOps"
	@echo "                   • Prometheus + Grafana"
	@echo "                   • 12 aplicações em 4 ambientes"
	@echo ""
	@echo "  make status    - Verificar status de todos os componentes"
	@echo "                   • Cluster e nodes"
	@echo "                   • Namespaces"
	@echo "                   • ArgoCD applications"
	@echo "                   • Ferramentas (Grafana, Prometheus)"
	@echo "                   • Aplicações por ambiente"
	@echo ""
	@echo "  make destroy   - Destruir ambiente completamente"
	@echo "                   • Remove cluster k3d"
	@echo "                   • Limpa /etc/hosts"
	@echo "                   • Remove contexto kubeconfig"
	@echo "                   • Opcionalmente remove volumes"
	@echo ""
	@echo "Exemplo de uso:"
	@echo ""
	@echo "  $$ make setup     # Primeira vez: criar tudo"
	@echo "  $$ make status    # Verificar o que está rodando"
	@echo "  $$ make destroy   # Destruir quando terminar"
	@echo ""

# Configurar ambiente completo
setup:
	@echo "🚀 Iniciando setup do CloudLab..."
	@bash local/setup.sh

# Verificar status de todos os componentes
status:
	@bash local/status.sh

# Destruir ambiente completo
destroy:
	@bash local/destroy.sh

# Alias para help (quando digitar apenas 'make')
.DEFAULT_GOAL := help
