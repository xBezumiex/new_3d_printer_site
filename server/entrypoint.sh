#!/bin/sh

echo "==> Generating Prisma Client..."
npx prisma generate

echo "==> Running Prisma migrations..."
npx prisma migrate deploy || echo "Warning: migration issue, continuing..."

echo "==> Starting server..."
exec node src/server.js
