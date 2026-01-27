# 🛠️ Guia de Desenvolvimento Diário

Workflow prático para desenvolvimento local do Nexo Platform.

## 🚀 Iniciar Desenvolvimento

```bash
# 1. Subir infraestrutura (PostgreSQL + Keycloak)
make start

# 2. Em terminais separados, inicie backend e frontend
make dev-be  # Terminal 1
make dev-fe  # Terminal 2
```

### O que acontece?

- **PostgreSQL** roda no Docker na porta 5432
- **Keycloak** roda no Docker na porta 8080
- **Backend** roda em Node.js com hot-reload na porta 3001
- **Frontend** roda em Next.js com hot-reload na porta 3000

## 📝 Workflow Git

```bash
# 1. Criar branch a partir de develop
git checkout develop && git pull
git checkout -b feature/minha-feature

# 2. Desenvolver localmente
# Faça suas alterações - o hot-reload atualiza automaticamente

# 3. Commit com conventional commits
git add .
git commit -m "feat(backend): adiciona endpoint de usuários"

# 4. Push e criar PR
git push origin feature/minha-feature
```

## 🔗 URLs de Acesso Local

| Serviço        | URL                       | Descrição         |
| -------------- | ------------------------- | ----------------- |
| Frontend       | http://localhost:3000     | Next.js App       |
| Backend API    | http://localhost:3001     | NestJS + Swagger  |
| Swagger Docs   | http://localhost:3001/api | API Documentation |
| Keycloak       | http://localhost:8080     | Admin Console     |

**Credenciais Keycloak:** `admin / admin`

## 🛠️ Comandos Úteis

```bash
# Ver status dos containers
make status

# Ver logs
make logs

# Parar todos os containers
make stop

# Limpar tudo
make clean

# Verificar dependências
make doctor
```

## 🗄️ Banco de Dados

```bash
# Criar nova migration
make db-migrate

# Gerar Prisma Client
make db-generate

# Abrir Prisma Studio (GUI para ver dados)
make db-studio

# Reset completo (⚠️ apaga dados)
make db-reset
```

## 🐳 Docker

```bash
# Build das imagens Docker
make build-fe    # Frontend
make build-be    # Backend
make build-auth  # Keycloak Theme
make build-all   # Todas as imagens
```

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verificar se PostgreSQL está rodando
make status

# Ver logs do PostgreSQL
docker logs nexo-postgres-dev

# Reiniciar infraestrutura
make stop && make start
```

### Erro de conexão com banco

```bash
# Verificar connection string
echo $DATABASE_URL

# Deve ser: postgresql://nexo:nexo_password@localhost:5432/nexo_db

# Regerar Prisma Client
make db-generate
```

### Frontend não carrega

```bash
# Verificar se backend está respondendo
curl http://localhost:3001/health

# Limpar cache do Next.js
cd apps/nexo-fe && rm -rf .next
```

### Keycloak não responde

```bash
# Ver logs do Keycloak
docker logs nexo-keycloak-dev

# Reiniciar Keycloak
docker restart nexo-keycloak-dev

# Reiniciar configuração
make keycloak-init
```

## 📊 Deploy em Produção

O deploy em produção é feito via GitHub Actions + ArgoCD:

1. Merge da feature branch para `develop` → Deploy automático em DEV
2. Merge de `develop` para `qa` → Deploy automático em QA  
3. Merge de `qa` para `staging` → Deploy manual em STAGING
4. Merge de `staging` para `main` → Deploy manual em PROD (com aprovação)

> 📖 Veja [deploy.md](deploy.md) para detalhes completos sobre CI/CD.

## 🎯 Próximos Passos

- **Arquitetura**: Entenda a estrutura do projeto em [architecture.md](architecture.md)
- **Deploy**: Configure CI/CD em [deploy.md](deploy.md)  
- **Kubernetes**: Aprenda sobre DOKS em [kubernetes.md](kubernetes.md)
- **Git Flow**: Veja branching strategy em [git-branching-strategy.md](git-branching-strategy.md)
