# ── Development stage ────────────────────────────────────────────────────────
FROM node:trixie AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

# src se monta como volumen desde el host, no se copia aquí

EXPOSE 3000

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]

# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:trixie AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:trixie-slim AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]
