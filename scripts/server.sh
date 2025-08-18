#!/bin/bash

# Frontend Server Management Script
# Usage: ./scripts/server.sh [command]

set -e

PROJECT_NAME="FoodOrder PWA"
PORT=3001
PID_FILE=".server.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[${PROJECT_NAME}]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[${PROJECT_NAME}]${NC} $1"
}

print_error() {
    echo -e "${RED}[${PROJECT_NAME}]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[${PROJECT_NAME}]${NC} $1"
}

# Function to check if server is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Function to get server status
status() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        print_status "Server is running (PID: $pid) on http://localhost:$PORT"
        return 0
    else
        print_warning "Server is not running"
        return 1
    fi
}

# Function to start the server
start() {
    if is_running; then
        print_warning "Server is already running"
        status
        return 0
    fi

    print_info "Starting development server on port $PORT..."
    
    # Clean previous build if needed
    if [ -d ".next" ]; then
        print_info "Cleaning previous build..."
        rm -rf .next
    fi
    
    # Start the server in background
    nohup npm run dev -- --port $PORT > server.log 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # Wait a moment and check if it started successfully
    sleep 3
    if is_running; then
        print_status "Server started successfully (PID: $pid)"
        print_info "Server URL: http://localhost:$PORT"
        print_info "Logs: tail -f server.log"
    else
        print_error "Failed to start server"
        return 1
    fi
}

# Function to stop the server
stop() {
    if ! is_running; then
        print_warning "Server is not running"
        return 0
    fi

    local pid=$(cat "$PID_FILE")
    print_info "Stopping server (PID: $pid)..."
    
    # Kill the process and all its children
    pkill -P $pid 2>/dev/null || true
    kill $pid 2>/dev/null || true
    
    # Wait for graceful shutdown
    sleep 2
    
    # Force kill if still running
    if ps -p "$pid" > /dev/null 2>&1; then
        kill -9 $pid 2>/dev/null || true
    fi
    
    rm -f "$PID_FILE"
    print_status "Server stopped"
}

# Function to restart the server
restart() {
    print_info "Restarting server..."
    stop
    sleep 1
    start
}

# Function to build the project
build() {
    print_info "Building project for production..."
    npm run build
    if [ $? -eq 0 ]; then
        print_status "Build completed successfully"
    else
        print_error "Build failed"
        return 1
    fi
}

# Function to start production server
start_prod() {
    if is_running; then
        print_warning "Development server is running. Stop it first."
        return 1
    fi

    print_info "Starting production server on port $PORT..."
    
    # Build first if .next doesn't exist
    if [ ! -d ".next" ]; then
        build
    fi
    
    # Start production server
    nohup npm start -- --port $PORT > server.log 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    sleep 3
    if is_running; then
        print_status "Production server started (PID: $pid)"
        print_info "Server URL: http://localhost:$PORT"
    else
        print_error "Failed to start production server"
        return 1
    fi
}

# Function to clean build artifacts
clean() {
    print_info "Cleaning build artifacts..."
    rm -rf .next
    rm -rf out
    rm -f server.log
    rm -f "$PID_FILE"
    print_status "Clean completed"
}

# Function to show logs
logs() {
    if [ -f "server.log" ]; then
        tail -f server.log
    else
        print_warning "No log file found. Server may not be running."
    fi
}

# Function to show help
help() {
    echo -e "${BLUE}Frontend Server Management Script${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start      Start development server"
    echo "  stop       Stop server"
    echo "  restart    Restart server"
    echo "  status     Show server status"
    echo "  build      Build for production"
    echo "  prod       Start production server"
    echo "  clean      Clean build artifacts"
    echo "  logs       Show server logs"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start           # Start development server"
    echo "  $0 restart         # Restart server"
    echo "  $0 logs            # Follow server logs"
}

# Main script logic
case "${1:-help}" in
    "start")
        start
        ;;
    "stop")
        stop
        ;;
    "restart")
        restart
        ;;
    "status")
        status
        ;;
    "build")
        build
        ;;
    "prod")
        start_prod
        ;;
    "clean")
        clean
        ;;
    "logs")
        logs
        ;;
    "help"|"--help"|"-h")
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac