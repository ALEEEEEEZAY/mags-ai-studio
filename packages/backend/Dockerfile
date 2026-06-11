FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared
COPY tsconfig.base.json ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

WORKDIR /app/packages/backend

RUN pnpm exec prisma generate
RUN pnpm build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main"]
