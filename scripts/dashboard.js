#!/usr/bin/env node

/**
 * Frontend Server Dashboard
 * Shows real-time server status and useful information
 */

const fs = require('fs');
const { spawn } = require('child_process');
const os = require('os');

const PROJECT_NAME = 'FoodOrder PWA';
const PORT = 3001;
const PID_FILE = '.server.pid';
const LOG_FILE = 'server.log';

// Colors
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bright: '\x1b[1m'
};

function clearScreen() {
    console.clear();
}

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function getServerStatus() {
    if (!fs.existsSync(PID_FILE)) {
        return { running: false };
    }

    try {
        const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
        if (isNaN(pid)) {
            return { running: false };
        }

        try {
            process.kill(pid, 0);
            
            // Get process start time (Unix only)
            let uptime = 'Unknown';
            if (os.platform() !== 'win32') {
                try {
                    const stat = fs.statSync(`/proc/${pid}`);
                    const startTime = stat.birthtime || stat.ctime;
                    const uptimeSeconds = (Date.now() - startTime.getTime()) / 1000;
                    uptime = formatUptime(uptimeSeconds);
                } catch (e) {
                    // Fallback to file creation time
                    try {
                        const pidStat = fs.statSync(PID_FILE);
                        const uptimeSeconds = (Date.now() - pidStat.birthtime.getTime()) / 1000;
                        uptime = formatUptime(uptimeSeconds);
                    } catch (e2) {
                        uptime = 'Unknown';
                    }
                }
            }

            return {
                running: true,
                pid: pid,
                uptime: uptime
            };
        } catch (e) {
            return { running: false };
        }
    } catch (e) {
        return { running: false };
    }
}

function getLogStats() {
    if (!fs.existsSync(LOG_FILE)) {
        return { exists: false };
    }

    try {
        const stats = fs.statSync(LOG_FILE);
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        // Count different types of log entries
        const errors = lines.filter(line => 
            line.toLowerCase().includes('error') || 
            line.toLowerCase().includes('failed')
        ).length;
        
        const warnings = lines.filter(line => 
            line.toLowerCase().includes('warn')
        ).length;

        return {
            exists: true,
            size: (stats.size / 1024).toFixed(1), // KB
            lines: lines.length,
            errors: errors,
            warnings: warnings,
            modified: stats.mtime.toLocaleString()
        };
    } catch (e) {
        return { exists: false };
    }
}

function getSystemInfo() {
    return {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: {
            total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(1), // GB
            free: (os.freemem() / 1024 / 1024 / 1024).toFixed(1), // GB
            used: ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(1) // GB
        },
        loadAvg: os.loadavg().map(avg => avg.toFixed(2))
    };
}

function drawDashboard() {
    clearScreen();
    
    const status = getServerStatus();
    const logStats = getLogStats();
    const sysInfo = getSystemInfo();
    
    console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║                     ${PROJECT_NAME} Dashboard                    ║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('');

    // Server Status
    console.log(`${colors.bright}${colors.blue}🖥️  Server Status${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    if (status.running) {
        console.log(`   Status: ${colors.bright}${colors.green}🟢 RUNNING${colors.reset}`);
        console.log(`   PID: ${colors.yellow}${status.pid}${colors.reset}`);
        console.log(`   Port: ${colors.yellow}${PORT}${colors.reset}`);
        console.log(`   URL: ${colors.blue}http://localhost:${PORT}${colors.reset}`);
        console.log(`   Uptime: ${colors.magenta}${status.uptime}${colors.reset}`);
    } else {
        console.log(`   Status: ${colors.bright}${colors.red}🔴 STOPPED${colors.reset}`);
        console.log(`   Port: ${colors.yellow}${PORT}${colors.reset}`);
        console.log(`   URL: ${colors.yellow}Not available${colors.reset}`);
    }
    console.log('');

    // Log Information
    console.log(`${colors.bright}${colors.blue}📋 Log Information${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    if (logStats.exists) {
        console.log(`   File: ${colors.yellow}${LOG_FILE}${colors.reset}`);
        console.log(`   Size: ${colors.magenta}${logStats.size} KB${colors.reset}`);
        console.log(`   Lines: ${colors.magenta}${logStats.lines}${colors.reset}`);
        
        if (logStats.errors > 0) {
            console.log(`   Errors: ${colors.red}${logStats.errors}${colors.reset}`);
        } else {
            console.log(`   Errors: ${colors.green}0${colors.reset}`);
        }
        
        if (logStats.warnings > 0) {
            console.log(`   Warnings: ${colors.yellow}${logStats.warnings}${colors.reset}`);
        } else {
            console.log(`   Warnings: ${colors.green}0${colors.reset}`);
        }
        
        console.log(`   Modified: ${colors.blue}${logStats.modified}${colors.reset}`);
    } else {
        console.log(`   Status: ${colors.yellow}No log file found${colors.reset}`);
    }
    console.log('');

    // System Information
    console.log(`${colors.bright}${colors.blue}🖥️  System Information${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`   Platform: ${colors.yellow}${sysInfo.platform} (${sysInfo.arch})${colors.reset}`);
    console.log(`   Node.js: ${colors.green}${sysInfo.nodeVersion}${colors.reset}`);
    console.log(`   Memory: ${colors.magenta}${sysInfo.memory.used}GB used / ${sysInfo.memory.total}GB total${colors.reset}`);
    
    if (sysInfo.platform !== 'win32') {
        console.log(`   Load Avg: ${colors.blue}${sysInfo.loadAvg.join(', ')}${colors.reset}`);
    }
    console.log('');

    // Quick Commands
    console.log(`${colors.bright}${colors.blue}⚡ Quick Commands${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    if (status.running) {
        console.log(`   ${colors.green}npm run server:stop${colors.reset}     - Stop server`);
        console.log(`   ${colors.green}npm run server:restart${colors.reset}  - Restart server`);
        console.log(`   ${colors.green}npm run server:logs${colors.reset}     - View logs`);
    } else {
        console.log(`   ${colors.green}npm run server:start${colors.reset}    - Start server`);
        console.log(`   ${colors.green}npm run server:build${colors.reset}    - Build project`);
        console.log(`   ${colors.green}npm run server:clean${colors.reset}    - Clean artifacts`);
    }
    console.log(`   ${colors.green}npm run server:status${colors.reset}   - Check status`);
    console.log('');

    // Footer
    const timestamp = new Date().toLocaleString();
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}Last updated: ${timestamp} | Press Ctrl+C to exit${colors.reset}`);
}

// Main dashboard loop
function startDashboard() {
    drawDashboard();
    
    // Refresh every 5 seconds
    const interval = setInterval(drawDashboard, 5000);
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        clearInterval(interval);
        console.log(`\n${colors.green}Dashboard closed.${colors.reset}`);
        process.exit(0);
    });
}

// Check if this script is being run directly
if (require.main === module) {
    console.log(`${colors.bright}${colors.green}Starting ${PROJECT_NAME} Dashboard...${colors.reset}`);
    setTimeout(startDashboard, 1000);
}