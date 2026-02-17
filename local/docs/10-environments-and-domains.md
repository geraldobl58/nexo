# 🌍 Ambientes e Domínios - Estratégia Completa

## 📊 Visão Geral

A plataforma Nexo usa **dois tipos de ambiente**:

1. **CloudLab Local** (desenvolvimento e testes) - HTTP simples
2. **Produção Real** (DigitalOcean) - HTTPS com Let's Encrypt

---

## 🏠 CloudLab Local (k3d)

### Características

- **Acesso:** Apenas localhost (127.0.0.1)
- **Protocolo:** HTTP (sem TLS/HTTPS)
- **Domínio:** `*.nexo.local`
- **DNS:** `/etc/hosts` (configurado automaticamente)
- **Propósito:** Desenvolvimento, testes, QA, homologação

### Por que SEM HTTPS?

❌ **Let's Encrypt NÃO funciona localmente porque:**

- Precisa validar o domínio via HTTP-01 ou DNS-01 challenge
- Validação requer que o domínio seja acessível pela internet
- CloudLab está em `127.0.0.1` (localhost) - não acessível externamente
- Certificados self-signed causam avisos de segurança no browser

✅ **HTTP é suficiente para local porque:**

- Tráfego não sai da máquina (seguro)
- Mais rápido (sem overhead de TLS)
- Evita problemas com certificados
- Desenvolvimento mais ágil

### Ambientes Disponíveis

| Ambiente  | Branch    | Namespace      | URLs                                                       |
| --------- | --------- | -------------- | ---------------------------------------------------------- |
| Develop   | `develop` | `nexo-local`   | http://develop.nexo.local<br>http://develop.api.nexo.local |
| QA        | `qa`      | `nexo-qa`      | http://qa.nexo.local<br>http://qa.api.nexo.local           |
| Staging   | `staging` | `nexo-staging` | http://staging.nexo.local<br>http://staging.api.nexo.local |
| Prod Test | `main`    | `nexo-prod`    | http://prod.nexo.local<br>http://prod.api.nexo.local       |

### Ferramentas (compartilhadas entre ambientes)

```
http://argocd.nexo.local
http://grafana.nexo.local
http://prometheus.nexo.local
http://alertmanager.nexo.local
http://kibana.nexo.local
http://harbor.nexo.local
http://traefik.nexo.local
```

### Configuração DNS Local

```bash
# /etc/hosts (configurado automaticamente pelo script)
127.0.0.1 develop.nexo.local develop.api.nexo.local develop.auth.nexo.local
127.0.0.1 qa.nexo.local qa.api.nexo.local qa.auth.nexo.local
127.0.0.1 staging.nexo.local staging.api.nexo.local staging.auth.nexo.local
127.0.0.1 prod.nexo.local prod.api.nexo.local prod.auth.nexo.local

127.0.0.1 argocd.nexo.local grafana.nexo.local prometheus.nexo.local
127.0.0.1 alertmanager.nexo.local kibana.nexo.local harbor.nexo.local
127.0.0.1 traefik.nexo.local
```

---

## 🌐 Produção Real (DigitalOcean)

### Características

