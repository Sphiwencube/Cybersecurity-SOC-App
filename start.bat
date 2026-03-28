@echo off
chcp 65001 >nul
cls

echo ==========================================
echo   SOC Guard - Quick Start
echo   Cybersecurity Incident Intelligence
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo [OK] Docker is installed and running
echo.

:menu
cls
echo What would you like to do?
echo.
echo 1) Start all services (first time or rebuild)
echo 2) Start services in background
echo 3) Stop all services
echo 4) View logs
echo 5) Restart services
echo 6) Reset database (WARNING: All data will be lost)
echo 7) Check service status
echo 8) Exit
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto start_services
if "%choice%"=="2" goto start_background
if "%choice%"=="3" goto stop_services
if "%choice%"=="4" goto view_logs
if "%choice%"=="5" goto restart_services
if "%choice%"=="6" goto reset_database
if "%choice%"=="7" goto check_status
if "%choice%"=="8" goto exit

echo Invalid choice. Please try again.
pause
goto menu

:start_services
echo Starting SOC Guard services...
echo This may take 2-3 minutes for the first time...
docker-compose up --build
pause
goto menu

:start_background
echo Starting SOC Guard services in background...
docker-compose up --build -d
echo.
echo [OK] Services started in background
echo.
echo Access the application at:
echo   Frontend: http://localhost:4200
echo   Backend API: http://localhost:8080
echo.
echo View logs with: docker-compose logs -f
pause
goto menu

:stop_services
echo Stopping SOC Guard services...
docker-compose down
echo [OK] Services stopped
pause
goto menu

:view_logs
echo Viewing logs (Press Ctrl+C to exit)...
docker-compose logs -f
pause
goto menu

:restart_services
echo Restarting SOC Guard services...
docker-compose restart
echo [OK] Services restarted
pause
goto menu

:reset_database
echo WARNING: This will delete all data!
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    echo Resetting database...
    docker-compose down -v
    docker-compose up --build
) else (
    echo Cancelled
)
pause
goto menu

:check_status
echo Checking service status...
echo.
docker-compose ps
echo.
pause
goto menu

:exit
echo Goodbye!
exit /b 0
