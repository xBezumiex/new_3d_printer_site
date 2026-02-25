FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for prisma CLI)
RUN npm ci

# Copy prisma schema before generate
COPY src/prisma ./src/prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy rest of source
COPY . .

# Copy and set entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 5000

CMD ["./entrypoint.sh"]