- **Acesso:** Internet pública
- **Protocolo:** HTTPS (TLS via Let's Encrypt)
- **Domínio:** `g3developer.online`
- **DNS:** Gerenciado no registrador de domínio
- **Propósito:** Produção, usuários reais

### Ambiente de Produção

| Ambiente | Branch | Cluster      | URL                                                          | TLS           |
| -------- | ------ | ------------ | ------------------------------------------------------------ | ------------- |
| Produção | `main` | DigitalOcean | https://g3developer.online<br>https://api.g3developer.online | Let's Encrypt |

### Configuração DNS (no Registrador)

```
# Configurar no painel do registrador de domínio
# (ex: GoDaddy, Namecheap, Cloudflare, etc)

Type    Host    Value                     TTL
-----   ------  ------------------------  -----
A       @       <IP_DO_SERVIDOR_DO>       3600
A       api     <IP_DO_SERVIDOR_DO>       3600
A       auth    <IP_DO_SERVIDOR_DO>       3600
A       *       <IP_DO_SERVIDOR_DO>       3600

CNAME   www     g3developer.online        3600
```

### Certificado SSL (Let's Encrypt)

**Arquivo:** `infra/k8s/base/cert-manager-issuer.yaml`

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@g3developer.online
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

**Aplicar no cluster de PRODUÇÃO (DigitalOcean):**

```bash
# SSH no servidor DigitalOcean
ssh root@<IP_DO_SERVIDOR>

# Instalar cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Aguardar cert-manager subir
kubectl wait --for=condition=Available --timeout=300s \
  -n cert-manager deployment/cert-manager

# Aplicar ClusterIssuer
kubectl apply -f infra/k8s/base/cert-manager-issuer.yaml

# Verificar
kubectl get clusterissuer
kubectl describe clusterissuer letsencrypt-prod
```

### Ingress com TLS (Produção)

**Arquivo:** `infra/helm/nexo-fe/values-prod.yaml`

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: g3developer.online
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: nexo-fe-tls
      hosts:
        - g3developer.online
```

---

## 🔄 Fluxo de Deploy por Ambiente

### CloudLab Local (HTTP)

```
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │ git push origin develop/qa/staging
       ▼
┌─────────────────┐
│ GitHub Actions  │
│  - Tests        │
│  - Build        │
└──────┬──────────┘
       │ Push to Harbor (harbor.nexo.local)
       ▼
┌─────────────────┐
│     ArgoCD      │
│  Auto-sync      │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          CloudLab k3d Cluster           │
│  ┌──────────┬──────────┬──────────┐    │
│  │ develop  │    qa    │ staging  │    │
│  │ .local   │ .local   │ .local   │    │
│  └──────────┴──────────┴──────────┘    │
│         HTTP (sem TLS)                  │
└─────────────────────────────────────────┘
```

### Produção Real (HTTPS)

```
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │ git tag v1.0.0
       │ git push origin main --tags
       ▼
┌─────────────────┐
│ GitHub Actions  │
│  - Tests        │
│  - Build        │
│  - ** APROVAÇÃO MANUAL **
└──────┬──────────┘
       │ Push to GHCR (ghcr.io)
       ▼
┌─────────────────┐
│     ArgoCD      │
│  (DigitalOcean) │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      DigitalOcean K8s Cluster           │
│  ┌────────────────────────────────┐    │
│  │         Production             │    │
│  │    g3developer.online          │    │
│  │  HTTPS (Let's Encrypt)         │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 🎯 Decisão: Quando usar HTTP vs HTTPS?

### Use HTTP (sem TLS):

✅ **CloudLab Local** (develop, qa, staging, prod-test)

- Acesso apenas localhost
- Desenvolvimento e testes
- Não exposto à internet
- Mais rápido e simples

### Use HTTPS (com Let's Encrypt):

✅ **Produção Real** (g3developer.online)

- Acesso público pela internet
- Dados sensíveis de usuários
- Compliance e segurança
- SEO (Google favorece HTTPS)
- Confiança do usuário

---

## 🔧 Setup de Produção (DigitalOcean)

### 1. Preparar Servidor

```bash
# SSH no servidor
ssh root@<IP_DO_SERVIDOR>

# Instalar k3s
curl -sfL https://get.k3s.io | sh -

# Verificar cluster
kubectl get nodes
```

### 2. Configurar DNS

No painel do registrador de domínio (onde comprou g3developer.online):

```
A Record:
@ → <IP_DO_SERVIDOR>
api → <IP_DO_SERVIDOR>
auth → <IP_DO_SERVIDOR>
* → <IP_DO_SERVIDOR>
```

**Testar DNS:**

```bash
nslookup g3developer.online
nslookup api.g3developer.online
```

### 3. Instalar cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Aguardar
kubectl wait --for=condition=Available --timeout=300s \
  -n cert-manager deployment/cert-manager
```

### 4. Criar ClusterIssuer

```bash
kubectl apply -f infra/k8s/base/cert-manager-issuer.yaml

# Verificar
kubectl describe clusterissuer letsencrypt-prod
```

### 5. Instalar ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Aguardar
kubectl wait --for=condition=Available --timeout=600s \
  -n argocd deployment/argocd-server
```

### 6. Configurar Ingress com TLS

```bash
# ArgoCD conecta ao Git e aplica helm charts
# Helm charts em infra/helm/*/values-prod.yaml já têm TLS configurado
```

### 7. Verificar Certificado

```bash
# Ver certificados
kubectl get certificate -A

# Ver status
kubectl describe certificate nexo-fe-tls -n nexo-prod

# Verificar no browser
open https://g3developer.online
```

---

## 🚨 Troubleshooting

### Certificado não emitido

```bash
# Ver eventos
kubectl describe certificate nexo-fe-tls -n nexo-prod
kubectl get challenges -A
kubectl describe challenge -n nexo-prod

# Logs cert-manager
kubectl logs -n cert-manager deployment/cert-manager

# Comum: DNS não propagado
# Solução: Aguardar 1-24h para propagação completa
```

### "Certificate not trusted"

```bash
# Verificar se está usando letsencrypt-prod (não staging)
kubectl get clusterissuer

# Verificar email no ClusterIssuer
kubectl describe clusterissuer letsencrypt-prod

# Reemitir certificado
kubectl delete certificate nexo-fe-tls -n nexo-prod
# ArgoCD vai recriar automaticamente
```

### DNS não resolve

```bash
# Testar DNS
dig g3developer.online
nslookup g3developer.online
ping g3developer.online

# Flush DNS cache (local)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

---

## 📊 Checklist de Deploy

### CloudLab Local

- [ ] Docker Desktop instalado e rodando
- [ ] k3d cluster criado (7 nodes)
- [ ] `/etc/hosts` configurado automaticamente
- [ ] ArgoCD instalado
- [ ] Harbor registry instalado
- [ ] Apps deployadas via ArgoCD
- [ ] Acessar http://develop.nexo.local

### Produção (DigitalOcean)

- [ ] Servidor k3s configurado
- [ ] DNS apontando para IP do servidor
- [ ] cert-manager instalado
- [ ] ClusterIssuer configurado
- [ ] ArgoCD instalado
- [ ] Apps deployadas com Ingress + TLS
- [ ] Certificado Let's Encrypt emitido
- [ ] Acessar https://g3developer.online

---

## 🎓 Boas Práticas

### Desenvolvimento

1. Sempre desenvolver em `develop` branch
2. Testar em `http://develop.nexo.local`
3. PR para `qa` → testes de qualidade
4. PR para `staging` → homologação final
5. PR para `main` → produção (com aprovação)

### Produção

1. **Sempre** usar HTTPS em produção
2. Renovação automática de certificados (Let's Encrypt)
3. Monitorar expiração: `kubectl get certificate -A`
4. Backup dos secrets de TLS
5. Configurar redirects HTTP → HTTPS no Ingress

### Segurança

1. **Nunca** expor CloudLab para internet
2. **Sempre** usar HTTPS em produção
3. Manter cert-manager atualizado
4. Configurar rate limiting no Ingress
5. Usar secrets do Kubernetes para credenciais

---

## 🔗 Referências

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [K3s Documentation](https://docs.k3s.io/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)

---

**Resumo:** Use HTTP no local, HTTPS em produção. Simples assim! 🎯
