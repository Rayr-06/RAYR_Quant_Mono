@echo off
title RAYR_Quant Launcher
echo ========================================
echo    RAYR_Quant - Full Stack Startup
echo ========================================
echo.
echo [1/2] Starting Python Backend Engine...
start "RAYR Backend" cmd /k "cd /d E:\nvidia\RAYR_Quant_Mono\backend && .\venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo [2/2] Starting React Frontend Dashboard...
timeout /t 3 /nobreak >nul
start "RAYR Frontend" cmd /k "cd /d E:\nvidia\RAYR_Quant_Mono\frontend && npm run dev"

echo.
echo Both systems are launching in separate windows!
echo Close those windows to stop the app.
echo ========================================
pause
