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

COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/package.json ./package.json

ENV DB_PATH=/app/data/db.sqlite

EXPOSE 3001
CMD ["node", "dist/index.js"]
