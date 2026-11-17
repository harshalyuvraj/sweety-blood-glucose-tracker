
# Stage 1: Install dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --filter @sweety/api --prod --frozen-lockfile


# Stage 2: Production runtime
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=dependencies /app/apps/api/package.json ./apps/api/package.json
COPY apps/api/src ./apps/api/src

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["node", "src/server.js"]
