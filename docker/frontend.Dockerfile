FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/frontend/package.json ./packages/frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
# Stub backend so yarn workspaces resolves all packages
RUN mkdir -p packages/backend && \
    echo '{"name":"@rukkola/backend","version":"0.1.0","private":true}' > packages/backend/package.json
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY package.json yarn.lock ./
COPY packages/shared/ ./packages/shared/
COPY packages/frontend/ ./packages/frontend/

ARG INTERNAL_API_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_HCAPTCHA_SITE_KEY
ARG JWT_SECRET

ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_HCAPTCHA_SITE_KEY=$NEXT_PUBLIC_HCAPTCHA_SITE_KEY
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/packages/frontend
RUN yarn build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV JWT_SECRET=${JWT_SECRET}

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output preserves monorepo structure: .next/standalone/packages/frontend/server.js
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/static ./packages/frontend/.next/static
COPY --from=builder /app/packages/frontend/public ./packages/frontend/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "packages/frontend/server.js"]
