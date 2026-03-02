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

# Remove Prisma Studio and any platform-specific or DB-specific wasm/binaries we don't need
RUN rm -rf node_modules/@prisma/studio-core || true
RUN find node_modules/@prisma -type f \( -iname '*sqlite*' -o -iname '*mysql*' -o -iname '*sqlserver*' -o -iname '*cockroach*' -o -iname '*darwin*' -o -iname '*windows*' \) -delete || true

RUN rm -rf node_modules/prisma \
	node_modules/typescript \
	node_modules/react-dom || true

RUN chown -R 1000:1000 /app



FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

## Do not reinstall in runner; copy pruned production deps and built dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER 1000

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
	CMD node -e "require('http').get('http://127.0.0.1:3001/', res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/index.js"]