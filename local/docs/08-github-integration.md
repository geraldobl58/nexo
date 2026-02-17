# 🔧 Integração com GitHub - Nexo CloudLab

Este guia mostra como integrar seu CloudLab local com GitHub para CI/CD automatizado.

## 🎯 Visão Geral

Você pode usar GitHub Actions para:

- ✅ Build automático de imagens Docker
- ✅ Push para GitHub Container Registry (ghcr.io)
- ✅ Deploy automático via ArgoCD
- ✅ Testes automatizados
- ✅ Scan de segurança

## 🔐 Configurar Secrets no GitHub

### 1. Acessar Configurações de Secrets

1. Vá para seu repositório: https://github.com/geraldobl58/nexo
2. Settings → Secrets and variables → Actions
3. Click em "New repository secret"

### 2. Adicionar Secrets Necessários

> ℹ️ **NOTA IMPORTANTE:** O `GITHUB_TOKEN` é **automaticamente fornecido** pelo GitHub Actions em todos os workflows.
> Você **NÃO precisa criar este secret manualmente** - GitHub não permite criar secrets com este nome (é reservado).

**Secrets que você PRECISA criar:**

```bash
# ArgoCD
ARGOCD_SERVER
Value: argocd.nexo.local

ARGOCD_AUTH_TOKEN
Value: <obter do comando abaixo>

# Discord Notifications
DISCORD_WEBHOOK
Value: <seu webhook do Discord>

# Database (para migrations/seeds)
DATABASE_URL
Value: postgresql://nexo:nexo123@postgres.nexo-local:5432/nexo_db

# JWT Secret
JWT_SECRET
Value: super-secret-key-change-in-production
```

### 3. Obter ArgoCD Auth Token

```bash
# Fazer login no ArgoCD
argocd login argocd.nexo.local --username admin --insecure

# Gerar token (nunca expira)
argocd account generate-token --account admin

# Copiar o token e adicionar como secret ARGOCD_AUTH_TOKEN
```

## 🏗️ Estrutura de CI/CD

### Arquitetura

```
┌─────────────────────────────────────────────┐
│         GitHub Repository                   │
│  (Push code to main/develop)                │
└──────────────┬──────────────────────────────┘
               │
               │ Trigger GitHub Actions
               ↓
┌─────────────────────────────────────────────┐
│       GitHub Actions Runner                 │
│  (pode rodar no Mac local ou GitHub)        │
│  1. Run tests                               │
│  2. Build Docker image                      │
│  3. Push to ghcr.io (GitHub Registry)       │
│  4. Update Helm values                      │
│  5. Trigger ArgoCD sync                     │
└──────────────┬──────────────────────────────┘
               │
               │ ArgoCD detects changes
               ↓
┌─────────────────────────────────────────────┐
│         ArgoCD                              │
│  Sync and deploy to Kubernetes              │
└─────────────────────────────────────────────┘
```

## 📝 Workflows

### 1. CI - Continuous Integration

Arquivo: `.github/workflows/ci.yml`

```yaml
name: CI - Build and Test

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]
    paths:
      - "apps/**"
      - ".github/workflows/ci.yml"

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        app: [nexo-be, nexo-fe, nexo-auth]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: |
          npm install -g pnpm
          pnpm install

      - name: Run linter
        run: pnpm run lint --filter ${{ matrix.app }}

      - name: Run tests
        run: pnpm run test --filter ${{ matrix.app }}

      - name: Build
        run: pnpm run build --filter ${{ matrix.app }}

  security-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          scan-ref: "."
          format: "sarif"
          output: "trivy-results.sarif"

      - name: Upload results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: "trivy-results.sarif"
```

### 2. CD - Deploy to Local CloudLab

Arquivo: `.github/workflows/deploy-local.yml`

