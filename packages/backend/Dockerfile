FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --workspace packages/backend --workspace packages/shared

COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend

RUN npm run build:backend

# ── Production image ──────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/package.json ./package.json

RUN mkdir -p /app/data && chown appuser:appgroup /app/data

ENV DB_PATH=/app/data/db.sqlite
ENV NODE_ENV=production

USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "dist/backend/src/index.js"]
