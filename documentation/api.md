# 📡 API

Documentação da API REST do Nexo Platform.

## Base URL

| Ambiente    | URL                          |
| ----------- | ---------------------------- |
| Local       | http://localhost:3001        |
| Development | https://api-dev.nexo.com     |
| Staging     | https://api-staging.nexo.com |
| Production  | https://api.nexo.com         |

## Autenticação

A API utiliza **Bearer Token** (JWT) para autenticação.

### Obter Token

```bash
# Via Keycloak (OAuth 2.0)
curl -X POST http://localhost:8080/realms/nexo/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=nexo-fe" \
  -d "username=user@example.com" \
  -d "password=password"
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "token_type": "Bearer"
}
```

### Usar Token

```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI..."
```

## Swagger / OpenAPI

Acesse a documentação interativa:

- **Local:** http://localhost:3001/api
- **JSON:** http://localhost:3001/api-json

## Endpoints

### Health Check

```http
GET /health
```

**Response:** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2024-01-23T10:30:00.000Z"
}
```

---

### Users

#### Listar Usuários

```http
GET /api/users
Authorization: Bearer {token}
```

**Query Parameters:**

| Param  | Type   | Description                    |
| ------ | ------ | ------------------------------ |
| page   | number | Página (default: 1)            |
| limit  | number | Itens por página (default: 10) |
| search | string | Busca por nome/email           |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-23T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Obter Usuário

```http
GET /api/users/:id
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2024-01-23T10:30:00.000Z",
  "updatedAt": "2024-01-23T10:30:00.000Z"
}
```

#### Criar Usuário

```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecurePassword123!"
}
```

**Response:** `201 Created`

#### Atualizar Usuário

```http
PATCH /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Updated Name"
}
```

**Response:** `200 OK`

#### Deletar Usuário

```http
DELETE /api/users/:id
Authorization: Bearer {token}
```

**Response:** `204 No Content`

---

### Usuário Atual

#### Obter Perfil

```http
GET /api/users/me
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER"
}
```

#### Atualizar Perfil

```http
PATCH /api/users/me
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "name": "New Name"
}
```

---

## Códigos de Erro

| Código | Descrição                               |
| ------ | --------------------------------------- |
| 400    | Bad Request - Dados inválidos           |
| 401    | Unauthorized - Token inválido/ausente   |
| 403    | Forbidden - Sem permissão               |
| 404    | Not Found - Recurso não encontrado      |
| 409    | Conflict - Recurso já existe            |
| 422    | Unprocessable Entity - Validação falhou |
| 500    | Internal Server Error                   |

### Formato de Erro

```json
{
  "statusCode": 400,
  "message": ["email must be a valid email"],
  "error": "Bad Request"
}
```

## Rate Limiting

| Endpoint  | Limite      |
| --------- | ----------- |
| `/api/*`  | 100 req/min |
| `/auth/*` | 10 req/min  |

**Headers de resposta:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706010060
```

## Paginação

Todos os endpoints de listagem suportam paginação:

```http
GET /api/users?page=2&limit=20
```

**Response:**

```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Filtros e Ordenação

```http
GET /api/users?search=john&sortBy=createdAt&order=desc
```

| Param  | Type     | Description          |
| ------ | -------- | -------------------- |
| search | string   | Busca textual        |
| sortBy | string   | Campo para ordenar   |
| order  | asc/desc | Direção da ordenação |

## Exemplos com cURL

### Login e obter dados

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8080/realms/nexo/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=nexo-fe" \
  -d "username=admin@nexo.com" \
  -d "password=admin123" | jq -r '.access_token')

# 2. Obter perfil
curl -s http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Listar usuários
curl -s "http://localhost:3001/api/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## SDKs e Clients

### TypeScript/JavaScript

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uso
const users = await api.get("/users");
```

## Próximos Passos

- 🚀 [Deploy](deploy.md) - CI/CD e produção
- ☸️ [Kubernetes](kubernetes.md) - Deploy em K8s
