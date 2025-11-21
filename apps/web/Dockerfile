# ==================== Base Stage ====================
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Set working directory
WORKDIR /app

# Copy root package files and pnpm config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy all workspace packages
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/config/package.json ./packages/config/

# ==================== Dependencies Stage ====================
FROM base AS dependencies

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ==================== Development Stage ====================
FROM dependencies AS development

# Copy source code
COPY apps/web ./apps/web
COPY packages ./packages
COPY turbo.json ./

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "--filter", "@aipush/web", "dev", "--host", "0.0.0.0"]

# ==================== Build Stage ====================
FROM dependencies AS build

# Set build arguments
ARG VITE_API_URL
ARG VITE_GLM_API_KEY

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GLM_API_KEY=${VITE_GLM_API_KEY}

# Copy source code
COPY apps/web ./apps/web
COPY packages ./packages
COPY turbo.json ./

# Build the application
RUN pnpm --filter @aipush/web build

# ==================== Production Stage (Nginx) ====================
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
