#!/bin/bash
set -e

echo "📦 Installing pnpm..."
npm install -g pnpm

# 获取项目根目录的绝对路径
PROJECT_ROOT=$(pwd)
echo "🔍 Project root: $PROJECT_ROOT"

echo "🔍 Verifying schema.prisma before install..."
ls -la "$PROJECT_ROOT/apps/api/prisma/"
cat "$PROJECT_ROOT/apps/api/prisma/schema.prisma" | head -20

echo "📦 Installing dependencies (will skip Prisma postinstall)..."
# Skip Prisma's postinstall to avoid path issues, we'll generate manually
PRISMA_SKIP_POSTINSTALL_GENERATE=1 pnpm install

echo "🔍 Debug: Checking project structure..."
ls -la "$PROJECT_ROOT"
echo "🔍 Debug: Checking apps/api..."
ls -la "$PROJECT_ROOT/apps/api"
echo "🔍 Debug: Checking apps/api/prisma..."
ls -la "$PROJECT_ROOT/apps/api/prisma"

echo "🔧 Building application..."
cd "$PROJECT_ROOT/apps/api"
echo "🔍 Current directory: $(pwd)"
echo "🔍 Checking if schema.prisma exists:"
ls -la prisma/schema.prisma
echo "🔍 Prisma directory contents:"
ls -la prisma/

echo "📦 Generating Prisma Client with absolute path..."
# 使用绝对路径确保 Prisma 找到 schema
npx prisma generate --schema="$PROJECT_ROOT/apps/api/prisma/schema.prisma"

echo "🏗️ Building NestJS application..."
npx nest build

echo "🗄️ Syncing database schema with absolute path..."
# 使用绝对路径确保 Prisma 找到 schema
npx prisma db push --schema="$PROJECT_ROOT/apps/api/prisma/schema.prisma" --accept-data-loss --skip-generate

echo "✅ Build completed successfully!"
