# 🔐 Keycloak - Custom Centauro UI Theme

Tema de login totalmente customizado para Keycloak 26+, com design moderno inspirado no login da Centauro, usando **TailwindCSS** e **Tailwind UI**.

## ✨ Características

- ✅ **Zero dependências do Keycloak** (sem `keycloak.css`, PatternFly ou macros padrão)
- ✅ **TailwindCSS puro** com design system Tailwind UI
- ✅ **Login flow em 2 etapas** (Identificação → Senha)
- ✅ **Input mask visual** para CPF, CNPJ e e-mail
- ✅ **Loading state** no botão de submit
- ✅ **Hot reload** ativado para desenvolvimento ágil
- ✅ **Responsivo** (mobile first)
- ✅ **Acessível** (WCAG 2.1)

---

## 📂 Estrutura do Tema

```
apps/keycloak/
├── themes/
│   └── custom-nexo-ui/
│       └── login/
│           ├── login.ftl              # Template principal
│           ├── theme.properties       # Configuração do tema
│           └── resources/
│               ├── css/
│               │   └── tailwind.css   # CSS gerado pelo Tailwind
│               └── js/
│                   └── login-flow.js  # Lógica de etapas e máscaras
├── tailwind.config.js                 # Configuração do Tailwind
├── input.css                          # Entrada do Tailwind
└── package.json                       # Dependências do Tailwind
```

---

## 🚀 Como Rodar

### 1️⃣ Instalar dependências do Tailwind

```bash
cd apps/keycloak
npm install
```

### 2️⃣ Gerar CSS do Tailwind

#### Build único:

```bash
npm run build:css
```

#### Watch mode (recompila automaticamente):

```bash
npm run watch:css
```

> **💡 Dica:** Mantenha o watch rodando durante o desenvolvimento para refletir mudanças de estilo instantaneamente.

### 3️⃣ Subir o Keycloak com Docker

```bash
docker-compose up -d
```

Aguarde o Keycloak iniciar completamente (cerca de 30-60 segundos).

### 4️⃣ Ativar o tema no Admin Console

1. Acesse: http://localhost:8080
2. Faça login no **Administration Console**
   - **Usuário:** `admin`
   - **Senha:** `admin`
3. No menu lateral, vá em **Realm Settings**
4. Aba **Themes**
5. Em **Login theme**, selecione: `custom-nexo-ui`
6. Clique em **Save**

### 5️⃣ Testar o tema

1. Faça logout do Admin Console
2. Vá para: http://localhost:8080/realms/master/account
3. Será redirecionado para a tela de login customizada ✨

---

## 🔥 Hot Reload

O hot reload está **ativo** e funciona assim:

### Para alterações em `.ftl` ou `.js`:

- Apenas **recarregue a página** (F5 ou Cmd+R)
- O Keycloak detecta automaticamente

### Para alterações em CSS:

1. O Tailwind está em **watch mode** (`npm run watch:css`)
2. Qualquer mudança em `.ftl` recompila o CSS
3. **Recarregue a página** para ver as mudanças

### Configurações de cache desabilitadas:

- `KC_SPI_THEME_STATIC_MAX_AGE=-1` (desabilita cache de assets)
- `KC_SPI_THEME_CACHE_THEMES=false` (desabilita cache de temas)
- `KC_SPI_THEME_CACHE_TEMPLATES=false` (desabilita cache de templates)

---

## 🎨 Customização

### Cores

Edite [tailwind.config.js](tailwind.config.js):

```js
colors: {
  primary: {
    500: '#0ea5e9',  // Cor principal
    600: '#0284c7',  // Hover
    // ...
  },
}
```

### Tipografia

Altere a fonte em [tailwind.config.js](tailwind.config.js):

```js
fontFamily: {
  sans: ['Inter', 'sans-serif'],
}
```

### Logo

Substitua o SVG no [login.ftl](themes/custom-nexo-ui/login/login.ftl) (linha ~30):

```ftl
<svg class="w-8 h-8 text-white" ...>
  <!-- Seu logo aqui -->
</svg>
```

Ou use uma imagem:

```ftl
<img src="${url.resourcesPath}/img/logo.png" alt="Logo" class="h-12" />
```

---

## 🧩 Fluxo de Login (2 Etapas)

### Etapa 1: Identificação

- Campo único: **CPF, CNPJ ou e-mail**
- Máscara aplicada automaticamente
- Botão: **"Continuar"**

### Etapa 2: Senha

- Mostra o identificador informado
- Campo de senha com toggle (mostrar/ocultar)
- Botão: **"Entrar"** (com loading state)
- Link: **"Alterar"** (volta para etapa 1)

**Importante:**

- As etapas são controladas **no frontend** (JavaScript)
- **Não recarrega a página** entre etapas
- Submete para o Keycloak apenas na **etapa 2**

---

## 🛠️ Tecnologias

| Tecnologia         | Versão | Uso                        |
| ------------------ | ------ | -------------------------- |
| Keycloak           | 26+    | Identity Provider          |
| FreeMarker (FTL)   | -      | Template engine            |
| TailwindCSS        | 3.4+   | Framework CSS              |
| @tailwindcss/forms | 0.5+   | Estilização de formulários |
| JavaScript         | ES6+   | Lógica de fluxo e máscaras |

---

## 📋 Comandos Úteis

```bash
# Instalar dependências
npm install

# Gerar CSS (build único)
npm run build:css

# Watch CSS (recompila automaticamente)
npm run watch:css

# Subir Keycloak
docker-compose up -d

# Parar Keycloak
docker-compose down

# Ver logs do Keycloak
docker-compose logs -f keycloak

# Reconstruir container (se necessário)
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Tema não aparece na lista

1. Verifique se a estrutura de pastas está correta
2. Reinicie o Keycloak: `docker-compose restart keycloak`
3. Veja os logs: `docker-compose logs keycloak`

### Mudanças não refletem

1. Verifique se o watch do Tailwind está rodando
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Verifique se o volume está montado: `docker-compose config`

### CSS não carrega

1. Verifique se o arquivo foi gerado: `apps/keycloak/themes/custom-nexo-ui/login/resources/css/tailwind.css`
2. Rode: `npm run build:css`
3. Verifique o console do navegador para erros

### Máscara não funciona

1. Verifique se o JavaScript está carregando: veja o console
2. Confirme que o arquivo está em: `resources/js/login-flow.js`
3. Teste com F12 (DevTools) → Console

---

## 📄 Licença

Este tema é parte do projeto **Nexo** e segue as mesmas diretrizes de licenciamento.

---

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/minha-feature`
2. Faça suas alterações
3. Commit: `git commit -m 'feat: adiciona nova feature'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📚 Recursos

- [Keycloak Documentation](https://www.keycloak.org/docs/latest/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/components)
- [FreeMarker Manual](https://freemarker.apache.org/docs/)

---

**Desenvolvido com ❤️ para o projeto Nexo**
