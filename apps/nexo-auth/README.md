# Nexo Auth — Keycloak Custom Theme

Tema customizado para o Keycloak 26.x usado na autenticação da plataforma Nexo.

## Stack

| Tecnologia   | Versão |
| ------------ | ------ |
| Keycloak     | 26.x   |
| Tailwind CSS | 3.4    |
| FreeMarker   | —      |

## Estrutura

```
nexo-auth/
├── Dockerfile           # Build do tema dentro da imagem Keycloak
├── input.css            # Entrada Tailwind CSS
├── tailwind.config.js   # Configuração do Tailwind
├── package.json         # Scripts de build
└── themes/
    └── nexo/
        ├── login/           # Telas de login customizadas
        │   ├── login.ftl              # Login principal
        │   ├── register.ftl           # Registro
        │   ├── login-reset-password.ftl
        │   ├── login-update-password.ftl
        │   ├── login-otp.ftl          # MFA/OTP
        │   ├── template.ftl           # Layout base
        │   ├── error.ftl / info.ftl / terms.ftl
        │   ├── theme.properties       # Config do tema
        │   ├── messages/              # i18n (pt_BR, en)
        │   └── resources/
        │       ├── css/tailwind.css   # CSS compilado
        │       └── js/               # Scripts auxiliares
        └── email/           # Templates de email
            ├── html/        # email-verification, password-reset
            └── text/        # Versão texto
```

## Desenvolvimento

### Build CSS

```bash
cd apps/nexo-auth
npm install
npm run build:css       # Build único
npm run watch:css       # Watch mode
```

### Testar Localmente

```bash
cd local
make heal-dev           # Garante que nexo-auth está rodando
make logs-auth          # Ver logs do Keycloak
```

Acesse: http://develop.auth.nexo.local

### Customizar

1. Edite os templates `.ftl` em `themes/nexo/login/`
2. `template.ftl` é o layout base — todos os outros herdam dele
3. Use classes Tailwind nos templates
4. Execute `npm run build:css` após alterar classes
5. Rebuild: `cd local && make build-auth`

### i18n

Mensagens em `themes/nexo/login/messages/`:

- `messages_pt_BR.properties` — Português
- `messages_en.properties` — Inglês

## Deploy

O Dockerfile copia o tema para dentro da imagem Keycloak:

```dockerfile
FROM quay.io/keycloak/keycloak:26.x
COPY themes/nexo /opt/keycloak/themes/nexo
```

ArgoCD detecta alterações na imagem e faz deploy automaticamente.

## Troubleshooting

| Problema                     | Solução                                          |
| ---------------------------- | ------------------------------------------------ |
| Tema não aparece no Keycloak | Verifique `theme.properties` e rebuild da imagem |
| CSS não aplicado             | `npm run build:css` e rebuild                    |
| Pod em CrashLoopBackOff      | `cd local && make fix-auth-dev`                  |
| Erro de conexão PostgreSQL   | `cd local && make fix-auth-secrets`              |
