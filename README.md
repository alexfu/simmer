# Simmer

A recipe app that lets you store, scale, and organize recipes. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Create, edit, and delete recipes with ingredients and step-by-step instructions
- Dynamic servings scaling — adjust servings and all quantities update automatically
- AI-powered recipe import from images, PDFs, or plain text (OpenAI, Gemini, Anthropic)
- Ingredient references in instructions that scale with servings
- Shopping lists with items from recipes or manual entry
- Rich text notes at recipe and instruction level
- Arithmetic quantity input (e.g. `1/4`, `1+1/2`, `2*3`)
- Mobile-friendly responsive design
- JSON export/import for backup

## Prerequisites

- Node.js 18+
- PostgreSQL

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up the database:

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The default connects to a local PostgreSQL with `simmer:simmer` credentials:

```
DATABASE_URL="postgresql://simmer:simmer@localhost:5432/simmer"
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

## Docker

### Development

```bash
docker compose up -d
```

Starts PostgreSQL and the Next.js dev server with hot reloading.

### Production

```bash
docker build -t simmer .
docker run -p 3000:3000 -e DATABASE_URL="postgresql://user:password@your-db-host:5432/simmer" simmer
```

Migrations run automatically on container startup.

## Scripts

| Command                  | Description                 |
| ------------------------ | --------------------------- |
| `npm run dev`            | Start dev server            |
| `npm run build`          | Production build            |
| `npm run start`          | Start production server     |
| `npm run lint`           | Run ESLint                  |
| `npm run format`         | Format with Prettier        |
| `npx prisma migrate dev` | Run migrations              |
| `npx prisma studio`      | Open Prisma Studio (DB GUI) |
