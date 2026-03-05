# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl ca-certificates

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY tsconfig.json tsup.config.ts prisma.config.ts ./
COPY prisma ./prisma
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 DATABASE_URL="postgresql://tom@host.docker.internal:5432/kainos?schema=backend" npx prisma generate
COPY src ./src
RUN npm run build

# Keep only production dependencies
RUN npm prune --omit=dev && npm cache clean --force

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl ca-certificates

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
