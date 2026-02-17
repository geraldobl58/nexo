#!/bin/bash
set -e

# Create additional databases for the Nexo platform
# The default database (nexo_db) is created by POSTGRES_DB env var
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE nexo_keycloak;
    GRANT ALL PRIVILEGES ON DATABASE nexo_keycloak TO $POSTGRES_USER;
    CREATE DATABASE nexo_app;
    GRANT ALL PRIVILEGES ON DATABASE nexo_app TO $POSTGRES_USER;
EOSQL
