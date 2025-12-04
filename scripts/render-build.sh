#!/bin/bash
set -e

echo "📦 Installing pnpm..."
npm install -g pnpm

echo "📦 Installing dependencies..."
pnpm install

echo "🔍 Debug: Checking project structure..."
pwd
ls -la
echo "🔍 Debug: Checking apps/api..."
ls -la apps/api
echo "🔍 Debug: Checking apps/api/prisma..."
ls -la apps/api/prisma

echo "🔧 Building application (includes Prisma generation)..."
cd apps/api
pnpm run build

echo "🗄️ Running database migrations..."
# Use db push for Render since migrations might not be committed
# This is safe on first deploy and will sync the schema
pnpm prisma db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate

echo "✅ Build completed successfully!"
