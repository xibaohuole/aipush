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

echo "🔧 Generating Prisma Client..."
cd apps/api
echo "🔍 Current directory:"
pwd
echo "🔍 Contents:"
ls -la
echo "🔍 Prisma directory:"
ls -la prisma
prisma generate --schema=./prisma/schema.prisma

echo "🏗️ Building application..."
pnpm run build

echo "✅ Build completed successfully!"
