@echo off
echo Service Status:
echo.
docker-compose ps
echo.
echo Access URLs:
echo   Frontend:  http://localhost:3000
echo   API:       http://localhost:4000
echo   API Docs:  http://localhost:4000/api/docs
echo.
pause
