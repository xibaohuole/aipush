@echo off
echo Starting AI Pulse Daily...
docker-compose up -d
echo.
echo Services started!
echo.
echo Frontend:  http://localhost:3000
echo API:       http://localhost:4000
echo API Docs:  http://localhost:4000/api/docs
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
pause
