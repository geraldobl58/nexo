# GitHub Secrets Configuration

Este arquivo lista todos os secrets necessários para os workflows do GitHub Actions.

## Como configurar secrets

1. Acesse seu repositório no GitHub
2. Navegue para **Settings > Secrets and variables > Actions**
3. Clique em **New repository secret**
4. Adicione cada secret abaixo

---

## 🔐 Secrets Obrigatórios

### Harbor Registry (Docker Images)

```
Name: HARBOR_USERNAME
Value: admin

Name: HARBOR_PASSWORD
Value: Harbor12345
```

### ArgoCD (GitOps Deployment)

```
Name: ARGOCD_AUTH_TOKEN
Value: <token obtido do ArgoCD>
```

**Como obter o token do ArgoCD:**

```bash
# Login no ArgoCD
argocd login argocd.nexo.local --insecure --username admin

# Gerar token
argocd account generate-token --account github-actions
```

### GitHub (Para push de commits)

```
Name: GITHUB_TOKEN
Value: ghp_YOUR_PERSONAL_ACCESS_TOKEN_HERE
```

> **⚠️ IMPORTANTE:** Gere um novo token em:
> https://github.com/settings/tokens/new
>
> Permissões necessárias:
> - `repo` (full control)
> - `write:packages`
> - `workflow` (se usar GitHub Actions)
>
> **NÃO commite o token real no Git!**

---

## 🔐 Secrets Opcionais

### Database (Production)

```
Name: DATABASE_URL
Value: postgresql://user:password@prod-db.example.com:5432/nexo

Name: DATABASE_URL_DIRECT
Value: postgresql://user:password@prod-db.example.com:5432/nexo
```

### Application Secrets

```
Name: JWT_SECRET
Value: <string aleatória de 32+ caracteres>

Name: JWT_REFRESH_SECRET
Value: <string aleatória de 32+ caracteres>

Name: ENCRYPTION_KEY
Value: <string aleatória de 32+ caracteres>
```

### Keycloak / OpenID

```
Name: KEYCLOAK_CLIENT_SECRET
Value: <obtido do Keycloak admin console>
```

### Email / SMTP

```
Name: SMTP_HOST
Value: smtp.gmail.com

Name: SMTP_PORT
Value: 587

Name: SMTP_USER
Value: noreply@example.com

Name: SMTP_PASSWORD
Value: <senha do SMTP>
```

### AWS / S3 (se usar storage externo)

```
Name: AWS_ACCESS_KEY_ID
Value: <seu access key>

Name: AWS_SECRET_ACCESS_KEY
Value: <seu secret key>

Name: AWS_S3_BUCKET
Value: nexo-files-prod

Name: AWS_REGION
Value: us-east-1
```

### Slack (Notificações)

```
Name: SLACK_WEBHOOK
Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Sentry (Error Monitoring)

```
Name: SENTRY_DSN
Value: https://public@sentry.io/project-id

Name: SENTRY_AUTH_TOKEN
Value: <token do Sentry>
```

---

## 🔐 Secrets por Ambiente (Optional)

Se você usa diferentes valores por ambiente, crie secrets específicos:

### Development

```
DATABASE_URL_DEV
JWT_SECRET_DEV
```

### QA

```
DATABASE_URL_QA
JWT_SECRET_QA
```

### Staging

```
DATABASE_URL_STAGING
JWT_SECRET_STAGING
```

### Production

```
DATABASE_URL_PROD
JWT_SECRET_PROD
```

---

## 🚀 Validar Configuração

Após adicionar todos os secrets, valide executando o workflow de CI:

```bash
# Push para trigger do workflow
git add .
git commit -m "test: validate GitHub Actions setup"
git push origin develop
```

Verifique em: **Actions** tab no GitHub

---

## 🔒 Segurança

- ⚠️ **NUNCA** commite secrets no código
- ✅ Use secrets do GitHub para valores sensíveis
- ✅ Rotacione secrets regularmente
- ✅ Use diferentes secrets para cada ambiente
- ✅ Limite permissões do GitHub Actions ao mínimo necessário

---

## 📖 Referências

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [ArgoCD Authentication](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_account_generate-token/)
- [Harbor Registry Documentation](https://goharbor.io/docs/latest/)
