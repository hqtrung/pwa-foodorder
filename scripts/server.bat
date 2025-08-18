@echo off
REM Frontend Server Management Script for Windows
REM Usage: scripts\server.bat [command]

setlocal enabledelayedexpansion

set PROJECT_NAME=FoodOrder PWA
set PORT=3001
set PID_FILE=.server.pid

REM Function to print status messages
:print_status
echo [%PROJECT_NAME%] %~1
goto :eof

:print_warning
echo [%PROJECT_NAME%] WARNING: %~1
goto :eof

:print_error
echo [%PROJECT_NAME%] ERROR: %~1
goto :eof

:print_info
echo [%PROJECT_NAME%] INFO: %~1
goto :eof

REM Function to check if server is running
:is_running
if exist "%PID_FILE%" (
    set /p pid=<"%PID_FILE%"
    tasklist /fi "pid eq !pid!" 2>nul | find "!pid!" >nul
    if !errorlevel! equ 0 (
        exit /b 0
    ) else (
        del "%PID_FILE%" 2>nul
        exit /b 1
    )
)
exit /b 1

REM Function to get server status
:status
call :is_running
if !errorlevel! equ 0 (
    set /p pid=<"%PID_FILE%"
    call :print_status "Server is running (PID: !pid!) on http://localhost:%PORT%"
    exit /b 0
) else (
    call :print_warning "Server is not running"
    exit /b 1
)

REM Function to start the server
:start
call :is_running
if !errorlevel! equ 0 (
    call :print_warning "Server is already running"
    call :status
    goto :eof
)

call :print_info "Starting development server on port %PORT%..."

REM Clean previous build if needed
if exist ".next" (
    call :print_info "Cleaning previous build..."
    rmdir /s /q .next 2>nul
)

REM Start the server in background
start /b cmd /c "npm run dev -- --port %PORT% > server.log 2>&1"

REM Get the PID (simplified approach for Windows)
timeout /t 2 /nobreak >nul

REM Find the node process running on our port
for /f "tokens=2" %%i in ('netstat -ano ^| findstr ":%PORT%"') do (
    echo %%i > "%PID_FILE%"
    goto :found_pid
)

:found_pid
call :print_status "Server started successfully"
call :print_info "Server URL: http://localhost:%PORT%"
call :print_info "Logs: type server.log"
goto :eof

REM Function to stop the server
:stop
call :is_running
if !errorlevel! neq 0 (
    call :print_warning "Server is not running"
    goto :eof
)

set /p pid=<"%PID_FILE%"
call :print_info "Stopping server (PID: !pid!)..."

REM Kill the process
taskkill /pid !pid! /f /t >nul 2>&1

del "%PID_FILE%" 2>nul
call :print_status "Server stopped"
goto :eof

REM Function to restart the server
:restart
call :print_info "Restarting server..."
call :stop
timeout /t 1 /nobreak >nul
call :start
goto :eof

REM Function to build the project
:build
call :print_info "Building project for production..."
npm run build
if !errorlevel! equ 0 (
    call :print_status "Build completed successfully"
) else (
    call :print_error "Build failed"
    exit /b 1
)
goto :eof

REM Function to start production server
:start_prod
call :is_running
if !errorlevel! equ 0 (
    call :print_warning "Development server is running. Stop it first."
    goto :eof
)

call :print_info "Starting production server on port %PORT%..."

REM Build first if .next doesn't exist
if not exist ".next" (
    call :build
)

REM Start production server
start /b cmd /c "npm start -- --port %PORT% > server.log 2>&1"

timeout /t 2 /nobreak >nul
call :print_status "Production server started"
call :print_info "Server URL: http://localhost:%PORT%"
goto :eof

REM Function to clean build artifacts
:clean
call :print_info "Cleaning build artifacts..."
rmdir /s /q .next 2>nul
rmdir /s /q out 2>nul
del server.log 2>nul
del "%PID_FILE%" 2>nul
call :print_status "Clean completed"
goto :eof

REM Function to show logs
:logs
if exist "server.log" (
    type server.log
) else (
    call :print_warning "No log file found. Server may not be running."
)
goto :eof

REM Function to show help
:help
echo Frontend Server Management Script
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   start      Start development server
echo   stop       Stop server
echo   restart    Restart server
echo   status     Show server status
echo   build      Build for production
echo   prod       Start production server
echo   clean      Clean build artifacts
echo   logs       Show server logs
echo   help       Show this help message
echo.
echo Examples:
echo   %0 start           # Start development server
echo   %0 restart         # Restart server
echo   %0 logs            # Show server logs
goto :eof

REM Main script logic
set command=%1
if "%command%"=="" set command=help

if "%command%"=="start" (
    call :start
) else if "%command%"=="stop" (
    call :stop
) else if "%command%"=="restart" (
    call :restart
) else if "%command%"=="status" (
    call :status
) else if "%command%"=="build" (
    call :build
) else if "%command%"=="prod" (
    call :start_prod
) else if "%command%"=="clean" (
    call :clean
) else if "%command%"=="logs" (
    call :logs
) else if "%command%"=="help" (
    call :help
) else if "%command%"=="--help" (
    call :help
) else if "%command%"=="-h" (
    call :help
) else (
    call :print_error "Unknown command: %command%"
    call :help
    exit /b 1
)