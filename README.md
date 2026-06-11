# MAGS AI Studio

AI SaaS platform like Cursor / Claude / OpenAI assistant

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8.15.4+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/MUNTAHA-QURESHI/mags-ai-studio.git
cd mags-ai-studio
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.local.example packages/frontend/.env.local
```

4. **Start PostgreSQL and Redis (using Docker)**

```bash
docker-compose up -d
```

5. **Setup database**

```bash
cd packages/backend
npx prisma generate
npx prisma db push
```

6. **Run development servers**

```bash
pnpm dev
```

This will start:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project Structure

- `packages/backend` - NestJS backend API
- `packages/frontend` - Next.js frontend application
- `packages/shared` - Shared types and utilities

## Available Scripts

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:push` - Push database schema changes

## Security

- Never commit `.env` files
- Use environment variables for secrets

## License

MIT
