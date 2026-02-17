# 🌐 DNS Local - Domínios Configurados

## ✅ Domínios Automaticamente Configurados

### 🛠️ Ferramentas

```
http://argocd.nexo.local
http://grafana.nexo.local
http://prometheus.nexo.local
http://alertmanager.nexo.local
http://kibana.nexo.local
http://harbor.nexo.local
http://traefik.nexo.local
```

### 🚀 Develop

```
http://develop.nexo.local
http://develop.api.nexo.local
http://develop.auth.nexo.local
```

### 🧪 QA

```
http://qa.nexo.local
http://qa.api.nexo.local
http://qa.auth.nexo.local
```

### 🎭 Staging

```
http://staging.nexo.local
http://staging.api.nexo.local
http://staging.auth.nexo.local
```

### 🌐 Prod (Local)

```
http://prod.nexo.local
http://prod.api.nexo.local
http://prod.auth.nexo.local
```

---

## 🚀 Como Configurar

### Opção 1: Durante criação do cluster

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo/local
./scripts/01-create-cluster.sh
# Configura /etc/hosts automaticamente!
```

### Opção 2: Atualizar apenas DNS

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo/local
./scripts/update-hosts.sh
# ou
make update-hosts
```

### Opção 3: Via Makefile no setup completo

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo/local
make setup
# Inclui configuração de DNS
```

---

## ✅ Verificar se Funcionou

```bash
# Ver entradas no hosts
grep "nexo.local" /etc/hosts

# Testar DNS
ping -c 1 argocd.nexo.local
ping -c 1 develop.nexo.local

# Ver no browser
open http://argocd.nexo.local (após instalar ArgoCD)
open http://grafana.nexo.local (após instalar Grafana)
open http://develop.nexo.local (após deploy de apps)
```

---

## 🔄 Comandos Úteis

```bash
# Ver todas URLs configuradas
make urls

# Atualizar DNS
make update-hosts

# Ver status
make status

# Troubleshoot
make troubleshoot

# Restaurar backup do hosts
sudo cp /etc/hosts.backup-* /etc/hosts
```

---

## 📝 Detalhes Técnicos

- **Domínio:** `.nexo.local`
- **IP:** `127.0.0.1` (localhost)
- **Protocolo:** HTTP (sem TLS)
- **Ingress:** NGINX Ingress Controller
- **Backup:** `/etc/hosts.backup-*`

---

## 📖 Documentação Completa

Ver: [local/docs/12-dns-configuration.md](./local/docs/12-dns-configuration.md)
