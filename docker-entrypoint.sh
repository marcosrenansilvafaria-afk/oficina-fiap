#!/bin/sh
set -e

echo "[entrypoint] Aguardando banco de dados..."

MAX_RETRIES=30
RETRY=0

until npx prisma migrate deploy 2>/dev/null; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "[entrypoint] Banco indisponivel apos $MAX_RETRIES tentativas. Abortando."
    exit 1
  fi
  echo "[entrypoint] Tentativa $RETRY/$MAX_RETRIES — aguardando 2s..."
  sleep 2
done

echo "[entrypoint] Migrations aplicadas. Iniciando API..."
exec node dist/main.js
