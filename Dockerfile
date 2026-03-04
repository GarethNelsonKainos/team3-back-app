# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS prod-deps
RUN npm prune --omit=dev

FROM deps AS build
WORKDIR /app

COPY tsconfig.json tsup.config.ts ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

USER node

EXPOSE 3001
CMD ["node", "dist/index.js"]