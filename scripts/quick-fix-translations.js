#!/usr/bin/env node

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