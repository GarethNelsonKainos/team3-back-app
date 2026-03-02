# Multi-stage Dockerfile for Node + TypeScript app

# Builder stage - installs dev deps and builds the TypeScript output
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development

# system deps for native modules/builds
RUN apk add --no-cache python3 make g++ libc6-compat

# Install dependencies (use package-lock if present)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . ./
RUN npm run build

# Runtime stage - lean production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Expose configured port
ENV PORT=3001
EXPOSE 3001

# Run the compiled app
CMD ["node", "dist/index.js"]
