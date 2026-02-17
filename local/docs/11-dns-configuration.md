# 🌐 Configuração de DNS Local - Nexo CloudLab

## ✅ Domínios Configurados Automaticamente

Quando você roda `./scripts/01-create-cluster.sh` ou `./scripts/update-hosts.sh`, os seguintes domínios são adicionados ao `/etc/hosts`:

### 🛠️ Ferramentas (Compartilhadas)

```
http://argocd.nexo.local         - GitOps (ArgoCD)
http://grafana.nexo.local         - Observabilidade (Grafana)
http://prometheus.nexo.local      - Métricas (Prometheus)
http://alertmanager.nexo.local    - Alertas (AlertManager)
http://kibana.nexo.local          - Logs (Kibana)
http://harbor.nexo.local          - Container Registry (Harbor)
http://traefik.nexo.local         - Traefik Dashboard
```

### 🚀 Ambiente: Develop

```
http://develop.nexo.local         - Frontend
http://develop.api.nexo.local     - Backend API
http://develop.auth.nexo.local    - Keycloak Auth
```

### 🧪 Ambiente: QA

```
http://qa.nexo.local              - Frontend
http://qa.api.nexo.local          - Backend API
http://qa.auth.nexo.local         - Keycloak Auth
```

### 🎭 Ambiente: Staging

```
http://staging.nexo.local         - Frontend
http://staging.api.nexo.local     - Backend API
http://staging.auth.nexo.local    - Keycloak Auth
```

### 🌐 Ambiente: Prod (Local)

```
http://prod.nexo.local            - Frontend
http://prod.api.nexo.local        - Backend API
http://prod.auth.nexo.local       - Keycloak Auth
```

---

## 🔧 Como Configurar

### Opção 1: Configuração Automática (Recomendado)

Durante a criação do cluster:

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo/local
./scripts/01-create-cluster.sh
```

O script automaticamente:

1. Faz backup do `/etc/hosts`
2. Remove entradas antigas
3. Adiciona todos os domínios

### Opção 2: Atualizar Apenas o /etc/hosts

Se o cluster já existe e você só quer atualizar o DNS:

```bash
cd /Users/geraldoluiz/Development/fullstack/nexo/local
./scripts/update-hosts.sh
```

### Opção 3: Configuração Manual

```bash
# Fazer backup
sudo cp /etc/hosts /etc/hosts.backup

# Editar manualmente
sudo nano /etc/hosts
```

Adicione ao final:

```
# Nexo CloudLab - Ferramentas
127.0.0.1 argocd.nexo.local
127.0.0.1 grafana.nexo.local
127.0.0.1 prometheus.nexo.local
127.0.0.1 alertmanager.nexo.local
127.0.0.1 kibana.nexo.local
127.0.0.1 harbor.nexo.local
127.0.0.1 traefik.nexo.local

# Nexo CloudLab - Aplicações Develop
127.0.0.1 develop.nexo.local
127.0.0.1 develop.api.nexo.local
127.0.0.1 develop.auth.nexo.local

# Nexo CloudLab - Aplicações QA
127.0.0.1 qa.nexo.local
127.0.0.1 qa.api.nexo.local
127.0.0.1 qa.auth.nexo.local

# Nexo CloudLab - Aplicações Staging
127.0.0.1 staging.nexo.local
127.0.0.1 staging.api.nexo.local
127.0.0.1 staging.auth.nexo.local

# Nexo CloudLab - Aplicações Prod (Local)
127.0.0.1 prod.nexo.local
127.0.0.1 prod.api.nexo.local
127.0.0.1 prod.auth.nexo.local
```

---

## ✅ Verificar Configuração

```bash
# Ver todas as entradas do Nexo CloudLab
grep "nexo.local" /etc/hosts

# Testar DNS
ping -c 1 argocd.nexo.local
ping -c 1 develop.nexo.local
ping -c 1 grafana.nexo.local

