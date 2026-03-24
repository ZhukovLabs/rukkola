FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY packages/backend/package.json ./package.json
COPY yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile --production=false

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY packages/backend/tsconfig.json ./tsconfig.json
COPY packages/backend/nest-cli.json ./nest-cli.json
COPY packages/backend/src ./src

RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Install production deps only
COPY packages/backend/package.json ./package.json
COPY yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

COPY --from=builder /app/dist ./dist

USER nestjs

EXPOSE 4000

ENV PORT=4000

CMD ["node", "dist/main.js"]
