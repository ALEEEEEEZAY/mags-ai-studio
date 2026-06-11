FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/frontend ./packages/frontend
COPY packages/shared ./packages/shared
COPY tsconfig.base.json ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

WORKDIR /app/packages/frontend

RUN pnpm build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/packages/frontend/.next ./.next
COPY --from=builder /app/packages/frontend/public ./public
COPY --from=builder /app/packages/frontend/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
