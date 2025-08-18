#!/usr/bin/env node

/**
 * Frontend Server Management Script (Cross-platform Node.js version)
 * Usage: node scripts/server.js [command]
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECT_NAME = 'FoodOrder PWA';
const PORT = 3001;
const PID_FILE = '.server.pid';
const LOG_FILE = 'server.log';

// Colors for output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

// Helper functions for colored output
function printStatus(message) {
    console.log(`${colors.green}[${PROJECT_NAME}]${colors.reset} ${message}`);
}

function printWarning(message) {
    console.log(`${colors.yellow}[${PROJECT_NAME}]${colors.reset} ${message}`);
}

function printError(message) {
    console.log(`${colors.red}[${PROJECT_NAME}]${colors.reset} ${message}`);
}

function printInfo(message) {
    console.log(`${colors.blue}[${PROJECT_NAME}]${colors.reset} ${message}`);
}

// Check if process is running
function isRunning() {
    if (!fs.existsSync(PID_FILE)) {
        return false;
    }

    try {
        const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
        if (isNaN(pid)) {
            fs.unlinkSync(PID_FILE);
            return false;
        }

        // Check if process exists
        try {
            process.kill(pid, 0); // Signal 0 checks if process exists without actually killing it
            return true;
        } catch (e) {
            fs.unlinkSync(PID_FILE);
            return false;
        }
    } catch (e) {
        return false;
    }
}

// Get server status
function status() {
    if (isRunning()) {
        const pid = fs.readFileSync(PID_FILE, 'utf8').trim();
        printStatus(`Server is running (PID: ${pid}) on http://localhost:${PORT}`);
        return true;
    } else {
        printWarning('Server is not running');
        return false;
    }
}

// Start the server
function start() {
    if (isRunning()) {
        printWarning('Server is already running');
        status();
        return;
    }

    printInfo(`Starting development server on port ${PORT}...`);

    // Clean previous build if needed
    if (fs.existsSync('.next')) {
        printInfo('Cleaning previous build...');
        fs.rmSync('.next', { recursive: true, force: true });
    }

    // Start the server
    const isWindows = os.platform() === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    
    const serverProcess = spawn(npmCmd, ['run', 'dev', '--', '--port', PORT.toString()], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    // Write PID to file
    fs.writeFileSync(PID_FILE, serverProcess.pid.toString());

    // Setup logging
    const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });
    serverProcess.stdout.pipe(logStream);
    serverProcess.stderr.pipe(logStream);

    // Detach the process so it continues running
    serverProcess.unref();

    // Wait a moment and check if it started successfully
    setTimeout(() => {
        if (isRunning()) {
            printStatus(`Server started successfully (PID: ${serverProcess.pid})`);
            printInfo(`Server URL: http://localhost:${PORT}`);
            printInfo(`Logs: tail -f ${LOG_FILE} (or npm run server:logs)`);
        } else {
            printError('Failed to start server');
            process.exit(1);
        }
    }, 3000);
}

// Stop the server
function stop() {
    if (!isRunning()) {
        printWarning('Server is not running');
        return;
    }

    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
    printInfo(`Stopping server (PID: ${pid})...`);

    try {
        // Kill the process and all its children
        if (os.platform() === 'win32') {
            exec(`taskkill /pid ${pid} /f /t`, (error) => {
                if (error) {
                    printWarning(`Error stopping process: ${error.message}`);
                }
            });
        } else {
            // Kill process group to ensure all child processes are terminated
            try {
                process.kill(-pid, 'SIGTERM');
            } catch (e) {
                process.kill(pid, 'SIGTERM');
            }
            
            // Wait for graceful shutdown, then force kill if needed
            setTimeout(() => {
                try {
                    process.kill(pid, 0);
                    // Still running, force kill
                    try {
                        process.kill(-pid, 'SIGKILL');
                    } catch (e) {
                        process.kill(pid, 'SIGKILL');
                    }
                } catch (e) {
                    // Process already terminated
                }
            }, 2000);
        }

        fs.unlinkSync(PID_FILE);
        printStatus('Server stopped');
    } catch (error) {
        printError(`Error stopping server: ${error.message}`);
        // Clean up PID file anyway
        if (fs.existsSync(PID_FILE)) {
            fs.unlinkSync(PID_FILE);
        }
    }
}

// Restart the server
function restart() {
    printInfo('Restarting server...');
    stop();
    setTimeout(() => {
        start();
    }, 1000);
}

// Build the project
function build() {
    printInfo('Building project for production...');
    
    const isWindows = os.platform() === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    
    const buildProcess = spawn(npmCmd, ['run', 'build'], {
        stdio: 'inherit'
    });

    buildProcess.on('close', (code) => {
        if (code === 0) {
            printStatus('Build completed successfully');
        } else {
            printError('Build failed');
            process.exit(1);
        }
    });
}

// Start production server
function startProd() {
    if (isRunning()) {
        printWarning('Development server is running. Stop it first.');
        return;
    }

    printInfo(`Starting production server on port ${PORT}...`);

    // Build first if .next doesn't exist
    if (!fs.existsSync('.next')) {
        printInfo('Building project first...');
        build();
        return; // Build process will handle the rest
    }

    const isWindows = os.platform() === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    
    const serverProcess = spawn(npmCmd, ['start', '--', '--port', PORT.toString()], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    fs.writeFileSync(PID_FILE, serverProcess.pid.toString());

    const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });
    serverProcess.stdout.pipe(logStream);
    serverProcess.stderr.pipe(logStream);

    serverProcess.unref();

    setTimeout(() => {
        if (isRunning()) {
            printStatus(`Production server started (PID: ${serverProcess.pid})`);
            printInfo(`Server URL: http://localhost:${PORT}`);
        } else {
            printError('Failed to start production server');
            process.exit(1);
        }
    }, 3000);
}

// Clean build artifacts
function clean() {
    printInfo('Cleaning build artifacts...');
    
    const filesToClean = ['.next', 'out', LOG_FILE, PID_FILE];
    
    filesToClean.forEach(file => {
        if (fs.existsSync(file)) {
            if (fs.statSync(file).isDirectory()) {
                fs.rmSync(file, { recursive: true, force: true });
            } else {
                fs.unlinkSync(file);
            }
        }
    });
    
    printStatus('Clean completed');
}

// Show logs
function logs() {
    if (!fs.existsSync(LOG_FILE)) {
        printWarning('No log file found. Server may not be running.');
        return;
    }

    // For cross-platform log following, we'll just show the current content
    // In a real implementation, you might want to use a package like 'tail' for following
    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    console.log(logContent);
    
    printInfo(`To follow logs in real-time, use: tail -f ${LOG_FILE}`);
}

// Show help
function help() {
    console.log(`${colors.blue}Frontend Server Management Script${colors.reset}`);
    console.log('');
    console.log('Usage: node scripts/server.js [command]');
    console.log('   or: npm run server:[command]');
    console.log('');
    console.log('Commands:');
    console.log('  start      Start development server');
    console.log('  stop       Stop server');
    console.log('  restart    Restart server');
    console.log('  status     Show server status');
    console.log('  build      Build for production');
    console.log('  prod       Start production server');
    console.log('  clean      Clean build artifacts');
    console.log('  logs       Show server logs');
    console.log('  help       Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/server.js start    # Start development server');
    console.log('  npm run server:restart          # Restart server');
    console.log('  npm run server:logs             # Show server logs');
}

// Main script logic
const command = process.argv[2] || 'help';

switch (command) {
    case 'start':
        start();
        break;
    case 'stop':
        stop();
        break;
    case 'restart':
        restart();
        break;
    case 'status':
        status();
        break;
    case 'build':
        build();
        break;
    case 'prod':
        startProd();
        break;
    case 'clean':
        clean();
        break;
    case 'logs':
        logs();
        break;
    case 'help':
    case '--help':
    case '-h':
        help();
        break;
    default:
        printError(`Unknown command: ${command}`);
        help();
        process.exit(1);
}