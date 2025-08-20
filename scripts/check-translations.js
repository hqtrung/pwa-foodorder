#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

function loadTranslationFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(colorize(`❌ Error loading ${filePath}: ${error.message}`, 'red'));
    return null;
  }
}

function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

function findMissingKeys(masterKeys, targetKeys) {
  return masterKeys.filter(key => !targetKeys.includes(key));
}

function findExtraKeys(masterKeys, targetKeys) {
  return targetKeys.filter(key => !masterKeys.includes(key));
}

function detectDuplicateSections(obj, path = '') {
  const duplicates = [];
  const keyCount = {};
  
  function traverse(obj, currentPath) {
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;
        
        if (keyCount[key]) {
          keyCount[key].push(fullPath);
        } else {
          keyCount[key] = [fullPath];
        }
        
        if (typeof value === 'object' && value !== null) {
          traverse(value, fullPath);
        }
      }
    }
  }
  
  traverse(obj, path);
  
  // Find keys that appear multiple times
  for (const [key, paths] of Object.entries(keyCount)) {
    if (paths.length > 1) {
      duplicates.push({ key, paths });
    }
  }
  
  return duplicates;
}

function checkTranslations() {
  const messagesDir = path.join(process.cwd(), 'messages');
  const languages = ['en', 'fr', 'it', 'ja', 'vi', 'zh'];
  
  console.log(colorize('🔍 Translation Validation Report', 'bright'));
  console.log(colorize('=====================================', 'cyan'));
  console.log();
  
  // Load all translation files
  const translations = {};
  for (const lang of languages) {
    const filePath = path.join(messagesDir, `${lang}.json`);
    translations[lang] = loadTranslationFile(filePath);
    
    if (!translations[lang]) {
      console.log(colorize(`❌ Failed to load ${lang}.json`, 'red'));
      return false;
    }
  }
  
  // Use English as the master reference
  const masterKeys = getAllKeys(translations.en);
  console.log(colorize(`📋 Master keys from English: ${masterKeys.length} total`, 'blue'));
  console.log();
  
  let hasErrors = false;
  
  // Check each language against master
  for (const lang of languages) {
    if (lang === 'en') continue; // Skip master language
    
    console.log(colorize(`🌐 Checking ${lang.toUpperCase()}:`, 'bright'));
    
    const targetKeys = getAllKeys(translations[lang]);
    const missingKeys = findMissingKeys(masterKeys, targetKeys);
    const extraKeys = findExtraKeys(masterKeys, targetKeys);
    
    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(colorize(`  ✅ Perfect! All keys match`, 'green'));
    } else {
      hasErrors = true;
      
      if (missingKeys.length > 0) {
        console.log(colorize(`  ❌ Missing ${missingKeys.length} keys:`, 'red'));
        missingKeys.slice(0, 10).forEach(key => {
          console.log(colorize(`    - ${key}`, 'red'));
        });
        if (missingKeys.length > 10) {
          console.log(colorize(`    ... and ${missingKeys.length - 10} more`, 'red'));
        }
      }
      
      if (extraKeys.length > 0) {
        console.log(colorize(`  ⚠️  Extra ${extraKeys.length} keys (not in master):`, 'yellow'));
        extraKeys.slice(0, 5).forEach(key => {
          console.log(colorize(`    + ${key}`, 'yellow'));
        });
        if (extraKeys.length > 5) {
          console.log(colorize(`    ... and ${extraKeys.length - 5} more`, 'yellow'));
        }
      }
    }
    console.log();
  }
  
  // Check for duplicate sections in all files
  console.log(colorize('🔄 Checking for duplicate sections:', 'bright'));
  for (const lang of languages) {
    const duplicates = detectDuplicateSections(translations[lang]);
    
    if (duplicates.length === 0) {
      console.log(colorize(`  ✅ ${lang.toUpperCase()}: No duplicates found`, 'green'));
    } else {
      hasErrors = true;
      console.log(colorize(`  ⚠️  ${lang.toUpperCase()}: Found ${duplicates.length} duplicate sections:`, 'yellow'));
      duplicates.forEach(dup => {
        console.log(colorize(`    - "${dup.key}" appears in: ${dup.paths.join(', ')}`, 'yellow'));
      });
    }
  }
  
  console.log();
  console.log(colorize('=====================================', 'cyan'));
  
  if (hasErrors) {
    console.log(colorize('❌ Translation issues found!', 'red'));
    console.log(colorize('💡 Run "npm run translations:sync" to fix missing keys', 'blue'));
    console.log(colorize('💡 Run "npm run translations:clean" to remove duplicates', 'blue'));
    return false;
  } else {
    console.log(colorize('✅ All translations are perfect!', 'green'));
    return true;
  }
}

function generateMissingKeysReport() {
  const messagesDir = path.join(process.cwd(), 'messages');
  const languages = ['fr', 'it', 'ja', 'vi', 'zh']; // Skip English as it's the master
  
  // Load English as master
  const masterTranslations = loadTranslationFile(path.join(messagesDir, 'en.json'));
  if (!masterTranslations) return;
  
  const masterKeys = getAllKeys(masterTranslations);
  const report = { languages: {}, summary: { totalMissing: 0 } };
  
  for (const lang of languages) {
    const translations = loadTranslationFile(path.join(messagesDir, `${lang}.json`));
    if (!translations) continue;
    
    const targetKeys = getAllKeys(translations);
    const missingKeys = findMissingKeys(masterKeys, targetKeys);
    
    report.languages[lang] = {
      total: masterKeys.length,
      missing: missingKeys.length,
      coverage: ((masterKeys.length - missingKeys.length) / masterKeys.length * 100).toFixed(1),
      missingKeys: missingKeys
    };
    
    report.summary.totalMissing += missingKeys.length;
  }
  
  // Write detailed report to file
  const reportPath = path.join(process.cwd(), 'translation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(colorize(`📊 Detailed report saved to: ${reportPath}`, 'blue'));
  
  return report;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--report')) {
    generateMissingKeysReport();
  } else {
    const success = checkTranslations();
    process.exit(success ? 0 : 1);
  }
}

module.exports = {
  checkTranslations,
  generateMissingKeysReport,
  getAllKeys,
  loadTranslationFile
};