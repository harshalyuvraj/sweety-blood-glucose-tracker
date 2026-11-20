
# Stage 1: Build the React application
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --filter @sweety/web --prod=false --frozen-lockfile

COPY apps/web ./apps/web

WORKDIR /app/apps/web

RUN pnpm build


# Stage 2: Serve the production build
FROM nginx:alpine AS runtime

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY docker/web/nginx.conf /etc/nginx/templates/default.conf.template

ENV API_URL=http://api:5000
ENV NGINX_ENVSUBST_FILTER=^API_URL$

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
