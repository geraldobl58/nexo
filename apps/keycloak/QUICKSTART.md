# 🚀 Quick Start - Custom Centauro UI Theme

## Setup Rápido (5 minutos)

### 1. Instalar dependências

```bash
cd apps/keycloak
npm install
```

### 2. Gerar CSS do Tailwind

```bash
npm run build:css
```

### 3. Subir Keycloak

```bash
cd ../..  # volta para raiz
docker-compose up -d
```

### 4. Ativar tema

1. Acesse: http://localhost:8080
2. Login: `admin` / `admin`
3. **Realm Settings** → **Themes** → **Login theme**: `custom-nexo-ui`
4. Save

### 5. Testar

- Logout do Admin
- Vá para: http://localhost:8080/realms/master/account
- ✨ Enjoy!

---

## 🔧 Desenvolvimento

### Watch mode (recompila CSS automaticamente)

```bash
cd apps/keycloak
npm run watch:css
```

### Estrutura de arquivos importantes

```
apps/keycloak/
├── themes/custom-nexo-ui/login/
│   ├── login.ftl                    # ← Template principal
│   ├── login-reset-password.ftl     # ← Recuperação de senha
│   ├── theme.properties             # ← Config do tema
│   └── resources/
│       ├── css/tailwind.css         # ← CSS gerado (não editar)
│       └── js/login-flow.js         # ← Lógica de etapas
├── tailwind.config.js               # ← Cores, fontes, etc
├── input.css                        # ← Entrada do Tailwind
└── package.json
```

### Hot Reload ativo

- Altere `.ftl`, `.js` → recarregue (F5)
- Altere CSS → watch recompila → recarregue (F5)

---

## 🎨 Customização Rápida

### Mudar cor principal

Edite `tailwind.config.js`:

```js
colors: {
  primary: {
    500: '#sua-cor',
    // ...
  }
}
```

### Mudar logo

Edite `login.ftl` (linha ~30) e substitua o SVG

### Mudar fonte

Edite `tailwind.config.js`:

```js
fontFamily: {
  sans: ["Sua Fonte", "sans-serif"];
}
```

---

## 📋 Comandos úteis

```bash
# Build CSS
npm run build:css

# Watch CSS
npm run watch:css

# Subir Keycloak
docker-compose up -d

# Ver logs
docker-compose logs -f keycloak

# Parar Keycloak
docker-compose down
```

---

## ❓ Problemas?

### Tema não aparece?

```bash
docker-compose restart keycloak
```

### CSS não carrega?

```bash
cd apps/keycloak
npm run build:css
```

### Mudanças não refletem?

- Limpe cache do navegador (Ctrl+Shift+R)
- Verifique se watch está rodando

---

Veja o [README.md](README.md) completo para mais detalhes!
