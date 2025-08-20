#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getAllKeys, loadTranslationFile } = require('./check-translations');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj;
  }
  
  const sorted = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  
  return sorted;
}

function findDuplicateSections(obj, seen = new Map(), path = '') {
  const duplicates = [];
  
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return duplicates;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Check if this object structure already exists
      const valueString = JSON.stringify(value);
      
      if (seen.has(valueString)) {
        const existingPaths = seen.get(valueString);
        duplicates.push({
          key,
          currentPath,
          duplicatePaths: existingPaths,
          value
        });
        existingPaths.push(currentPath);
      } else {
        seen.set(valueString, [currentPath]);
      }
      
      // Recursively check nested objects
      duplicates.push(...findDuplicateSections(value, seen, currentPath));
    }
  }
  
  return duplicates;
}

function removeDuplicateSections(obj, masterTranslations, lang) {
  const masterKeys = getAllKeys(masterTranslations);
  const currentKeys = getAllKeys(obj);
  
  // Find keys that don't exist in master (these might be duplicates)
  const extraKeys = currentKeys.filter(key => !masterKeys.includes(key));
  
  if (extraKeys.length === 0) {
    return { cleaned: obj, removed: [] };
  }
  
  console.log(colorize(`  🔍 ${lang.toUpperCase()}: Found ${extraKeys.length} potential duplicate/extra keys`, 'yellow'));
  
  // Create a clean copy by only including keys that exist in master
  const cleaned = {};
  
  function copyValidPaths(source, target, validKeys, currentPath = '') {
    for (const [key, value] of Object.entries(source)) {
      const fullPath = currentPath ? `${currentPath}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Check if any valid keys start with this path
        const hasValidChildren = validKeys.some(validKey => validKey.startsWith(fullPath + '.'));
        
        if (hasValidChildren) {
          target[key] = {};
          copyValidPaths(value, target[key], validKeys, fullPath);
        }
      } else {
        // Only copy if this key exists in master
        if (validKeys.includes(fullPath)) {
          target[key] = value;
        }
      }
    }
  }
  
  copyValidPaths(obj, cleaned, masterKeys);
  
  return { cleaned, removed: extraKeys };
}

function cleanTranslationFile(filePath, masterTranslations, lang, options = {}) {
  const { dryRun = false, sortKeys = true, removeDuplicates = true } = options;
  
  console.log(colorize(`🧹 Cleaning ${lang.toUpperCase()}...`, 'blue'));
  
  const originalTranslations = loadTranslationFile(filePath);
  if (!originalTranslations) {
    console.log(colorize(`  ❌ Failed to load ${filePath}`, 'red'));
    return false;
  }
  
  let cleaned = JSON.parse(JSON.stringify(originalTranslations)); // Deep copy
  let changes = [];
  
  // Remove duplicate/extra sections
  if (removeDuplicates) {
    const result = removeDuplicateSections(cleaned, masterTranslations, lang);
    cleaned = result.cleaned;
    
    if (result.removed.length > 0) {
      changes.push(`Removed ${result.removed.length} duplicate/extra keys`);
      
      if (options.verbose) {
        console.log(colorize(`    Removed keys: ${result.removed.slice(0, 5).join(', ')}${result.removed.length > 5 ? '...' : ''}`, 'yellow'));
      }
    }
  }
  
  // Sort keys alphabetically
  if (sortKeys) {
    const originalString = JSON.stringify(cleaned);
    cleaned = sortObjectKeys(cleaned);
    const sortedString = JSON.stringify(cleaned);
    
    if (originalString !== sortedString) {
      changes.push('Sorted keys alphabetically');
    }
  }
  
  if (changes.length === 0) {
    console.log(colorize(`  ✅ Already clean`, 'green'));
    return true;
  }
  
  console.log(colorize(`  🔧 Changes: ${changes.join(', ')}`, 'blue'));
  
  if (!dryRun) {
    // Write the cleaned file
    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2) + '\n');
    console.log(colorize(`    💾 Updated ${filePath}`, 'green'));
  }
  
  return true;
}

function cleanAllTranslations(options = {}) {
  const messagesDir = path.join(process.cwd(), 'messages');
  const languages = ['en', 'fr', 'it', 'ja', 'vi', 'zh'];
  
  console.log(colorize('🧹 Translation Cleanup', 'bright'));
  console.log(colorize('======================', 'cyan'));
  
  if (options.dryRun) {
    console.log(colorize('📋 DRY RUN MODE - No files will be modified', 'yellow'));
  }
  
  console.log();
  
  // Load English as master reference
  const masterPath = path.join(messagesDir, 'en.json');
  const masterTranslations = loadTranslationFile(masterPath);
  
  if (!masterTranslations) {
    console.log(colorize('❌ Failed to load master translation file (en.json)', 'red'));
    return false;
  }
  
  let totalCleaned = 0;
  
  for (const lang of languages) {
    const filePath = path.join(messagesDir, `${lang}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(colorize(`  ⚠️  File not found: ${lang}.json`, 'yellow'));
      continue;
    }
    
    const success = cleanTranslationFile(filePath, masterTranslations, lang, options);
    if (success) {
      totalCleaned++;
    }
    
    console.log();
  }
  
  console.log(colorize('======================', 'cyan'));
  console.log(colorize(`📊 Summary: Cleaned ${totalCleaned}/${languages.length} files`, 'bright'));
  
  if (totalCleaned > 0 && !options.dryRun) {
    console.log();
    console.log(colorize('🎯 Next Steps:', 'bright'));
    console.log(colorize('1. Review the cleaned files', 'blue'));
    console.log(colorize('2. Run "npm run translations:check" to verify', 'blue'));
    console.log(colorize('3. Test your application to ensure everything works', 'blue'));
  }
  
  return true;
}

function backupTranslations() {
  const messagesDir = path.join(process.cwd(), 'messages');
  const backupDir = path.join(process.cwd(), 'messages-backup');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupSubDir = path.join(backupDir, `backup-${timestamp}`);
  fs.mkdirSync(backupSubDir);
  
  const files = fs.readdirSync(messagesDir).filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    const sourcePath = path.join(messagesDir, file);
    const backupPath = path.join(backupSubDir, file);
    fs.copyFileSync(sourcePath, backupPath);
  }
  
  console.log(colorize(`💾 Backup created: ${backupSubDir}`, 'green'));
  return backupSubDir;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    sortKeys: !args.includes('--no-sort'),
    removeDuplicates: !args.includes('--no-dedup'),
    backup: !args.includes('--no-backup')
  };
  
  if (args.includes('--help')) {
    console.log(`
Translation Cleanup Tool

Usage: node clean-translations.js [options]

Options:
  --dry-run       Show what would be changed without modifying files
  --verbose       Show detailed output
  --no-sort       Don't sort keys alphabetically
  --no-dedup      Don't remove duplicate sections
  --no-backup     Don't create backup before cleaning
  --help          Show this help message

Examples:
  node clean-translations.js                 # Clean all files with backup
  node clean-translations.js --dry-run       # Preview changes
  node clean-translations.js --no-backup     # Clean without backup
`);
    process.exit(0);
  }
  
  // Create backup unless disabled
  if (options.backup && !options.dryRun) {
    console.log(colorize('📦 Creating backup before cleaning...', 'blue'));
    backupTranslations();
    console.log();
  }
  
  const success = cleanAllTranslations(options);
  process.exit(success ? 0 : 1);
}

module.exports = {
  cleanTranslationFile,
  cleanAllTranslations,
  removeDuplicateSections,
  sortObjectKeys,
  backupTranslations
};