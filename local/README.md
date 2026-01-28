# 🏠 Nexo Platform - Ambiente Local K3D

Ambiente de desenvolvimento local que **espelha exatamente a produção** com **GitOps automatizado**.

## 📋 O que está incluído

| Componente               | Descrição                         | URL / Porta Local      |
| ------------------------ | --------------------------------- | ---------------------- |
| K3D Cluster              | Kubernetes local (3 nodes)        | -                      |
| ArgoCD                   | GitOps CD                         | http://localhost:30080 |
| **ArgoCD Image Updater** | Atualização automática de imagens | -                      |
| Prometheus               | Métricas                          | http://localhost:30090 |
| Grafana                  | Dashboards                        | http://localhost:30030 |
| Alertmanager             | Alertas                           | http://localhost:30093 |
| **nexo-fe**              | Frontend Next.js                  | http://nexo.local      |
| **nexo-be**              | Backend NestJS                    | http://api.nexo.local  |
| **nexo-auth**            | Keycloak                          | http://auth.nexo.local |

## 🌐 URLs de Acesso

```
http://nexo.local/           # Frontend
http://api.nexo.local/       # Backend API
http://api.nexo.local/health # Health Check
http://auth.nexo.local/      # Keycloak Admin
```

> **Nota:** Adicione no `/etc/hosts`:
>
> ```
> 127.0.0.1 nexo.local api.nexo.local auth.nexo.local
> ```

## 🐳 DockerHub

As imagens são sempre puxadas do **DockerHub** (registry público).

### Repositórios

- `docker.io/geraldobl58/nexo-be` - Backend NestJS
- `docker.io/geraldobl58/nexo-fe` - Frontend Next.js
- `quay.io/keycloak/keycloak` - Keycloak (imagem oficial)

## 🔄 Fluxo GitOps Automatizado

### 🎯 Como funciona

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUXO GITOPS AUTOMATIZADO                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. VOCÊ                2. GITHUB               3. K3D LOCAL                │
│                                                                             │
│  Código → Commit → Push → Actions Build → DockerHub → Image Updater → Sync │
│                                                                             │
│  [VS Code]           [CI/CD auto]           [ArgoCD detecta e deploya]      │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Etapa       | O que acontece                    | Automático?                 |
| ----------- | --------------------------------- | --------------------------- |
| 1. Código   | Você edita arquivos               | 👨‍💻 Manual                   |
| 2. Commit   | `git commit`                      | 👨‍💻 Manual                   |
| 3. Push     | `git push`                        | 👨‍💻 Manual                   |
| 4. CI/CD    | GitHub Actions builda imagem      | ✅ Automático               |
| 5. Registry | Push para DockerHub               | ✅ Automático               |
| 6. Detecção | Image Updater detecta nova imagem | ✅ Automático (a cada 2min) |
| 7. Deploy   | ArgoCD sincroniza o cluster       | ✅ Automático               |

### 🚀 Desenvolvimento Diário

```bash
# Só isso! O resto é automático 🎉
git add .
git commit -m "feat: minha feature"
git push origin develop

# Em ~3-5 minutos sua alteração estará rodando no K3D local
```

### 📦 Monitoramento Automático

| Serviço   | Imagem                         | Estratégia |
| --------- | ------------------------------ | ---------- |
| nexo-be   | docker.io/geraldobl58/nexo-be  | latest     |
| nexo-fe   | docker.io/geraldobl58/nexo-fe  | latest     |
| nexo-auth | quay.io/keycloak/keycloak:23.0 | Fixo       |

## 🛠️ Comandos

### Setup Inicial

```bash
cd local/
make doctor   # Verificar dependências
make setup    # Setup completo (inclui Image Updater)
```

### Verificar Status

```bash
make status           # Ver status geral
make pods             # Listar pods
make image-updater    # Ver logs do Image Updater
```

### Build Manual (se necessário)

```bash
# Normalmente NÃO precisa! O CI/CD faz isso.
# Use apenas para testes locais rápidos:
make docker-login   # Login DockerHub (uma vez)
make build-be       # Build backend
make build-fe       # Build frontend
make build-all      # Build todos
```

### Outros

```bash
make logs-be          # Logs backend
make logs-fe          # Logs frontend
make logs-auth        # Logs Keycloak
make argocd-password  # Senha ArgoCD
make grafana-password # Senha Grafana
make sync-all         # Força sync ArgoCD
make destroy          # Destruir ambiente
```

