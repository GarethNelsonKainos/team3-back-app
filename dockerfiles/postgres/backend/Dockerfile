FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json tsup.config.ts ./
COPY src ./src

# Generate Prisma client (dummy DATABASE_URL needed at codegen time only) and build the app
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate && npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema, migrations, config, and seed for runtime migrate + seed
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy full src (needed by seed.ts which imports from src/enums, src/utils etc via tsx)
COPY src ./src

# Copy generated Prisma client from build stage (overwrites placeholder)
COPY --from=build /app/src/generated ./src/generated

# Copy tsconfig (needed by tsx for seed)
COPY tsconfig.json tsup.config.ts ./

# Copy compiled app
COPY --from=build /app/dist ./dist

# Install tsx for running seed.ts at startup
RUN npm install tsx

EXPOSE 3001

# Start script: run migrations, seed, then start the app
CMD sh -c "npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/index.js"