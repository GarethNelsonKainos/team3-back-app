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
- `npm run db:seed` - Run database seed file

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