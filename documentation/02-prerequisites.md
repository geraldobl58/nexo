# 02 — Pré-requisitos

> Tudo que você precisa instalar e configurar antes de começar.

---

## Ferramentas Locais

### Obrigatórias

| Ferramenta         | Versão  | Instalação (macOS)                                            | Propósito                    |
| ------------------ | ------- | ------------------------------------------------------------- | ---------------------------- |
| **Node.js**        | 20+ LTS | `brew install node@20`                                        | Runtime JavaScript           |
| **pnpm**           | 9.x     | `npm install -g pnpm@9`                                       | Package manager (workspaces) |
| **Docker Desktop** | Latest  | [docker.com](https://www.docker.com/products/docker-desktop/) | Containers locais            |
| **Git**            | Latest  | `brew install git`                                            | Controle de versão           |

### Para Deploy (DigitalOcean)

| Ferramenta  | Versão | Instalação (macOS)     | Propósito             |
| ----------- | ------ | ---------------------- | --------------------- |
| **doctl**   | Latest | `brew install doctl`   | CLI DigitalOcean      |
| **kubectl** | 1.31+  | `brew install kubectl` | CLI Kubernetes        |
| **Helm**    | 3.x    | `brew install helm`    | Package manager K8s   |
| **argocd**  | Latest | `brew install argocd`  | CLI ArgoCD (opcional) |

### Opcionais (Recomendadas)

| Ferramenta  | Instalação                          | Propósito                        |
| ----------- | ----------------------------------- | -------------------------------- |
| **k9s**     | `brew install k9s`                  | Terminal UI para Kubernetes      |
| **jq**      | `brew install jq`                   | Processamento JSON               |
| **kubectx** | `brew install kubectx`              | Trocar contextos K8s rapidamente |
| **Lens**    | [k8slens.dev](https://k8slens.dev/) | GUI para Kubernetes              |

---

## Contas e Acessos

### GitHub

| Item                            | Detalhes                                             |
| ------------------------------- | ---------------------------------------------------- |
| **Repositório**                 | `github.com/geraldobl58/nexo` (privado)              |
| **Permissões**                  | Write access ao repositório                          |
| **PAT (Personal Access Token)** | Scope: `read:packages`, `write:packages` (para GHCR) |

> O GitHub Container Registry (GHCR) é usado automaticamente pela pipeline. Não é necessário configurar nenhum registry externo.

### DigitalOcean

| Item                | Detalhes                                                  |
| ------------------- | --------------------------------------------------------- |
| **Conta**           | [cloud.digitalocean.com](https://cloud.digitalocean.com/) |
| **API Token**       | Full access (usado pelo `doctl`)                          |
| **Produtos usados** | DOKS (Kubernetes), Managed Database, Load Balancer, DNS   |

### Domínio

| Item            | Detalhes                                                         |
| --------------- | ---------------------------------------------------------------- |
| **Domínio**     | `*.g3developer.online` (DNS via DigitalOcean)                    |
| **DNS**         | Gerenciado na DigitalOcean (wildcard A record)                   |
| **TLS**         | Certificados Let's Encrypt via cert-manager (automático)         |
| **Subdomínios** | Ver [09-environments.md](09-environments.md) para lista completa |

---

## Verificação do Ambiente

Execute o seguinte script para verificar se todas as ferramentas estão instaladas:

```bash
#!/bin/bash
echo "=== Verificação de Pré-requisitos Nexo ==="
echo ""

check() {
  if command -v "$1" &>/dev/null; then
    echo "✅ $1 — $($1 --version 2>/dev/null | head -1)"
  else
    echo "❌ $1 — NÃO ENCONTRADO"
  fi
}

check node
check pnpm
check docker
check git

echo ""
echo "--- Deploy (DigitalOcean) ---"
check doctl
check kubectl
check helm

echo ""
echo "--- Opcionais ---"
check k9s
check jq
check kubectx
```

---

## Configuração Inicial do doctl

```bash
# Autenticar com token da DigitalOcean
doctl auth init
# Cole o API token quando solicitado

# Verificar autenticação
doctl account get

# Listar clusters existentes
doctl kubernetes cluster list
```

---

## Próximo Passo

→ [03 — Desenvolvimento Local](03-local-development.md)
