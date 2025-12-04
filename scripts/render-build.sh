#!/bin/bash
set -e

echo "📦 Installing pnpm..."
npm install -g pnpm

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Generating Prisma Client..."
cd apps/api
pnpm prisma generate --schema=./prisma/schema.prisma

echo "🏗️ Building application..."
pnpm run build

echo "✅ Build completed successfully!"
