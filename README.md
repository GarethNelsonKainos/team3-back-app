# team3-back-app
Team 3 Backend Application Feb/March 2026
## Setup

### Database Configuration

This project uses Prisma with PostgreSQL. Follow these steps to set up your database:

1. **Configure your database connection:**
   
   Update the `DATABASE_URL` in `.env` with your PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
   ```

2. **Create your database schema:**
   
   Edit `prisma/schema.prisma` to define your data models.

3. **Push schema to database:**
   ```bash
   npm run db:push
   ```
   
   Or create a migration:
   ```bash
   npm run db:migrate
   ```

4. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

### Available Prisma Commands

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (visual database editor)

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Run Production

```bash
npm start
```

## CI Image Publishing (Azure Container Registry)

The CI workflow builds Docker images for pull requests and `main` branch pushes.

- Pull requests: image is built locally in CI for validation only (not pushed).
- `main` branch pushes: image is pushed to Azure Container Registry (ACR).

### GitHub repository configuration

Add these **Repository secrets** in GitHub (`Settings > Secrets and variables > Actions`):

- `ACR_LOGIN_SERVER` (example: `academyacrj3r5dv.azurecr.io`)
- `ACR_USERNAME` = Azure Service Principal `clientId`
- `ACR_PASSWORD` = Azure Service Principal `clientSecret`

### Recommended authentication setup

Use an Azure Service Principal scoped to your ACR with the `AcrPush` role.

```bash
ACR_ID=$(az acr show -n <acr-name> --query id -o tsv)

az ad sp create-for-rbac \
   --name "gh-acr-team3-back-app" \
   --role AcrPush \
   --scopes "$ACR_ID"
```

Use the returned `appId` as `ACR_USERNAME` and `password` as `ACR_PASSWORD`.

### Image naming and tags

On `main` pushes, CI publishes:

- `<ACR_LOGIN_SERVER>/team3-back-app:sha-<12-char-commit>`
- `<ACR_LOGIN_SERVER>/team3-back-app:latest`

### Verifying image push

In GitHub Actions, push success is validated by checking that Docker returns a pushed digest.

You can also verify in Azure:

```bash
az acr repository show-tags \
   --name <acr-name> \
   --repository <repository-name> \
   --orderby time_desc \
   -o table
```