# 🚀 Quick Start

Guia para começar a desenvolver no Nexo Platform em 5 minutos.

## Pré-requisitos

| Ferramenta     | Versão Mínima | Instalação                         |
| -------------- | ------------- | ---------------------------------- |
| Node.js        | 20.x          | [nodejs.org](https://nodejs.org)   |
| pnpm           | 8.x           | `npm install -g pnpm`              |
| Docker Desktop | 4.x           | [docker.com](https://docker.com)   |
| Git            | 2.x           | [git-scm.com](https://git-scm.com) |

## 1. Clone o Repositório

```bash
git clone https://github.com/seu-org/nexo.git
cd nexo
```

## 2. Verifique as Dependências

```bash
make doctor
```

Você deve ver algo como:

```
🩺 Verificando dependências...

Obrigatórios:
   Node.js:        v20.x.x
   pnpm:           8.x.x
   Docker:         24.x.x
   Docker Compose: v2.x.x
```

## 3. Execute o Setup

```bash
make setup
```

Isso vai:

- Instalar dependências do projeto (pnpm install)
- Iniciar containers Docker (PostgreSQL, Keycloak)
- Gerar o Prisma Client

> 💡 **Nota**: Este é o ambiente de desenvolvimento local. PostgreSQL e Keycloak rodam no Docker Compose.

## 4. Inicie o Desenvolvimento

Abra **dois terminais**:

**Terminal 1 - Backend:**

```bash
make dev-be
```

**Terminal 2 - Frontend:**

```bash
make dev-fe
```

## 5. Acesse a Aplicação

| Serviço        | URL                       | Credenciais   |
| -------------- | ------------------------- | ------------- |
| Frontend       | http://localhost:3000     | -             |
| Backend API    | http://localhost:3333     | -             |
| Swagger        | http://localhost:3001/api | -             |
| Keycloak Admin | http://localhost:8080     | admin / admin |

> 💡 **Produção**: Os serviços em produção são acessados via URLs do DigitalOcean Kubernetes. Veja [deploy.md](deploy.md).

---

## Comandos do Dia a Dia

```bash
# Iniciar infraestrutura
make start

# Parar tudo
make stop

# Ver status
make status

# Ver logs de um serviço
make logs SERVICE=keycloak

# Rodar migrations
make db-migrate

```

---

## Estrutura de Branches

```
feature/* → develop → qa → staging → main (production)
```

> 📖 Veja [Git Branching Strategy](git-branching-strategy.md) para configuração completa do GitHub.

### Fluxo de Trabalho

1. Crie uma branch a partir de `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/minha-feature
   ```

2. Desenvolva e faça commits
3. Abra um PR para `develop`
4. Após aprovação, promova: `develop → qa → staging → main`

---

## Problemas Comuns

### Container não inicia

```bash
# Ver logs do container
docker logs nexo-postgres-dev

# Reiniciar containers
make stop && make start
```

### Porta já em uso

```bash
# Verificar o que está usando a porta
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Keycloak demora para iniciar

É normal! O Keycloak leva ~60-90 segundos para ficar pronto.

Verifique o status:

```bash
docker logs -f nexo-keycloak-dev
```

---

## Próximos Passos

- 📖 [Arquitetura](architecture.md) - Entenda a estrutura do projeto
- 💻 [Desenvolvimento](development.md) - Fluxo de trabalho detalhado
- 📡 [API](api.md) - Documentação da API
