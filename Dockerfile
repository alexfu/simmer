FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD npx prisma migrate deploy && npm start
