#!/bin/sh
set -e

echo "==> Waiting for database..."
until npx prisma db execute --stdin <<'EOF'
SELECT 1;
EOF
do
  echo "    Postgres is unavailable - sleeping 2s"
  sleep 2
done

echo "==> Running Prisma migrations..."
npx prisma migrate deploy

echo "==> Starting server..."
exec node src/server.js