# Testar no browser
open http://argocd.nexo.local
open http://grafana.nexo.local
open http://develop.nexo.local
```

---

## 🔄 Restaurar Backup

Se algo der errado:

```bash
# Listar backups disponíveis
ls -la /etc/hosts.backup-*

# Restaurar um backup específico
sudo cp /etc/hosts.backup-20260217-143022 /etc/hosts

# Ou restaurar o mais recente
sudo cp $(ls -t /etc/hosts.backup-* | head -1) /etc/hosts
```

---

## 🧹 Limpar Entradas

Para remover todas as entradas do Nexo CloudLab:

```bash
# Fazer backup primeiro
sudo cp /etc/hosts /etc/hosts.backup-$(date +%Y%m%d-%H%M%S)

# Remover entradas
sudo sed -i '' '/# Nexo CloudLab/d' /etc/hosts
sudo sed -i '' '/nexo.local/d' /etc/hosts
```

---

## 🔍 Troubleshooting

### DNS não resolve

```bash
# Flush DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Verificar entradas no hosts
cat /etc/hosts | grep nexo.local

# Testar com curl
curl -v http://argocd.nexo.local
```

### Browser não acessa

```bash
# Verificar se o Ingress está rodando
kubectl get svc -n ingress-nginx

# Verificar Ingress rules
kubectl get ingress -A

# Ver logs do Ingress
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### "Could not resolve host"

```bash
# Verificar se as entradas estão corretas
grep "127.0.0.1 argocd.nexo.local" /etc/hosts

# Re-executar script de configuração
./scripts/update-hosts.sh
```

### Conflito com outros projetos

Se você tem outros projetos usando `.local`:

```bash
# Ver todas as entradas .local
grep ".local" /etc/hosts

# Se necessário, ajustar para usar outro domínio
# Por exemplo: nexo.dev, nexo.test, etc.
```

---

## 📝 Notas Importantes

### Por que usamos `.local`?

- ✅ Padrão para desenvolvimento local
- ✅ Não precisa registrar domínio
- ✅ Funciona offline
- ✅ Resolve automaticamente para 127.0.0.1

### Por que HTTP e não HTTPS?

No ambiente local:

- ✅ Tráfego não sai da máquina (seguro)
- ✅ Evita problemas com certificados self-signed
- ✅ Mais rápido (sem overhead de TLS)
- ❌ Let's Encrypt não funciona com `127.0.0.1`

Em produção (g3developer.online):

- ✅ Usa HTTPS com Let's Encrypt
- ✅ Certificados válidos
- ✅ Segurança para usuários externos

### Alternativas ao /etc/hosts

Se preferir não modificar `/etc/hosts`:

**1. dnsmasq (macOS):**

```bash
brew install dnsmasq
echo 'address=/.nexo.local/127.0.0.1' > /usr/local/etc/dnsmasq.conf
sudo brew services start dnsmasq
```

**2. Resolver (NetworkManager):**

```bash
# Adicionar resolver
sudo mkdir -p /etc/resolver
echo "nameserver 127.0.0.1" | sudo tee /etc/resolver/nexo.local
```

**3. Port-forward (não recomendado):**

```bash
# Acessar via localhost:porta
kubectl port-forward -n argocd svc/argocd-server 8080:443
# Acessa em http://localhost:8080
```

---

## 🎯 Melhores Práticas

1. **Sempre fazer backup** antes de editar `/etc/hosts`
2. **Usar os scripts fornecidos** (automático e seguro)
3. **Documentar** entradas customizadas
4. **Verificar** após modificações
5. **Limpar** entradas antigas de projetos descontinuados

---

## 📚 Referências

- [macOS /etc/hosts](https://support.apple.com/guide/mac-help/mh14956/mac)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [k3d Port Mapping](https://k3d.io/v5.4.6/usage/exposing_services/)

---

**Configuração automática:** `./scripts/update-hosts.sh` 🚀
