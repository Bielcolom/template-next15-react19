# Next.js 15 + React 19 Template

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-7-FF4438?logo=redis)
![License](https://img.shields.io/badge/License-MIT-blue)

A production-ready Next.js 15 template with authentication, role-based access control, internationalization, and an admin backoffice — ready to clone and build on top of.

---

## Features

- **Authentication** — Login and registration with JWT sessions and secure password hashing (bcryptjs)
- **Role-Based Access Control** — User, Admin, and Superadmin roles with permission caching via Redis
- **Admin Backoffice** — Dashboard UI for managing users and roles
- **Internationalization** — Multi-language support out of the box via `next-intl`
- **MongoDB** — Mongoose ODM with User and UserRole schemas
- **Schema Validation** — Server-side validation with Zod
- **Testing** — Unit tests with Vitest
- **Toast Notifications** — Context-based toast provider for user feedback

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Redis instance (local or managed)

You can start both locally with Docker:

```bash
docker run -d --name boilerplate-mongo -p 27017:27017 mongo:7
docker run -d --name boilerplate-redis -p 6379:6379 redis:7-alpine
```

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd template-next15-react19

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local` with your values:

| Variable | Description | Default |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/Boilerplate` |
| `SESSION_SECRET` | JWT signing secret (min 32 chars) | — |
| `REDIS_URL` | Redis connection URL | `redis://127.0.0.1:6379` |
| `REDIS_PERMISSIONS_TTL_SECONDS` | Permission cache TTL in seconds | `300` |
| `SEED_USER_PASSWORD` | Default password for seeded user | — |
| `SEED_ADMIN_PASSWORD` | Default password for seeded admin | — |
| `SEED_SUPERADMIN_PASSWORD` | Default password for seeded superadmin | — |
| `SEED_UPDATE_PASSWORDS` | Re-hash passwords on re-seed | `false` |

### Seed the Database

```bash
npm run seed
```

Creates the following in your database:

- **Roles:** `user`, `admin`, `superadmin`
- **Users:** `user@template.local`, `admin@template.local`, `superadmin@template.local`

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── actions/           # Server actions
│   ├── user/          # User-related actions
│   └── userRole/      # Role-related actions
├── app/               # Next.js App Router
│   ├── (auth)/        # Auth routes (login, register)
│   ├── [lang]/        # Dynamic language routing
│   ├── backoffice/    # Admin dashboard
│   ├── context/       # React Context (session, toast)
│   └── lib/           # Utilities (session, auth, Redis cache)
├── models/            # Mongoose schemas (User, UserRole)
├── middleware/        # Next.js middleware (auth guards)
├── i18n/              # Internationalization config
├── errors/            # Centralized error handlers
└── utils/             # Shared helper utilities
```

---

## Redis Permission Cache

Permission checks use Redis cache keys with prefix `auth:permissions:*`.

- On login/session creation, current permissions are cached.
- During protected route checks, permissions are read from Redis first.
- If Redis is unavailable or `REDIS_URL` is not set, the app falls back to MongoDB — fully functional, without cache benefits.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run seed` | Seed default users and roles into the database |

---

## License

[MIT](LICENSE.md) © 2026 Gabriel Colom Moll
