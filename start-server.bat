@echo off
REM MGPS Backend Server Startup Script for Windows

echo.
echo ============================================
echo     MGPS - Management and GPS System
echo     Node.js Backend Server
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm modules are installed
if not exist "node_modules" (
    echo Installing npm packages...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install npm packages
        pause
        exit /b 1
    )
)

echo.
echo Starting MGPS Server...
echo.
echo ============================================
call npm start

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Server failed to start
    echo Check your .env file configuration
    pause
    exit /b 1
)

pause
