FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --workspace packages/frontend --workspace packages/shared

COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend

ARG VITE_API_BASE_URL=http://localhost:3001
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build:frontend

# ── Serve with nginx ─────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# SPA fallback: serve index.html for all routes
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
