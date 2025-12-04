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

echo "🔧 Building application..."
cd apps/api
echo "🔍 Current directory:"
pwd
echo "🔍 Checking if schema.prisma exists:"
ls -la prisma/schema.prisma
echo "🔍 Prisma directory contents:"
ls -la prisma/

echo "📦 Generating Prisma Client..."
pnpm prisma:generate

echo "🏗️ Building NestJS application..."
nest build

echo "🗄️ Syncing database schema..."
pnpm prisma db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate

echo "✅ Build completed successfully!"
