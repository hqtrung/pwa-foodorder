# Translation Management System

This project now includes a comprehensive translation management system to prevent and fix translation issues automatically.

## 🚀 Quick Start

### Check Translation Status
```bash
npm run translations:check
```
Shows missing translations, duplicates, and coverage for all languages.

### Fix All Translation Issues
```bash
npm run translations:fix
```
Automatically syncs missing keys and cleans up duplicates.

### Individual Commands
```bash
# Sync missing translations from English to other languages
npm run translations:sync

# Clean up duplicate sections and sort keys
npm run translations:clean

# Generate detailed report
npm run translations:report
```

## 📋 Available Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `translations:check` | Validates all translation files | Daily development check |
| `translations:sync` | Adds missing keys from English | After adding new UI text |
| `translations:clean` | Removes duplicates, sorts keys | Cleanup before releases |
| `translations:fix` | Runs sync + clean together | One-command solution |
| `translations:report` | Generates JSON report | CI/CD integration |

## 🛠️ Advanced Usage

### Dry Run Mode
Preview changes without modifying files:
```bash
npm run translations:sync -- --dry-run
npm run translations:clean -- --dry-run
```

### Verbose Output
See detailed information about each change:
```bash
npm run translations:sync -- --verbose
```

### Backup Before Cleaning
By default, cleanup creates backups. To skip:
```bash
npm run translations:clean -- --no-backup
```

## 🔍 What Gets Detected

### Missing Translations
- Keys that exist in English but missing in other languages
- Structural differences between language files

### Duplicate Sections
- Multiple sections with same key names
- Redundant nested objects

### Extra Keys
- Keys that exist in other languages but not in English master

## 🎯 Workflow Integration

### For Developers
1. Add new text to English translation file (`messages/en.json`)
2. Run `npm run translations:sync` to propagate to other languages
3. Keys are marked with `[TRANSLATE]` prefix for translators
4. Run `npm run translations:check` to verify everything is correct

### For Translators
1. Search for `[TRANSLATE]` in translation files
2. Replace `[TRANSLATE] English text` with proper translation
3. Remove the `[TRANSLATE]` prefix when done

### For CI/CD
Add to your GitHub Actions or CI pipeline:
```yaml
- name: Check translations
  run: npm run translations:check
```

## 📁 File Structure

```
scripts/
├── check-translations.js     # Validation and reporting
├── sync-translations.js      # Sync missing keys
├── clean-translations.js     # Remove duplicates
└── quick-fix-translations.js # One-click fix

messages/
├── en.json                   # Master translation file
├── fr.json                   # French translations
├── it.json                   # Italian translations
├── ja.json                   # Japanese translations
├── vi.json                   # Vietnamese translations
└── zh.json                   # Chinese translations
```

## 🚨 Common Issues & Solutions

### Issue: Translation keys not working in app
**Solution:** Run `npm run translations:check` to find missing keys, then `npm run translations:sync` to add them.

### Issue: Duplicate sections causing confusion
**Solution:** Run `npm run translations:clean` to remove duplicates and organize keys.

### Issue: Many missing translations after UI changes
**Solution:** Run `npm run translations:fix` for a complete sync and cleanup.

### Issue: Need to see what's missing before making changes
**Solution:** Use `--dry-run` flag with any command to preview changes.

## 📊 Translation Coverage

Run `npm run translations:report` to generate a detailed coverage report saved as `translation-report.json`:

```json
{
  "languages": {
    "fr": {
      "total": 493,
      "missing": 55,
      "coverage": "88.8%",
      "missingKeys": ["checkout.stepProgress", "..."]
    }
  },
  "summary": {
    "totalMissing": 263
  }
}
```

## 🎉 Benefits

- **Automatic Detection**: No more manual checking of translation files
- **Time Saving**: What took hours now takes seconds
- **Consistency**: All language files maintain the same structure
- **Prevention**: Catch translation issues before they reach production
- **Team Efficiency**: Clear workflow for developers and translators

## 🔧 Troubleshooting

### Scripts not executable
```bash
chmod +x scripts/*.js
```

### Node.js path issues
Make sure you're running from the project root directory.

### Permission errors
Check file permissions in the `messages/` directory.

## 🚀 Future Enhancements

- Pre-commit hooks to automatically check translations
- VS Code extension for translation key validation
- TypeScript type generation from translation files
- Integration with translation services (Google Translate API)
- Automated translation validation in GitHub Actions

---

**Pro Tip:** Add `npm run translations:check` to your daily development routine to catch translation issues early!