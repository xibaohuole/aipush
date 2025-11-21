#!/bin/bash

# AI Pulse Daily - Docker Development Script
# Usage: ./scripts/docker-dev.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print banner
print_banner() {
    echo ""
    print_message "$BLUE" "╔════════════════════════════════════════════╗"
    print_message "$BLUE" "║                                            ║"
    print_message "$BLUE" "║   🚀 AI Pulse Daily - Docker Dev Tool     ║"
    print_message "$BLUE" "║                                            ║"
    print_message "$BLUE" "╚════════════════════════════════════════════╝"
    echo ""
}

# Check if .env.local exists
check_env() {
    if [ ! -f ".env.local" ]; then
        print_message "$YELLOW" "⚠️  .env.local not found. Creating from .env.example..."
        cp .env.example .env.local
        print_message "$GREEN" "✅ Created .env.local - Please update it with your values"
        print_message "$YELLOW" "⚠️  Don't forget to set GEMINI_API_KEY and other credentials!"
        echo ""
    fi
}

# Start all services
start() {
    print_message "$GREEN" "🚀 Starting all services..."
    docker-compose up -d
    print_message "$GREEN" "✅ Services started!"
    print_status
}

# Start with logs
start_logs() {
    print_message "$GREEN" "🚀 Starting all services with logs..."
    docker-compose up
}

# Stop all services
stop() {
    print_message "$YELLOW" "🛑 Stopping all services..."
    docker-compose down
    print_message "$GREEN" "✅ Services stopped!"
}

# Restart all services
restart() {
    print_message "$YELLOW" "🔄 Restarting all services..."
    docker-compose restart
    print_message "$GREEN" "✅ Services restarted!"
}

# View logs
logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Show status
print_status() {
    echo ""
    print_message "$BLUE" "📊 Service Status:"
    docker-compose ps
    echo ""
    print_message "$BLUE" "🔗 Access URLs:"
    print_message "$GREEN" "  Frontend:      http://localhost:3000"
    print_message "$GREEN" "  Backend API:   http://localhost:4000"
    print_message "$GREEN" "  API Docs:      http://localhost:4000/api/docs"
    print_message "$GREEN" "  Prisma Studio: http://localhost:5555 (run with --profile tools)"
    echo ""
}

# Clean everything
clean() {
    print_message "$RED" "🧹 Cleaning all containers, volumes, and images..."
    read -p "Are you sure? This will delete all data! (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi all
        print_message "$GREEN" "✅ Cleaned!"
    else
        print_message "$YELLOW" "❌ Cancelled"
    fi
}

# Run database migrations
migrate() {
    print_message "$BLUE" "🔄 Running database migrations..."
    docker-compose exec api pnpm prisma:migrate
    print_message "$GREEN" "✅ Migrations complete!"
}

# Generate Prisma client
prisma_generate() {
    print_message "$BLUE" "🔄 Generating Prisma client..."
    docker-compose exec api pnpm prisma:generate
    print_message "$GREEN" "✅ Prisma client generated!"
}

# Open Prisma Studio
prisma_studio() {
    print_message "$BLUE" "🎨 Starting Prisma Studio..."
    docker-compose --profile tools up -d prisma-studio
    print_message "$GREEN" "✅ Prisma Studio running at http://localhost:5555"
}

# Seed database
seed() {
    print_message "$BLUE" "🌱 Seeding database..."
    # Add your seed command here
    print_message "$GREEN" "✅ Database seeded!"
}

# Run shell in container
shell() {
    local service=$1
    if [ -z "$service" ]; then
        service="api"
    fi
    print_message "$BLUE" "🐚 Opening shell in $service..."
    docker-compose exec "$service" sh
}

# Build images
build() {
    print_message "$BLUE" "🔨 Building Docker images..."
    docker-compose build --no-cache
    print_message "$GREEN" "✅ Images built!"
}

# Show help
show_help() {
    print_banner
    echo "Usage: ./scripts/docker-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start          Start all services in background"
    echo "  start-logs     Start all services with logs"
    echo "  stop           Stop all services"
    echo "  restart        Restart all services"
    echo "  status         Show service status"
    echo "  logs [service] View logs (optional: specify service)"
    echo "  clean          Remove all containers, volumes, and images"
    echo "  build          Build Docker images"
    echo "  migrate        Run database migrations"
    echo "  prisma-gen     Generate Prisma client"
    echo "  prisma-studio  Open Prisma Studio"
    echo "  seed           Seed database"
    echo "  shell [service] Open shell in container (default: api)"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/docker-dev.sh start"
    echo "  ./scripts/docker-dev.sh logs api"
    echo "  ./scripts/docker-dev.sh shell web"
    echo ""
}

# Main script
main() {
    print_banner
    check_env

    local command=$1

    case "$command" in
        start)
            start
            ;;
        start-logs)
            start_logs
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        status)
            print_status
            ;;
        logs)
            logs "$2"
            ;;
        clean)
            clean
            ;;
        build)
            build
            ;;
        migrate)
            migrate
            ;;
        prisma-gen)
            prisma_generate
            ;;
        prisma-studio)
            prisma_studio
            ;;
        seed)
            seed
            ;;
        shell)
            shell "$2"
            ;;
        help|"")
            show_help
            ;;
        *)
            print_message "$RED" "❌ Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main
main "$@"
