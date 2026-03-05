FROM node:25-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:25-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY tsconfig.json tsup.config.ts prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# Set placeholder DATABASE_URL for Prisma client generation (no actual connection needed)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=backend"

# Install OpenSSL for Prisma client generation (Alpine version)
RUN apk add --no-cache openssl ca-certificates

# Workaround for certificate validation issue when downloading Prisma binaries
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 npm run db:generate
RUN npm run build

FROM node:25-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001 \
    SCHEMA_NAME=backend \
    CORS_ORIGIN=http://localhost:3000 \
    JWT_SECRET=change-me-in-production

# Install OpenSSL and CA certificates for Prisma (Alpine version)
RUN apk add --no-cache openssl ca-certificates

COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
COPY package.json package-lock.json ./

# Install ONLY production dependencies - skip devDependencies entirely
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Optional: Remove unnecessary files
RUN rm -rf /root/.npm /tmp/*

EXPOSE 3001

CMD ["node", "dist/index.js"]