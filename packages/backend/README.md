# MAGS AI Studio - Backend

NestJS Backend API for MAGS AI Studio

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Redis (optional for caching)

### Installation

```bash
cd packages/backend
pnpm install
```

### Environment Setup

```bash
cp .env.example .env
```

Update `.env` with your configuration.

### Database Setup

```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

### Development

```bash
pnpm start:dev
```

Server runs on http://localhost:3001

## API Endpoints

### Health Check

- `GET /health` - Server health status
- `GET /` - API info

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (requires JWT)

## Testing

```bash
pnpm test
pnpm test:watch
pnpm test:cov
pnpm test:e2e
```

## Security Notes

- Password hashing with bcrypt planned for Phase 2
- JWT tokens expire after 7 days
- CORS enabled for frontend origin only
