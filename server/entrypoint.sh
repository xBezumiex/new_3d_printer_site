#!/bin/sh

echo "==> Generating Prisma Client..."
npx prisma generate

echo "==> Pushing schema to database..."
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || echo "Warning: db push issue, continuing..."

echo "==> Starting server..."
exec node src/server.js
