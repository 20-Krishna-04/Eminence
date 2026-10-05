@echo off
echo ===================================================
echo        Starting Eminence Development Servers
echo ===================================================

echo Starting Backend...
start "Eminence - Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend...
start "Eminence - Frontend" cmd /k "cd frontend && npm run dev"

echo Starting Mobile...
start "Eminence - Mobile" cmd /k "cd mobile && npm start"

echo.
echo All services have been launched in separate windows!
echo You can close this window now.
pause
