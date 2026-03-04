# ============================================================
# PAMP Frontend — Dockerfile
# Next.js 14 — standalone output (minimal production image)
# ============================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Receive API URL at build time (baked into client bundle)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Minimal production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as non-root user
RUN addgroup -g 1001 -S pamp && adduser -u 1001 -S pamp -G pamp

# Copy only what next start needs (standalone output)
COPY --from=builder --chown=pamp:pamp /app/.next/standalone ./
COPY --from=builder --chown=pamp:pamp /app/.next/static ./.next/static

USER pamp

EXPOSE 3000

CMD ["node", "server.js"]
