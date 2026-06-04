# Field Vision — Work Queue Platform

AI-powered vending machine inspection (MVP v3).

## Stack

- Next.js 14 App Router, TypeScript, Tailwind
- Prisma + PostgreSQL
- BullMQ + Redis
- Cloudinary, Anthropic Claude Vision
- NextAuth (credentials)
- Railway deployment

## Local setup

```bash
cp .env.example .env
# Set DATABASE_URL, REDIS_URL, and other keys

npm install
npx prisma migrate dev
npm run db:seed

npm run dev          # Web on :3000
npm run worker       # BullMQ worker (separate terminal)
```

## Demo users (after seed)

| Email | Role | Password |
|-------|------|----------|
| agent@maskar.local | AGENT | password123 |
| office@maskar.local | OFFICE | password123 |
| admin@maskar.local | ADMIN | password123 |

## Routes

- `/login` — credentials login
- `/submit` — agent visit submission
- `/office` — approval inbox
- `/office/visits/[id]` — approval screen
- `/office/tasks` — work queue

## Railway

1. Create project with **Web**, **Worker**, **PostgreSQL**, **Redis** services.
2. Web: `npm run build` / `npm run start`
3. Worker: `npm run worker`
4. Set env vars from `.env.example` on both services.
5. Run migrations: `npm run db:migrate` and `npm run db:seed` (one-off or release command).

Specification: `docs/vending-vision-spec-v3_1.docx`
