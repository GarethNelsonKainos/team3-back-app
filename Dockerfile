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

# Ensure files are owned by a deterministic numeric UID so runner can switch to it
RUN chown -R 1000:1000 /app


FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

## Do not reinstall in runner; copy pruned production deps and built dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create a non-root user and ensure runtime files are owned by it
## Files owned by numeric UID 1000 so we can switch to non-root in distroless
USER 1000

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
	CMD node -e "require('http').get('http://127.0.0.1:3001/', res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/index.js"]