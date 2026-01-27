# Dockerfile para Keycloak Theme
# Copia os temas customizados para a imagem do Keycloak

FROM quay.io/keycloak/keycloak:23.0 as builder

# Copiar temas customizados
COPY themes/ /opt/keycloak/themes/

# Build otimizado
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:23.0

COPY --from=builder /opt/keycloak/ /opt/keycloak/

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
