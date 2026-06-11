# MAGS AI Studio - Frontend

Next.js Frontend for MAGS AI Studio

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8.15.4+

### Installation

```bash
cd packages/frontend
pnpm install
```

### Environment Setup

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your API URL.

### Development

```bash
pnpm dev
```

App runs on http://localhost:3000

### Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
├── lib/              # Utilities and API clients
├── types/            # TypeScript types
└── middleware.ts     # Next.js middleware
```

## Features

- Next.js 15 with App Router
- TypeScript support
- Tailwind CSS styling
- Authentication ready
- API client integration
