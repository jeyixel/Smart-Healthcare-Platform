# ──────────────────────────────────────────────────────────────
# Stage 1 (deps): Install dependencies
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ──────────────────────────────────────────────────────────────
# Stage 2 (builder): Build Next.js with baked-in public env vars
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_ variables must be declared as ARGs so docker-compose
# build.args can inject them *before* `npm run build`.
ARG NEXT_PUBLIC_API_GATEWAY_BASE=http://localhost:8080
ARG NEXT_PUBLIC_API_GATEWAY=http://localhost:8080
ARG NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
ARG NEXT_PUBLIC_ADMIN_API_BASE=http://localhost:8087
ARG NEXT_PUBLIC_PATIENT_API_BASE=http://localhost:8081

ENV NEXT_PUBLIC_API_GATEWAY_BASE=${NEXT_PUBLIC_API_GATEWAY_BASE}
ENV NEXT_PUBLIC_API_GATEWAY=${NEXT_PUBLIC_API_GATEWAY}
ENV NEXT_PUBLIC_API_GATEWAY_URL=${NEXT_PUBLIC_API_GATEWAY_URL}
ENV NEXT_PUBLIC_ADMIN_API_BASE=${NEXT_PUBLIC_ADMIN_API_BASE}
ENV NEXT_PUBLIC_PATIENT_API_BASE=${NEXT_PUBLIC_PATIENT_API_BASE}

RUN npm run build

# ──────────────────────────────────────────────────────────────
# Stage 3 (runner): Minimal production image
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 appgroup && adduser --system --uid 1001 appuser

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER appuser

EXPOSE 3000

CMD ["npm", "run", "start"]
