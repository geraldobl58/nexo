# 🔐 GitHub Secrets - Guia Completo

Este documento lista **TODOS os secrets e variables** necessários para o funcionamento dos pipelines de CI/CD.

---

## 📋 Índice

1. [Onde Configurar](#onde-configurar)
2. [Secrets Obrigatórios](#secrets-obrigatórios)
3. [Secrets por Ambiente](#secrets-por-ambiente)
4. [Variables (Não-Sensíveis)](#variables-não-sensíveis)
5. [Environments](#environments)
6. [Como Gerar Cada Secret](#como-gerar-cada-secret)
7. [Boas Práticas](#boas-práticas)
8. [Rotação de Secrets](#rotação-de-secrets)

---

## Onde Configurar

### Acessar Configurações

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Você verá duas abas:
   - **Secrets**: Valores sensíveis (criptografados)
   - **Variables**: Valores não-sensíveis (visíveis em logs)

### Tipos de Secrets

| Tipo                    | Uso                                      | Exemplo             |
| ----------------------- | ---------------------------------------- | ------------------- |
| **Repository secrets**  | Disponível em todos os workflows         | `DO_TOKEN`          |
| **Environment secrets** | Disponível apenas no ambiente específico | `PROD_DATABASE_URL` |

---

## Secrets Obrigatórios

### Infraestrutura DigitalOcean

| Secret     | Descrição                 | Formato | Onde Obter                                                      |
| ---------- | ------------------------- | ------- | --------------------------------------------------------------- |
| `DO_TOKEN` | Token da API DigitalOcean | String  | [API Tokens](https://cloud.digitalocean.com/account/api/tokens) |

> **Nota:** O GitHub Container Registry (ghcr.io) usa automaticamente o `GITHUB_TOKEN` fornecido pelo GitHub Actions, não sendo necessário token adicional.

### Kubernetes

| Secret               | Descrição                          | Formato | Onde Obter                                 |
| -------------------- | ---------------------------------- | ------- | ------------------------------------------ |
| `KUBECONFIG_DEV`     | Kubeconfig do cluster para DEV     | Base64  | `doctl kubernetes cluster kubeconfig show` |
| `KUBECONFIG_QA`      | Kubeconfig do cluster para QA      | Base64  | Mesmo cluster, mesmo valor                 |
| `KUBECONFIG_STAGING` | Kubeconfig do cluster para STAGING | Base64  | Mesmo cluster, mesmo valor                 |
| `KUBECONFIG_PROD`    | Kubeconfig do cluster para PROD    | Base64  | Mesmo cluster, mesmo valor                 |

> **Nota**: Como todos os ambientes rodam no mesmo cluster DOKS, os 4 secrets de KUBECONFIG terão o mesmo valor.

### ArgoCD

| Secret              | Descrição                       | Formato | Onde Obter                      |
| ------------------- | ------------------------------- | ------- | ------------------------------- |
| `ARGOCD_AUTH_TOKEN` | Token de autenticação do ArgoCD | String  | `argocd account generate-token` |

---

## Secrets por Ambiente

Configure estes secrets em **Settings → Environments → [ambiente] → Environment secrets**:

### Environment: `dev`

| Secret                   | Valor Exemplo                                                        |
| ------------------------ | -------------------------------------------------------------------- |
| `DATABASE_URL`           | `postgresql://nexo:password@postgres.nexo-develop:5432/nexo_develop` |
| `REDIS_URL`              | `redis://redis.nexo-develop:6379`                                    |
| `KEYCLOAK_CLIENT_SECRET` | `dev-client-secret-xxxx`                                             |
| `JWT_SECRET`             | `dev-jwt-secret-32-chars-minimum`                                    |
| `NEXTAUTH_SECRET`        | `dev-nextauth-secret-32-chars`                                       |

### Environment: `qa`

| Secret                   | Valor Exemplo                                              |
| ------------------------ | ---------------------------------------------------------- |
| `DATABASE_URL`           | `postgresql://nexo:password@postgres.nexo-qa:5432/nexo_qa` |
| `REDIS_URL`              | `redis://redis.nexo-qa:6379`                               |
| `KEYCLOAK_CLIENT_SECRET` | `qa-client-secret-xxxx`                                    |
| `JWT_SECRET`             | `qa-jwt-secret-32-chars-minimum`                           |
| `NEXTAUTH_SECRET`        | `qa-nextauth-secret-32-chars`                              |

### Environment: `staging`

| Secret                   | Valor Exemplo                                                        |
| ------------------------ | -------------------------------------------------------------------- |
| `DATABASE_URL`           | `postgresql://nexo:password@postgres.nexo-staging:5432/nexo_staging` |
| `REDIS_URL`              | `redis://redis.nexo-staging:6379`                                    |
| `KEYCLOAK_CLIENT_SECRET` | `staging-client-secret-xxxx`                                         |
| `JWT_SECRET`             | `staging-jwt-secret-32-chars-minimum`                                |
| `NEXTAUTH_SECRET`        | `staging-nextauth-secret-32-chars`                                   |

### Environment: `prod`

| Secret                   | Valor Exemplo                                                                     |
| ------------------------ | --------------------------------------------------------------------------------- |
| `DATABASE_URL`           | `postgresql://nexo:STRONG_PASSWORD@postgres.nexo-production:5432/nexo_production` |
| `REDIS_URL`              | `redis://redis.nexo-production:6379`                                              |
| `KEYCLOAK_CLIENT_SECRET` | `prod-client-secret-STRONG`                                                       |
| `JWT_SECRET`             | `prod-jwt-secret-VERY-STRONG-64-chars`                                            |
| `NEXTAUTH_SECRET`        | `prod-nextauth-secret-VERY-STRONG`                                                |

---

## Variables (Não-Sensíveis)

Configure em **Settings → Secrets and variables → Actions → Variables**:

| Variable                | Valor                 | Descrição                    |
| ----------------------- | --------------------- | ---------------------------- |
| `REGISTRY`              | `ghcr.io/geraldobl58` | URL do Container Registry    |
| `ARGOCD_SERVER`         | `argocd.nexo.io`      | URL do servidor ArgoCD       |
| `K8S_NAMESPACE_DEV`     | `nexo-develop`        | Namespace Kubernetes DEV     |
| `K8S_NAMESPACE_QA`      | `nexo-qa`             | Namespace Kubernetes QA      |
| `K8S_NAMESPACE_STAGING` | `nexo-staging`        | Namespace Kubernetes STAGING |
| `K8S_NAMESPACE_PROD`    | `nexo-production`     | Namespace Kubernetes PROD    |
| `DOMAIN_DEV`            | `dev.nexo.io`         | Domínio para DEV             |
| `DOMAIN_QA`             | `qa.nexo.io`          | Domínio para QA              |
| `DOMAIN_STAGING`        | `staging.nexo.io`     | Domínio para STAGING         |
| `DOMAIN_PROD`           | `nexo.io`             | Domínio para PROD            |

---

## Environments

Configure em **Settings → Environments**:

### Criar Environment: `dev`

1. Clique em **New environment**
2. Nome: `dev`
3. Configure:
   - **Deployment branches**: `develop`
   - **No protection rules** (deploy automático)

### Criar Environment: `qa`

1. Clique em **New environment**
2. Nome: `qa`
3. Configure:
   - **Deployment branches**: `qa`
   - **No protection rules**

### Criar Environment: `staging`

1. Clique em **New environment**
2. Nome: `staging`
3. Configure:
   - **Deployment branches**: `staging`
   - **No protection rules**

### Criar Environment: `prod`

1. Clique em **New environment**
2. Nome: `prod`
3. Configure:
   - **Deployment branches**: `main`
   - ☑ **Required reviewers**: Adicione 2 pessoas
   - ☑ **Wait timer**: 5 minutes (opcional)

---

## Como Gerar Cada Secret

### DO_TOKEN (DigitalOcean API Token)

1. Acesse [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/tokens)
2. Clique em **Generate New Token**
3. Nome: `nexo-github-actions`
4. Escopo: **Full Access** (Read + Write)
5. Clique em **Generate Token**
6. **Copie imediatamente** (não será mostrado novamente)

```bash
# Formato do secret
DO_TOKEN=dop_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### KUBECONFIG (Kubernetes)

```bash
# 1. Instale o doctl
brew install doctl

# 2. Autentique
doctl auth init
# Cole seu DO_TOKEN quando solicitado

# 3. Liste clusters
doctl kubernetes cluster list

# 4. Obtenha o kubeconfig
doctl kubernetes cluster kubeconfig show nexo-cluster > /tmp/kubeconfig.yaml

# 5. Converta para base64 (SEM quebras de linha)
cat /tmp/kubeconfig.yaml | base64 | tr -d '\n'

# 6. Copie a saída e use como valor do secret
```

> **macOS**: Use `| pbcopy` no final para copiar direto para clipboard.

### ARGOCD_AUTH_TOKEN

```bash
# 1. Login no ArgoCD
argocd login argocd.nexo.io --username admin

# 2. Gere o token
argocd account generate-token --account admin --id github-actions

# 3. Copie o token gerado
```

Ou via UI:

1. Acesse ArgoCD UI
2. Settings → Accounts → admin
3. Generate New Token
4. Nome: `github-actions`
5. Copie o token

### JWT_SECRET e NEXTAUTH_SECRET

```bash
# Gere um secret seguro de 64 caracteres
openssl rand -base64 48

# Exemplo de saída:
# K7xP9mQ2nL4vB8wE3yT6uI1oA5sD0fG7hJ2kL9zX4cV6bN8mQ1wE5rT0yU3iO7pA
```

### KEYCLOAK_CLIENT_SECRET

1. Acesse o Keycloak Admin Console
2. Selecione o realm `nexo`
3. Clients → `nexo-backend`
4. Credentials → Copie o **Secret**

---

## Boas Práticas

### ✅ Faça

- Use secrets **diferentes** para cada ambiente
- Use senhas **fortes** em produção (mínimo 32 caracteres)
- **Rotacione** secrets a cada 90 dias
- **Documente** a data de criação de cada secret
- Use **Environment secrets** para isolar por ambiente

### ❌ Não Faça

- Nunca commite secrets no código
- Nunca use o mesmo secret em todos os ambientes
- Nunca compartilhe secrets via chat/email
- Nunca use secrets de produção em desenvolvimento

### Checklist de Segurança

```markdown
- [ ] Secrets de produção são diferentes de outros ambientes
- [ ] JWT_SECRET tem pelo menos 64 caracteres
- [ ] DATABASE_URL de produção tem senha forte
- [ ] Apenas pessoas autorizadas têm acesso aos secrets
- [ ] Rotação de secrets está agendada
- [ ] Environments de produção têm reviewers configurados
```

---

## Rotação de Secrets

### Quando Rotacionar

| Evento                    | Ação                       |
| ------------------------- | -------------------------- |
| Colaborador deixou o time | Rotacione todos os secrets |
| Suspeita de vazamento     | Rotacione imediatamente    |
| A cada 90 dias            | Rotação preventiva         |
| Mudança de ambiente       | Atualize o secret          |

### Como Rotacionar

1. **Gere novo secret**
2. **Atualize no GitHub**
3. **Atualize no Kubernetes** (se aplicável)
4. **Faça deploy** para propagar a mudança
5. **Verifique** se a aplicação funciona
6. **Revogue** o secret antigo

### Rotação de KUBECONFIG

```bash
# 1. Gere novo kubeconfig
doctl kubernetes cluster kubeconfig show nexo-cluster > /tmp/kubeconfig-new.yaml

# 2. Converta para base64
cat /tmp/kubeconfig-new.yaml | base64 | tr -d '\n' | pbcopy

# 3. Atualize os 4 secrets no GitHub
# KUBECONFIG_DEV, KUBECONFIG_QA, KUBECONFIG_STAGING, KUBECONFIG_PROD

# 4. Limpe arquivo temporário
rm /tmp/kubeconfig-new.yaml
```

### Rotação de ArgoCD Token

```bash
# 1. Gere novo token
argocd account generate-token --account admin --id github-actions-new

# 2. Atualize ARGOCD_AUTH_TOKEN no GitHub

# 3. Delete token antigo
argocd account delete-token --account admin --id github-actions
```

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECRETS NO GITHUB                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   REPOSITORY SECRETS (compartilhados)                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ DO_TOKEN           │ Token da API DigitalOcean                      │   │
│   │ KUBECONFIG_*       │ Kubeconfig de cada ambiente (mesmo valor)      │   │
│   │ ARGOCD_AUTH_TOKEN  │ Token do ArgoCD                                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ENVIRONMENT SECRETS (por ambiente)                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ dev:     DATABASE_URL, JWT_SECRET, KEYCLOAK_CLIENT_SECRET           │   │
│   │ qa:      DATABASE_URL, JWT_SECRET, KEYCLOAK_CLIENT_SECRET           │   │
│   │ staging: DATABASE_URL, JWT_SECRET, KEYCLOAK_CLIENT_SECRET           │   │
│   │ prod:    DATABASE_URL, JWT_SECRET, KEYCLOAK_CLIENT_SECRET           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   REPOSITORY VARIABLES (não-sensíveis)                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ REGISTRY, ARGOCD_SERVER, K8S_NAMESPACE_*, DOMAIN_*                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Próximos Passos

1. Configure a [DigitalOcean](digitalocean-setup.md)
2. Configure os [GitHub Actions](github-actions.md)
3. Entenda os [Ambientes](environments.md)