## 📊 Observabilidade

### Grafana Dashboards

- **Nexo Backend** - Métricas HTTP, latência
- **Nexo Frontend** - Performance, requests
- **Nexo Auth** - Keycloak metrics

Acesse: http://localhost:30030

### Verificar Image Updater

```bash
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater -f
```

## 🔐 Credenciais Padrão

| Serviço  | Usuário | Senha                  |
| -------- | ------- | ---------------------- |
| ArgoCD   | admin   | `make argocd-password` |
| Grafana  | admin   | admin123               |
| Keycloak | admin   | admin                  |

## � Docker Hub Authentication

Para evitar rate limits do Docker Hub (erro 429), é necessário configurar credenciais:

### Criar Secret de Credenciais

```bash
# Criar secret no namespace nexo-local
kubectl create secret docker-registry dockerhub-creds \
  --docker-server=docker.io \
  --docker-username=SEU_USUARIO \
  --docker-password=SEU_TOKEN \
  -n nexo-local
```

> **Nota:** Use um [Access Token](https://hub.docker.com/settings/security) ao invés da senha.

### Configurar nas Aplicações ArgoCD

```bash
# Adicionar imagePullSecrets às aplicações
kubectl patch application nexo-be-local -n argocd --type='json' \
  -p='[{"op":"add","path":"/spec/source/helm/parameters/-","value":{"name":"imagePullSecrets[0].name","value":"dockerhub-creds"}}]'

kubectl patch application nexo-fe-local -n argocd --type='json' \
  -p='[{"op":"add","path":"/spec/source/helm/parameters/-","value":{"name":"imagePullSecrets[0].name","value":"dockerhub-creds"}}]'

# Sincronizar
argocd app sync nexo-be-local nexo-fe-local
```

### Verificar Configuração

```bash
# Ver se os deployments têm imagePullSecrets
kubectl get deployment nexo-be-local nexo-fe-local -n nexo-local \
  -o jsonpath='{range .items[*]}{.metadata.name}: {.spec.template.spec.imagePullSecrets}{"\n"}{end}'
```

## 🎨 Keycloak Tema Customizado

O Keycloak usa o tema customizado **nexo** para login e email.

### Estrutura do Tema

```
apps/nexo-auth/themes/nexo/
├── login/
│   ├── theme.properties
│   ├── resources/css/tailwind.css
│   └── ...
└── email/
    └── theme.properties
```

### Configuração do theme.properties (Keycloak 26+)

```properties
# login/theme.properties
parent=keycloak
styles=css/tailwind.css
locales=pt-BR,en
defaultLocale=pt-BR
cacheThemes=false
```

> **Importante:** Para Keycloak 26+, use `parent=keycloak` ao invés de `parent=base` com `import=common/keycloak`.

### Habilitar no Keycloak Admin

1. Acesse http://auth.nexo.local
2. Login: admin / admin
3. Realm Settings → Themes
4. Selecione "nexo" em Login Theme

## 🔧 Troubleshooting

### Image Updater não está atualizando

```bash
# 1. Verificar logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater --tail=50

# 2. Reiniciar se necessário
kubectl rollout restart deployment argocd-image-updater -n argocd
```

### Pod não inicia com nova imagem

```bash
# Forçar redeployment
kubectl rollout restart deployment nexo-be-local -n nexo-local
```

### Erro 429 - Docker Hub Rate Limit

```bash
# Verificar se o secret existe
kubectl get secret dockerhub-creds -n nexo-local

# Verificar se o deployment tem imagePullSecrets
kubectl get deployment nexo-be-local -n nexo-local -o jsonpath='{.spec.template.spec.imagePullSecrets}'

# Se não tiver, adicionar via ArgoCD (ver seção Docker Hub Authentication)
```

### Tema Keycloak não aparece

```bash
# Verificar se o tema está no container
kubectl exec -n nexo-local deployment/nexo-auth-local -- ls /opt/keycloak/themes/nexo

# Reiniciar Keycloak para recarregar temas
kubectl rollout restart deployment nexo-auth-local -n nexo-local
```

## 📖 Documentação

Veja [/documentation/local](../documentation/local/README.md).
