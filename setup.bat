@echo off
title RAYR_Quant Setup Script
color 0A

echo.
echo  ██████╗  █████╗  ██████╗██╗  ██╗███╗   ██╗███████╗████████╗
echo  ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝████╗  ██║██╔════╝╚══██╔══╝
echo  ██████╔╝███████║██║     █████╔╝ ██╔██╗ ██║█████╗     ██║   
echo  ██╔══██╗██╔══██║██║     ██╔═██╗ ██║╚██╗██║██╔══╝     ██║   
echo  ██║  ██║██║  ██║╚██████╗██║  ██╗██║ ╚████║███████╗   ██║   
echo  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   
echo.
echo  ══════════════════════════════════════════════════════════════
echo   RAYR_Quant - Professional Automated Trading System
echo   By: Rayr-06 | github.com/Rayr-06
echo  ══════════════════════════════════════════════════════════════
echo.

REM ============================================
REM CHECK PREREQUISITES
REM ============================================

echo [1/8] Checking prerequisites...

REM Check Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed!
    echo    Download: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo ✅ Git found

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo    Download: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed!
    pause
    exit /b 1
)
echo ✅ npm found

echo.

REM ============================================
REM GET USER INPUT
REM ============================================

echo [2/8] Configuration
echo.
set /p GITHUB_USERNAME="Enter your GitHub username (Rayr-06): "
if "%GITHUB_USERNAME%"=="" set GITHUB_USERNAME=Rayr-06

set /p REPO_NAME="Enter repository name (RAYR_Quant): "
if "%REPO_NAME%"=="" set REPO_NAME=RAYR_Quant

set /p WEBHOOK_SECRET="Enter webhook secret (or press Enter for default): "
if "%WEBHOOK_SECRET%"=="" set WEBHOOK_SECRET=rayr-quant-secret-2024

echo.

REM ============================================
REM UPDATE CONFIGURATION FILES
REM ============================================

echo [3/8] Updating configuration files...

REM Update server .env
(
echo # RAYR_Quant Configuration
echo # By Rayr-06
echo.
echo # Server
echo PORT=3001
echo.
echo # Trading Mode ^(true = paper, false = live^)
echo PAPER_MODE=true
echo.
echo # Webhook Security
echo WEBHOOK_SECRET=%WEBHOOK_SECRET%
echo.
echo # Zerodha Kite API
echo KITE_API_KEY=your-api-key-here
echo KITE_API_SECRET=your-api-secret-here
echo KITE_ACCESS_TOKEN=your-access-token-here
echo.
echo # Risk Management
echo MAX_RISK_PER_TRADE=1
echo MAX_DAILY_LOSS=2
echo MAX_POSITIONS=5
echo INITIAL_CAPITAL=500000
) > server\.env

echo ✅ Configuration updated

echo.

REM ============================================
REM INITIALIZE GIT
REM ============================================

echo [4/8] Initializing Git repository...

git init
git branch -M main

echo ✅ Git initialized

echo.

REM ============================================
REM INSTALL DEPENDENCIES
REM ============================================

echo [5/8] Installing dependencies...

echo Installing frontend dependencies...
call npm install --silent

echo Installing server dependencies...
cd server
call npm install --silent
cd ..

echo ✅ Dependencies installed

echo.

REM ============================================
REM BUILD PROJECT
REM ============================================

echo [6/8] Building project...

call npm run build

echo ✅ Build complete

echo.

REM ============================================
REM ADD AND COMMIT
REM ============================================

echo [7/8] Creating initial commit...

git add .
git commit -m "🎉 Initial commit: RAYR_Quant v1.0.0

- Professional trading dashboard with React + TypeScript
- TradingView webhook integration
- Zerodha Kite API support
- 4 proven trading strategies
- Complete risk management system
- Paper trading mode
- Full documentation

By Rayr-06 | github.com/Rayr-06"

echo ✅ Commit created

echo.

REM ============================================
REM PUSH TO GITHUB
REM ============================================

echo [8/8] Pushing to GitHub...
echo.
echo ⚠️  Make sure you have created the repository on GitHub first!
echo     Go to: https://github.com/new
echo     Name: %REPO_NAME%
echo.
pause

git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
git push -u origin main

echo.
echo  ══════════════════════════════════════════════════════════════
echo   ✅ SETUP COMPLETE!
echo  ══════════════════════════════════════════════════════════════
echo.
echo  📦 Repository: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.
echo  🚀 Next Steps:
echo     1. Start dashboard: npm run dev
echo     2. Start server: cd server ^& node webhook-server.js
echo     3. Start ngrok: ngrok http 3001
echo     4. Setup TradingView alerts
echo.
echo  📚 Documentation:
echo     - MANUAL.md (Complete guide)
echo     - QUICK_START.md (10-min setup)
echo     - INTEGRATION_GUIDE.md (TradingView)
echo.
echo  ══════════════════════════════════════════════════════════════
echo   Built with ^<3 by Rayr-06
echo  ══════════════════════════════════════════════════════════════
echo.

pause
