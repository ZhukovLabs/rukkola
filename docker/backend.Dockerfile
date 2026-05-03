FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./package.json
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile --production=false

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY packages/backend/tsconfig.json ./packages/backend/tsconfig.json
COPY packages/backend/nest-cli.json ./packages/backend/nest-cli.json
COPY packages/backend/src ./packages/backend/src
COPY packages/shared/src ./packages/shared/src
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN yarn workspace @rukkola/backend build

FROM node:22-alpine AS prod-deps
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./package.json
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./dist

USER nestjs

EXPOSE 4000

ENV PORT=4000

CMD ["sh", "-c", "node dist/scripts/generate-blur-urls.js && node dist/main.js"]