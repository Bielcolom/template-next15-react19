# Next.js 15 + React 19 Template

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-7_(optional)-FF4438?logo=redis)
![License](https://img.shields.io/badge/License-MIT-blue)

Production-ready template with authentication, role-based access control, internationalization, and an admin backoffice. Designed to clone and build on top of without reinventing the base infrastructure.

---

## What's included

- **Authentication** — Login and registration with JWT sessions (HS256), bcrypt password hashing, `httpOnly` and `secure` cookies
- **Role-Based Access Control (RBAC)** — Roles and permissions stored in the database, route middleware with 4 access levels
- **Admin backoffice** — User and role management panel with pagination, search, and filters
- **Internationalization** — English and Spanish out of the box, with dynamic per-namespace loaders via `next-intl`
- **Form validation** — Zod schemas on the server for login, registration, and role management
- **Centralized error system** — Error codes, localized messages, and domain-specific handlers
- **Toast notifications** — Context provider with `showSuccess` and `showError`, integrated with redirect query params
- **Testing** — Vitest unit test suite covering authentication, permissions, sessions, and errors
- **Security** — CSP headers, rate limiting on login and registration, CSRF protection via `sameSite: strict`

---

## Getting started

### 1. Prerequisites

- **Node.js 18+**
- **MongoDB** (local or cloud)

Start MongoDB locally with Docker:

```bash
docker run -d --name template-mongo -p 27017:27017 mongo:7
```

Or use [MongoDB Atlas](https://www.mongodb.com/atlas) for a managed instance.

### 2. Clone and install

```bash
git clone <your-repo-url>
cd template-next15-react19
npm install
```

### 3. Environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description | Required |
|---|---|:---:|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `SESSION_SECRET` | Secret used to sign JWTs. Minimum 32 characters | Yes |
| `REDIS_URL` | Redis connection URL | No |
| `REDIS_PERMISSIONS_TTL_SECONDS` | Permission cache TTL in seconds (default: `300`) | No |
| `SEED_USER_PASSWORD` | Password for the seeded regular user | Seed only |
| `SEED_ADMIN_PASSWORD` | Password for the seeded admin | Seed only |
| `SEED_SUPERADMIN_PASSWORD` | Password for the seeded superadmin | Seed only |
| `SEED_UPDATE_PASSWORDS` | If `true`, updates passwords on every seed run | Seed only |

Generate a secure `SESSION_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Seed the database

```bash
npm run seed
```

Creates the following roles and users in MongoDB:

| Email | Default password | Role |
|---|---|---|
| `superadmin@template.local` | `ChangeMe123!` | superadmin |
| `admin@template.local` | `ChangeMe123!` | admin |
| `user@template.local` | `ChangeMe123!` | user |

> Change the passwords in `.env` before seeding in production.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Access levels

The middleware evaluates every route against one of four access levels:

| Level | Description | Example |
|---|---|---|
| `OPEN` | Accessible to everyone, with or without a session | `/`, `/about` |
| `PUBLIC` | Only for **unauthenticated** users. Redirects to home if a session exists | `/login`, `/register` |
| `PRIVATE` | Requires an active session with `admin` role or higher | `/backoffice/users` |
| `SUPERADMIN` | Requires `superadmin` role | `/backoffice/userRoles` |

Routes not explicitly declared require authentication by default.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/            # Authentication routes (login, register)
│   ├── [lang]/            # Language-prefixed routes
│   │   ├── backoffice/    # Admin dashboard pages
│   │   ├── components/    # Reusable components (base + backoffice)
│   │   ├── locales/       # JSON translation files (en/, es/)
│   │   └── hooks/         # Client-side custom hooks
│   ├── backoffice/        # Backoffice server actions
│   ├── context/           # React providers (session, toast)
│   └── lib/               # Server-side logic (session, cache, rate limiting)
├── actions/               # Shared server actions (user, userRole)
├── errors/                # Centralized error system and response builders
├── i18n/                  # next-intl configuration
├── middleware/            # Route authentication policy
├── middleware.js          # Next.js middleware entry point
├── models/                # Mongoose schemas (User, UserRole)
└── utils/                 # Shared utilities (Redis, DB, helpers, logger)
```

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run seed` | Seed the database with initial roles and users |

---

## Optional integrations

The template works without any additional services. The following integrations are **optional** and unlock specific features when enabled.

### Redis

**How to enable:** Set `REDIS_URL` in `.env`.

```bash
# Local instance with Docker
docker run -d --name template-redis -p 6379:6379 redis:7-alpine
```

```env
REDIS_URL=redis://127.0.0.1:6379
REDIS_PERMISSIONS_TTL_SECONDS=300
```

**What it adds:**

**Permission caching** — Without Redis, every request to a protected route queries MongoDB to fetch the user's permissions. With Redis, permissions are stored in memory with a configurable TTL (5 minutes by default). This reduces database load and speeds up every authenticated request.

**Auth rate limiting** — Redis enables a per-IP, per-action attempt counter. By default, the template limits login to 10 attempts per 15 minutes and registration to 5 attempts per hour. Without Redis, these limits are not enforced and the system continues to work without restrictions.

**Behavior without Redis:** The application works normally. Permission lookups go directly to MongoDB and rate limiting fails open (all requests are allowed). No errors or warnings are produced if `REDIS_URL` is not set.

---

## Data models

### User

| Field | Type | Description |
|---|---|---|
| `name` | String | Full name |
| `email` | String | Unique email, stored in lowercase |
| `passwordHash` | String | bcrypt hash of the password |
| `userRoleId` | ObjectId | Reference to the assigned role |
| `createdAt` | Date | Creation date (automatic) |
| `updatedAt` | Date | Last modified date (automatic) |

### UserRole

| Field | Type | Description |
|---|---|---|
| `name` | String | Role name, exactly as stored in the database |
| `permissions` | [String] | Array of permission codes (minimum 1) |
| `createdAt` | Date | Creation date (automatic) |
| `updatedAt` | Date | Last modified date (automatic) |

---

## License

[MIT](LICENSE.md) © 2026 Gabriel Colom Moll
