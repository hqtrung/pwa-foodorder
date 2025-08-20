# Suggested Commands

## Development Commands

### Start Development
```bash
npm run dev              # Start development server on http://localhost:3000
```

### Build and Production
```bash
npm run build           # Build for production
npm start              # Start production server
npm run analyze        # Build with bundle analyzer (ANALYZE=true npm run build)
```

### Code Quality
```bash
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript type checking (not available by default)
```

## System Commands (Darwin/macOS)

### File Operations
```bash
ls -la                 # List files with details
find . -name "*.tsx"   # Find TypeScript React files
grep -r "searchterm"   # Search in files
```

### Git Operations
```bash
git status            # Check repository status
git add .             # Stage all changes
git commit -m "message" # Commit changes
git push              # Push to remote
```

### Development Tools
```bash
open -a "Visual Studio Code" /path/to/file  # Open in VS Code
```

## Firebase Commands (if Firebase CLI is installed)
```bash
firebase deploy       # Deploy to Firebase
firebase serve        # Test locally with Firebase
```

## Node.js/npm Management
```bash
npm install           # Install dependencies
npm audit             # Check for vulnerabilities
npm update            # Update dependencies
```

## PWA Testing
- Test PWA functionality in Chrome DevTools
- Check Application tab for service worker status
- Test offline functionality
- Verify manifest.json configuration

## Internationalization Testing
- Test all language variants
- Verify translation completeness
- Check locale-based routing