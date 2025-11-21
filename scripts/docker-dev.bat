@echo off
REM AI Pulse Daily - Docker Development Script for Windows
REM Usage: scripts\docker-dev.bat [command]

setlocal enabledelayedexpansion

REM Print banner
echo.
echo ================================================
echo    AI Pulse Daily - Docker Dev Tool
echo ================================================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo WARNING: .env.local not found. Creating from .env.example...
    copy .env.example .env.local >nul
    echo SUCCESS: Created .env.local - Please update it with your values
    echo WARNING: Don't forget to set GEMINI_API_KEY and other credentials!
    echo.
)

REM Parse command
set COMMAND=%1
set SERVICE=%2

if "%COMMAND%"=="" goto :help
if "%COMMAND%"=="help" goto :help
if "%COMMAND%"=="start" goto :start
if "%COMMAND%"=="start-logs" goto :start_logs
if "%COMMAND%"=="stop" goto :stop
if "%COMMAND%"=="restart" goto :restart
if "%COMMAND%"=="status" goto :status
if "%COMMAND%"=="logs" goto :logs
if "%COMMAND%"=="clean" goto :clean
if "%COMMAND%"=="build" goto :build
if "%COMMAND%"=="migrate" goto :migrate
if "%COMMAND%"=="prisma-gen" goto :prisma_gen
if "%COMMAND%"=="prisma-studio" goto :prisma_studio
if "%COMMAND%"=="seed" goto :seed
if "%COMMAND%"=="shell" goto :shell

echo ERROR: Unknown command: %COMMAND%
goto :help

:start
echo Starting all services...
docker-compose up -d
echo SUCCESS: Services started!
call :status
goto :end

:start_logs
echo Starting all services with logs...
docker-compose up
goto :end

:stop
echo Stopping all services...
docker-compose down
echo SUCCESS: Services stopped!
goto :end

:restart
echo Restarting all services...
docker-compose restart
echo SUCCESS: Services restarted!
goto :end

:status
echo.
echo Service Status:
docker-compose ps
echo.
echo Access URLs:
echo   Frontend:      http://localhost:3000
echo   Backend API:   http://localhost:4000
echo   API Docs:      http://localhost:4000/api/docs
echo   Prisma Studio: http://localhost:5555 (run with --profile tools)
echo.
goto :end

:logs
if "%SERVICE%"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %SERVICE%
)
goto :end

:clean
echo WARNING: Cleaning all containers, volumes, and images...
set /p CONFIRM="Are you sure? This will delete all data! (y/N) "
if /i "%CONFIRM%"=="y" (
    docker-compose down -v --rmi all
    echo SUCCESS: Cleaned!
) else (
    echo CANCELLED
)
goto :end

:build
echo Building Docker images...
docker-compose build --no-cache
echo SUCCESS: Images built!
goto :end

:migrate
echo Running database migrations...
docker-compose exec api pnpm prisma:migrate
echo SUCCESS: Migrations complete!
goto :end

:prisma_gen
echo Generating Prisma client...
docker-compose exec api pnpm prisma:generate
echo SUCCESS: Prisma client generated!
goto :end

:prisma_studio
echo Starting Prisma Studio...
docker-compose --profile tools up -d prisma-studio
echo SUCCESS: Prisma Studio running at http://localhost:5555
goto :end

:seed
echo Seeding database...
REM Add your seed command here
echo SUCCESS: Database seeded!
goto :end

:shell
if "%SERVICE%"=="" set SERVICE=api
echo Opening shell in %SERVICE%...
docker-compose exec %SERVICE% sh
goto :end

:help
echo Usage: scripts\docker-dev.bat [command]
echo.
echo Commands:
echo   start          Start all services in background
echo   start-logs     Start all services with logs
echo   stop           Stop all services
echo   restart        Restart all services
echo   status         Show service status
echo   logs [service] View logs (optional: specify service)
echo   clean          Remove all containers, volumes, and images
echo   build          Build Docker images
echo   migrate        Run database migrations
echo   prisma-gen     Generate Prisma client
echo   prisma-studio  Open Prisma Studio
echo   seed           Seed database
echo   shell [service] Open shell in container (default: api)
echo   help           Show this help message
echo.
echo Examples:
echo   scripts\docker-dev.bat start
echo   scripts\docker-dev.bat logs api
echo   scripts\docker-dev.bat shell web
echo.
goto :end

:end
endlocal
