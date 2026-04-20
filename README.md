# Simmer

A recipe app that lets you store, scale, and share recipes. Built with Next.js, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js 18+
- PostgreSQL

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up the database:

Copy `.env.example` to `.env` and set your PostgreSQL connection string:

```bash
cp .env.example .env
```

```
DATABASE_URL="postgresql://user:password@localhost:5432/simmer"
```

3. Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npx prisma migrate dev` | Run migrations |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |
