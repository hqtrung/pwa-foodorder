# Frontend Server Management Scripts

This directory contains comprehensive server management scripts for the FoodOrder PWA frontend application.

## Available Scripts

### 1. Shell Script (Unix/Linux/macOS) - `server.sh`
```bash
# Make executable
chmod +x scripts/server.sh

# Usage
./scripts/server.sh [command]
```

### 2. Batch Script (Windows) - `server.bat`
```cmd
scripts\server.bat [command]
```

### 3. Node.js Script (Cross-platform) - `server.js`
```bash
# Direct usage
node scripts/server.js [command]

# Or via npm scripts (recommended)
npm run server:[command]
```

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `start` | Start development server on port 3001 | `npm run server:start` |
| `stop` | Stop the running server | `npm run server:stop` |
| `restart` | Restart the server (stop + start) | `npm run server:restart` |
| `status` | Show current server status | `npm run server:status` |
| `build` | Build project for production | `npm run server:build` |
| `prod` | Start production server | `npm run server:prod` |
| `clean` | Clean build artifacts and logs | `npm run server:clean` |
| `logs` | Show server logs | `npm run server:logs` |
| `dashboard` | Show real-time server dashboard | `npm run server:dashboard` |
| `help` | Show help message | `npm run server:help` |

## Features

### 🚀 **Process Management**
- **PID Tracking**: Stores process ID in `.server.pid` for reliable process management
- **Background Execution**: Runs server as background process
- **Graceful Shutdown**: Attempts graceful shutdown before force killing
- **Process Detection**: Checks if server is already running before starting

### 📋 **Logging**
- **Centralized Logs**: All output redirected to `server.log`
- **Real-time Monitoring**: View logs with `npm run server:logs`
- **Error Tracking**: Both stdout and stderr captured

### 🔧 **Build Management**
- **Auto-clean**: Removes `.next` directory before starting fresh
- **Production Mode**: Separate command for production builds
- **Build Verification**: Checks for existing builds before starting production

### 🌐 **Cross-platform Support**
- **Unix Shell**: Full-featured shell script for macOS/Linux
- **Windows Batch**: Native Windows batch script
- **Node.js**: Cross-platform JavaScript implementation

### 🎨 **User Experience**
- **Colored Output**: Color-coded status messages
- **Clear Feedback**: Informative success/error messages
- **Help System**: Built-in help with examples

## Configuration

The scripts use the following default settings:

```javascript
const PROJECT_NAME = 'FoodOrder PWA';
const PORT = 3001;
const PID_FILE = '.server.pid';
const LOG_FILE = 'server.log';
```

To change the port, modify the `PORT` variable in each script or use:
```bash
# Temporary port change
npm run dev -- --port 3002
```

## Usage Examples

### Daily Development Workflow

```bash
# Start development server
npm run server:start

# Check if running
npm run server:status

# View logs in real-time
npm run server:logs

# Restart after code changes
npm run server:restart

# Stop when done
npm run server:stop
```

### Production Deployment

```bash
# Clean previous builds
npm run server:clean

# Build for production
npm run server:build

# Start production server
npm run server:prod

# Monitor production logs
npm run server:logs
```

### Debugging Issues

```bash
# Check server status
npm run server:status

# View recent logs
npm run server:logs

# Clean and restart
npm run server:clean
npm run server:start
```

## File Structure

```
scripts/
├── README.md          # This documentation
├── server.sh          # Unix/Linux/macOS shell script
├── server.bat         # Windows batch script
└── server.js          # Cross-platform Node.js script
```

## Generated Files

When running the scripts, the following files are created:

- `.server.pid` - Stores the process ID of the running server
- `server.log` - Contains all server output and error logs

## NPM Scripts Integration

The following npm scripts are automatically added to `package.json`:

```json
{
  "scripts": {
    "server:start": "node scripts/server.js start",
    "server:stop": "node scripts/server.js stop", 
    "server:restart": "node scripts/server.js restart",
    "server:status": "node scripts/server.js status",
    "server:build": "node scripts/server.js build",
    "server:prod": "node scripts/server.js prod",
    "server:clean": "node scripts/server.js clean",
    "server:logs": "node scripts/server.js logs"
  }
}
```

## Troubleshooting

### Server won't start
1. Check if port 3001 is available: `lsof -i :3001` (macOS/Linux) or `netstat -ano | findstr :3001` (Windows)
2. Clean build artifacts: `npm run server:clean`
3. Check logs: `npm run server:logs`

### Server appears stuck
1. Force stop: `npm run server:stop`
2. Clean everything: `npm run server:clean`
3. Restart: `npm run server:start`

### Permission errors (Unix systems)
```bash
chmod +x scripts/server.sh
```

### Node.js script issues
Ensure you have Node.js installed:
```bash
node --version
npm --version
```

## Security Notes

- Scripts use process IDs for management, not port detection
- Graceful shutdown prevents data loss
- Background processes are properly detached
- Log files are created with appropriate permissions

## Contributing

When modifying these scripts:
1. Test on multiple platforms
2. Maintain backwards compatibility
3. Update this README with any new features
4. Ensure proper error handling