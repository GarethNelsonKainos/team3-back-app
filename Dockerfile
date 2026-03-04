# Multi-stage build for the backend

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Remove devDependencies and keep only production deps to copy into runner
RUN npm prune --production

# Remove platform-specific or DB-specific wasm/binaries we don't need
RUN find node_modules/@prisma -type f \( -iname '*sqlite*' -o -iname '*mysql*' -o -iname '*sqlserver*' -o -iname '*cockroach*' -o -iname '*darwin*' -o -iname '*windows*' \) -delete || true

RUN rm -rf node_modules/typescript \
	node_modules/react-dom || true

# Remove source maps, TS declaration files and TypeScript sources to reduce size
RUN find node_modules -type f -name '*.map' -delete || true
RUN find node_modules -type f -name '*.d.ts' -delete || true
RUN find node_modules -type f -name '*.ts' -delete || true

# Remove common test/docs/examples folders from node_modules
RUN find node_modules -type d \( -iname 'test' -o -iname 'tests' -o -iname '__tests__' -o -iname 'docs' -o -iname 'example' -o -iname 'examples' \) -prune -exec rm -rf {} + || true

# Extra prune inside @prisma to drop source maps
RUN find node_modules/@prisma -type f -name '*.map' -delete || true

RUN chown -R 1000:1000 /app

FROM node:20-slim AS runner
WORKDIR /app

# Prisma CLI needs openssl + CA certs for migrate deploy
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Entrypoint: run migrations then start the app
# NODE_TLS_REJECT_UNAUTHORIZED=0 only for migrate (Prisma CDN cert issue in Docker)
RUN printf '#!/bin/sh\nset -e\nNODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma migrate deploy 2>&1\nexec node dist/index.js\n' > /app/entrypoint.sh \
  && chmod +x /app/entrypoint.sh

USER 1000

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
	CMD node -e "require('http').get('http://127.0.0.1:3001/', res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["/app/entrypoint.sh"]