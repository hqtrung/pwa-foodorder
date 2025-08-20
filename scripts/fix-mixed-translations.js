#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix mixed translations
const fixes = {
  fr: {
    'Livraison Time': 'Temps de livraison',
    'Livraison Information': 'Informations de livraison',
    'Livraison address is required': 'L\'adresse de livraison est requise',
    'Livraison Instructions': 'Instructions de livraison',
    'Livraison Information': 'Informations de livraison',
    'Table Information': 'Informations de table',
    ' complete': 'terminé',
    ' sections complete': 'sections terminées',
    ' Checkout Progress': 'Progression de la commande'
  },
  it: {
    'Consegna Address': 'Indirizzo di consegna',
    'Consegna Time': 'Tempo di consegna',
    'Consegna address is required': 'L\'indirizzo di consegna è richiesto',
    'Consegna Instructions': 'Istruzioni di consegna',
    ' complete': 'completato',
    ' sections complete': 'sezioni completate',
    ' Checkout Progress': 'Progresso checkout'
  },
  ja: {
    '配送 Address': '配送先住所',
    '配送 Time': '配送時間',
    '配送 address is required': '配送先住所が必要です',
    '配送 Instructions': '配送指示',
    '配送 Information': '配送情報',
    'テーブル Information': 'テーブル情報'
  },
  zh: {
    '配送 Address': '配送地址',
    '配送 Time': '配送时间',
    '配送 address is required': '配送地址是必填的',
    '配送 Instructions': '配送说明',
    '配送 Information': '配送信息',
    '桌号 Information': '桌位信息',
    'sections完成': '部分完成',
    '桌号 {number}': '桌号{number}'
  }
};

function fixMixedTranslations(lang) {
  const filePath = path.join(process.cwd(), 'messages', `${lang}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  const langFixes = fixes[lang];
  if (!langFixes) {
    console.log(`ℹ️  No fixes defined for ${lang}`);
    return;
  }
  
  for (const [original, fixed] of Object.entries(langFixes)) {
    if (content.includes(original)) {
      content = content.replace(new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fixed);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${lang.toUpperCase()}: Fixed mixed translations`);
  } else {
    console.log(`ℹ️  ${lang.toUpperCase()}: No mixed translations found`);
  }
}

// Fix all languages
console.log('🔄 Fixing mixed translations...\n');

['fr', 'it', 'ja', 'zh'].forEach(lang => {
  fixMixedTranslations(lang);
});

console.log('\n✅ All mixed translations fixed!');