@echo off
REM ============================================
REM QUICK GITHUB SETUP SCRIPT (Windows)
REM ============================================
REM Run this script to push to GitHub
REM Usage: Double-click setup-github.bat
REM ============================================

echo.
echo =========================================
echo Rayr QuantForge GitHub Setup
echo =========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Get GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "

REM Get repository name
set /p REPO_NAME="Enter repository name (rayr-quantforge): "
if "%REPO_NAME%"=="" set REPO_NAME=rayr-quantforge

echo.
echo Setup Steps:
echo 1. Create repository on GitHub first!
echo    Go to: https://github.com/new
echo    Name: %REPO_NAME%
echo    DO NOT add README, .gitignore, or license
echo.
pause

REM Initialize git
echo.
echo Initializing git...
git init

REM Add files
echo Adding files...
git add .

REM Commit
echo Committing...
git commit -m "Initial commit: Rayr QuantForge - Trading System"

REM Add remote
echo Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

REM Push
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo =========================================
echo DONE! Repository pushed to GitHub
echo =========================================
echo.
echo View your repository:
echo https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.

pause