```yaml
name: CD - Deploy to Local CloudLab

on:
  push:
    branches: [develop]
    paths:
      - "apps/nexo-be/**"
      - "apps/nexo-fe/**"
      - "apps/nexo-auth/**"

env:
  REGISTRY: ghcr.io
  ARGOCD_SERVER: argocd.nexo.local

jobs:
  build-and-deploy:
    runs-on: self-hosted # Runner no Mac local

    strategy:
      matrix:
        include:
          - app: nexo-be
            path: apps/nexo-be
            helm: local/helm/nexo-be
          - app: nexo-fe
            path: apps/nexo-fe
            helm: local/helm/nexo-fe
          - app: nexo-auth
            path: apps/nexo-auth
            helm: local/helm/nexo-auth

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set image tag
        id: tag
        run: |
          SHORT_SHA=$(echo ${{ github.sha }} | cut -c1-7)
          echo "tag=develop-${SHORT_SHA}" >> $GITHUB_OUTPUT
          echo "short_sha=${SHORT_SHA}" >> $GITHUB_OUTPUT

      - name: Build Docker image
        run: |
          cd ${{ matrix.path }}
          docker build -t ${{ env.REGISTRY }}/${{ github.repository_owner }}/nexo-${{ matrix.app }}:${{ steps.tag.outputs.tag }} .
          docker tag ${{ env.REGISTRY }}/${{ github.repository_owner }}/nexo-${{ matrix.app }}:${{ steps.tag.outputs.tag }} \
                     ${{ env.REGISTRY }}/${{ github.repository_owner }}/nexo-${{ matrix.app }}:latest

      - name: Login to GitHub Container Registry
        run: |
          echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io \
            --username ${{ github.actor }} --password-stdin

      - name: Push to ghcr.io
        run: |
          docker push ${{ env.REGISTRY }}/${{ github.repository_owner }}/nexo-${{ matrix.app }}:${{ steps.tag.outputs.tag }}
          docker push ${{ env.REGISTRY }}/${{ github.repository_owner }}/nexo-${{ matrix.app }}:latest

      - name: Update Helm values
        run: |
          sed -i '' "s|repository:.*|repository: ${{ env.REGISTRY }}/${{ github.repository_owner }}/nexo-${{ matrix.app }}|" \
            ${{ matrix.helm }}/values-local.yaml
          sed -i '' "s|tag:.*|tag: \"${{ steps.tag.outputs.tag }}\"|" \
            ${{ matrix.helm }}/values-local.yaml

      - name: Commit and push Helm changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add ${{ matrix.helm }}/values-local.yaml
          git commit -m "chore: update ${{ matrix.app }} to ${{ steps.tag.outputs.tag }}" || exit 0
          git push

      - name: Sync ArgoCD
        run: |
          argocd login ${{ env.ARGOCD_SERVER }} \
            --auth-token ${{ secrets.ARGOCD_AUTH_TOKEN }} \
            --insecure
          argocd app sync ${{ matrix.app }}-local --force
          argocd app wait ${{ matrix.app }}-local --timeout 300
```

### 3. Release - Deploy to Production (g3developer.online)

⚠️ **IMPORTANTE:** Let's Encrypt **APENAS funciona em produção** (servidor DigitalOcean), não no cloudlab local!

**Motivo:** Let's Encrypt precisa validar o domínio via HTTP/DNS challenge pela internet.
Cloudlab está em `127.0.0.1` (localhost) e não é acessível externamente.

**Estratégia:**

- **Local (cloudlab):** HTTP simples (sem TLS)
- **Produção (DigitalOcean):** HTTPS com Let's Encrypt

Arquivo: `.github/workflows/release.yml`

