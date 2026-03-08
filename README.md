This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Create your local environment file:

```bash
cp .env.example .env
```

Required variables:

- `MONGODB_URI`: MongoDB connection string.
- `SESSION_SECRET`: secret used to sign sessions (`>= 32` chars).
- `REDIS_URL`: Redis connection string used for permission cache.
- `REDIS_PERMISSIONS_TTL_SECONDS` (optional): permissions cache TTL (defaults to `300` seconds).

Start infrastructure (example with Docker):

```bash
docker run -d --name boilerplate-mongo -p 27017:27017 mongo:7
docker run -d --name boilerplate-redis -p 6379:6379 redis:7-alpine
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Seed Data

Seed default `userRoles` and `users`:

```bash
npm run seed
```

It will upsert:

- Roles: `user`, `admin`, `superadmin`
- Users: `user@boilerplate.local`, `admin@boilerplate.local`, `superadmin@boilerplate.local`

Optional env vars for seed passwords:

- `SEED_USER_PASSWORD`
- `SEED_ADMIN_PASSWORD`
- `SEED_SUPERADMIN_PASSWORD`
- `SEED_UPDATE_PASSWORDS=true` (updates password hash for existing seeded users)

## Redis Permission Cache

Permission checks use Redis cache keys with prefix `auth:permissions:*`.

- On login/session creation, current permissions are cached.
- During protected route checks, permissions are read from Redis first.
- If Redis is unavailable or `REDIS_URL` is not configured, the app falls back to MongoDB (still works, but without cache benefits).

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
