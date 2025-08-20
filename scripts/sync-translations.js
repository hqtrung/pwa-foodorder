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

function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function setValueByPath(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  let current = obj;
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

function syncTranslation(masterTranslations, targetTranslations, targetLang, options = {}) {
  const { 
    preserveExisting = true, 
    markMissing = true, 
    missingPrefix = '[TRANSLATE]',
    dryRun = false 
  } = options;
  
  const masterKeys = getAllKeys(masterTranslations);
  const targetKeys = getAllKeys(targetTranslations);
  const missingKeys = masterKeys.filter(key => !targetKeys.includes(key));
  
  if (missingKeys.length === 0) {
    console.log(colorize(`  ✅ ${targetLang.toUpperCase()}: Already up to date`, 'green'));
    return { synced: 0, skipped: 0 };
  }
  
  let synced = 0;
  let skipped = 0;
  
  console.log(colorize(`  🔄 ${targetLang.toUpperCase()}: Syncing ${missingKeys.length} missing keys...`, 'blue'));
  
  const updatedTranslations = JSON.parse(JSON.stringify(targetTranslations)); // Deep copy
  
  for (const key of missingKeys) {
    const masterValue = getValueByPath(masterTranslations, key);
    
    if (masterValue !== undefined) {
      let newValue;
      
      if (markMissing && typeof masterValue === 'string') {
        // Mark string values that need translation
        newValue = `${missingPrefix} ${masterValue}`;
      } else {
        // Copy other types directly (numbers, booleans, etc.)
        newValue = masterValue;
      }
      
      if (!dryRun) {
        setValueByPath(updatedTranslations, key, newValue);
      }
      
      synced++;
      
      if (options.verbose) {
        console.log(colorize(`    + ${key}: "${newValue}"`, 'green'));
      }
    } else {
      skipped++;
      console.log(colorize(`    ⚠️  Skipped ${key}: value not found in master`, 'yellow'));
    }
  }
  
  if (!dryRun && synced > 0) {
    // Write the updated file
    const filePath = path.join(process.cwd(), 'messages', `${targetLang}.json`);
    fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2) + '\n');
    console.log(colorize(`    💾 Updated ${filePath}`, 'green'));
  }
  
  console.log(colorize(`    📊 Result: ${synced} synced, ${skipped} skipped`, 'blue'));
  
  return { synced, skipped };
}

function syncAllTranslations(options = {}) {
  const messagesDir = path.join(process.cwd(), 'messages');
  const languages = ['fr', 'it', 'ja', 'vi', 'zh']; // Skip English as it's the master
  
  console.log(colorize('🔄 Translation Synchronization', 'bright'));
  console.log(colorize('=================================', 'cyan'));
  
  if (options.dryRun) {
    console.log(colorize('📋 DRY RUN MODE - No files will be modified', 'yellow'));
  }
  
  console.log();
  
  // Load English as master
  const masterTranslations = loadTranslationFile(path.join(messagesDir, 'en.json'));
  if (!masterTranslations) {
    console.log(colorize('❌ Failed to load master translation file (en.json)', 'red'));
    return false;
  }
  
  const masterKeys = getAllKeys(masterTranslations);
  console.log(colorize(`📋 Master keys from English: ${masterKeys.length} total`, 'blue'));
  console.log();
  
  let totalSynced = 0;
  let totalSkipped = 0;
  
  for (const lang of languages) {
    const filePath = path.join(messagesDir, `${lang}.json`);
    const targetTranslations = loadTranslationFile(filePath);
    
    if (!targetTranslations) {
      console.log(colorize(`  ❌ Failed to load ${lang}.json`, 'red'));
      continue;
    }
    
    const result = syncTranslation(masterTranslations, targetTranslations, lang, options);
    totalSynced += result.synced;
    totalSkipped += result.skipped;
    
    console.log();
  }
  
  console.log(colorize('=================================', 'cyan'));
  console.log(colorize(`📊 Summary: ${totalSynced} keys synced, ${totalSkipped} skipped`, 'bright'));
  
  if (totalSynced > 0) {
    console.log();
    console.log(colorize('🎯 Next Steps:', 'bright'));
    console.log(colorize('1. Review files with [TRANSLATE] markers', 'blue'));
    console.log(colorize('2. Replace [TRANSLATE] placeholders with proper translations', 'blue'));
    console.log(colorize('3. Run "npm run translations:check" to verify', 'blue'));
    
    if (!options.dryRun) {
      console.log();
      console.log(colorize('💡 Search for "[TRANSLATE]" in your IDE to find all items that need translation', 'yellow'));
    }
  }
  
  return totalSynced > 0;
}

function createQuickFixScript() {
  const scriptContent = `#!/usr/bin/env node

// Quick fix for missing translations - copies English values as placeholders

const { syncAllTranslations } = require('./sync-translations');

console.log('🚀 Quick Fix: Adding missing translation keys...');
console.log('This will copy English text as placeholders marked with [TRANSLATE]');
console.log('');

syncAllTranslations({
  preserveExisting: true,
  markMissing: true,
  missingPrefix: '[TRANSLATE]',
  dryRun: false
});
`;

  const quickFixPath = path.join(process.cwd(), 'scripts', 'quick-fix-translations.js');
  fs.writeFileSync(quickFixPath, scriptContent);
  fs.chmodSync(quickFixPath, '755'); // Make executable
  
  console.log(colorize(`🛠️  Created quick fix script: ${quickFixPath}`, 'green'));
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    preserveExisting: !args.includes('--force'),
    markMissing: !args.includes('--no-mark'),
    missingPrefix: '[TRANSLATE]'
  };
  
  if (args.includes('--help')) {
    console.log(`
Translation Sync Tool

Usage: node sync-translations.js [options]

Options:
  --dry-run       Show what would be changed without modifying files
  --verbose       Show detailed output for each key
  --force         Overwrite existing translations (default: preserve)
  --no-mark       Don't mark missing strings with [TRANSLATE] prefix
  --help          Show this help message

Examples:
  node sync-translations.js                 # Sync all missing keys
  node sync-translations.js --dry-run       # Preview changes
  node sync-translations.js --verbose       # See detailed output
`);
    process.exit(0);
  }
  
  if (args.includes('--create-quick-fix')) {
    createQuickFixScript();
  } else {
    const success = syncAllTranslations(options);
    process.exit(success ? 0 : 1);
  }
}

module.exports = {
  syncTranslation,
  syncAllTranslations,
  setValueByPath,
  getValueByPath
};