```yaml
name: Release - Deploy to Production

on:
  push:
    tags:
      - "v*.*.*"

env:
  REGISTRY: ghcr.io/geraldobl58

jobs:
  release:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        app: [nexo-be, nexo-fe, nexo-auth]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Get version from tag
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./apps/${{ matrix.app }}
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ matrix.app }}:${{ steps.version.outputs.version }}
            ${{ env.REGISTRY }}/${{ matrix.app }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Update production Helm values
        run: |
          sed -i '' "s|tag:.*|tag: \"${{ steps.version.outputs.version }}\"|" \
            infra/helm/${{ matrix.app }}/values-prod.yaml

          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add infra/helm/${{ matrix.app }}/values-prod.yaml
          git commit -m "chore: release ${{ matrix.app }} ${{ steps.version.outputs.version }}"
          git push

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

## 🖥️ Self-Hosted Runner (Recomendado para Local)

### Por que usar?

- ✅ Acesso direto ao cluster local
- ✅ Não precisa expor serviços
- ✅ Build e deploy mais rápidos
- ✅ Grátis (usa sua máquina)

### Instalação

1. **Acessar configurações:**
   - Settings → Actions → Runners → New self-hosted runner

2. **No Mac, executar:**

```bash
# Criar diretório
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download
curl -o actions-runner-osx-arm64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-osx-arm64-2.311.0.tar.gz

# Extrair
tar xzf ./actions-runner-osx-arm64-2.311.0.tar.gz

# Configurar
./config.sh --url https://github.com/geraldobl58/nexo --token <TOKEN>

# Instalar como serviço (opcional)
sudo ./svc.sh install
sudo ./svc.sh start

# Ou rodar manualmente
./run.sh
```

3. **Labels sugeridos:**
   - `self-hosted`
   - `macOS`
   - `cloudlab`

## 🔄 Webhooks

### Configurar Webhook para ArgoCD

1. **No GitHub:**
   - Settings → Webhooks → Add webhook
   - Payload URL: `http://argocd.nexo.local/api/webhook`
   - Content type: `application/json`
   - Events: `Just the push event`

2. **Isso permite sync automático quando há push**

## 📦 Secrets Manager (Produção)

Para produção (g3developer.online), use um dos:

### 1. GitHub Secrets (Básico)

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 2. External Secrets Operator + 1Password (Recomendado)

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: onepassword-store
  namespace: nexo-prod
spec:
  provider:
    onepassword:
      connectHost: http://onepassword-connect:8080
      vaults:
        nexo: 1
      auth:
        secretRef:
          connectTokenSecretRef:
            name: onepassword-token
            key: token
```

## 🌐 Deploy para g3developer.online

### Configurar DNS

```bash
# No provedor de DNS do g3developer.online, adicionar:
# A records apontando para IP do servidor DigitalOcean

api.g3developer.online      → <IP_DO_SERVIDOR>
app.g3developer.online      → <IP_DO_SERVIDOR>
auth.g3developer.online     → <IP_DO_SERVIDOR>
```

### Let's Encrypt

Cert-manager já está configurado no cluster. Para produção:

```yaml
# infra/k8s/base/cert-manager-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: seu-email@exemplo.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

Ingress com TLS:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nexo-be-prod
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.g3developer.online
      secretName: nexo-api-tls
  rules:
    - host: api.g3developer.online
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nexo-be
                port:
                  number: 3000
```

## 🔍 Monitoramento de Pipelines

### Ver logs de Actions

```bash
# Via GitHub CLI
gh run list
gh run view <run-id>
gh run watch
```

### Ver status no ArgoCD

```bash
argocd app list
argocd app get nexo-be-local
```

## 📚 Best Practices

1. **Sempre use tags específicas** (não `latest` em prod)
2. **Scan de segurança** em todas as imagens
3. **Testes automatizados** antes de deploy
4. **Rollback automático** se health checks falharem
5. **Notificações** no Slack/Discord dos deploys

## 🆘 Troubleshooting

### Runner não conecta

```bash
# Ver logs
cd ~/actions-runner
./run.sh

# Reconfigurar
./config.sh remove
./config.sh --url https://github.com/geraldobl58/nexo --token <NEW_TOKEN>
```

### Build falha

```bash
# Ver logs no GitHub Actions
# Ou rodar localmente
cd apps/nexo-be
docker build -t test .
```

### ArgoCD não sincroniza

```bash
# Forçar sync
argocd app sync nexo-be-local --force

# Ver logs
argocd app logs nexo-be-local
```

---

**Boa automação! 🚀**
