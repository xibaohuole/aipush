# ==================== Base Stage ====================
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Set working directory
WORKDIR /app

# Copy root package files and pnpm config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy all workspace packages
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/config/package.json ./packages/config/

# ==================== Dependencies Stage ====================
FROM base AS dependencies

# Install all dependencies (including dev dependencies for Prisma)
RUN pnpm install --frozen-lockfile

# Install openssl for Prisma (Alpine requirement)
RUN apk add --no-cache openssl

# ==================== Development Stage ====================
FROM dependencies AS development

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages
COPY database ./database
COPY turbo.json ./

# Generate Prisma Client (prisma is hoisted to root node_modules due to shamefully-hoist=true)
RUN npx prisma generate --schema=database/prisma/schema.prisma

# Expose port
EXPOSE 4000

# Start development server (use node_modules from root due to hoisting)
CMD ["sh", "-c", "cd apps/api && node ../../node_modules/.bin/ts-node src/main.ts"]

# ==================== Build Stage ====================
FROM dependencies AS build

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages
COPY database ./database
COPY turbo.json ./

# Generate Prisma Client (prisma is hoisted to root node_modules due to shamefully-hoist=true)
RUN npx prisma generate --schema=database/prisma/schema.prisma

# Build the application
RUN pnpm --filter @aipush/api build

# ==================== Production Stage ====================
FROM node:20-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=nestjs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=nestjs:nodejs apps/api/package.json ./apps/api/
COPY --chown=nestjs:nodejs packages/types/package.json ./packages/types/
COPY --chown=nestjs:nodejs packages/utils/package.json ./packages/utils/
COPY --chown=nestjs:nodejs packages/config/package.json ./packages/config/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --chown=nestjs:nodejs --from=build /app/apps/api/dist ./apps/api/dist
COPY --chown=nestjs:nodejs --from=build /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --chown=nestjs:nodejs --from=build /app/packages ./packages
COPY --chown=nestjs:nodejs database ./database

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "apps/api/dist/main.js"]
