# Manual Testing Guide for Endorphin AI

Choose the appropriate testing guide based on what you're testing:

## 🔧 Development Testing
**For developers testing current source code changes**

👉 **[Development Testing Guide](./development-testing.md)**

- Test local development version
- No API key required for basic testing
- Quick feedback on code changes
- Automated test suite available

```bash
# Quick start for developers
cd /path/to/endorphin-ai
npm run test:local
```

## 📦 Published Package Testing  
**For testing the published npm package**

👉 **[Published Package Testing Guide](./published-package-testing.md)**

- Test official npm package
- Requires OpenAI API key for full testing
- End-user perspective testing
- Production environment validation

```bash
# Quick start for published package
mkdir ~/endorphin-test && cd ~/endorphin-test
npm init -y && npm pkg set type="module"
npm install endorphin-ai
npx endorphin init
```

## 🚀 Quick Comparison

| Feature | Development Testing | Published Package Testing |
|---------|-------------------|--------------------------|
| **Purpose** | Test code changes | Test user experience |
| **Source** | Local repository | npm registry |
| **API Key** | Optional | Required for full testing |
| **Setup Time** | ~2 minutes | ~5 minutes |
| **Use Case** | Before committing | Before/after releases |

## 🆘 Common Issues

### "Commands execute but do nothing"

This usually means one of these issues:

1. **Missing ES modules setup:**
   ```bash
   npm pkg set type="module"
   ```

2. **Wrong file extensions:** Should see `.js` files, not `.ts` files after init

3. **Missing API key:** Some commands need API key to show full output

4. **Package not properly installed:** Try reinstalling the package

5. **Node.js version:** Requires Node.js 18+

### Quick Diagnostics

```bash
# Check installation
npx endorphin --version

# Check file types (should be .js)
ls -la tests/

# Check ES module setup
grep '"type"' package.json

# Check API key (should start with sk-)
grep OPENAI_API_KEY .env
```

## 📊 Expected Results

After successful testing, you should see:

✅ **Installation:** Package installs without errors  
✅ **Initialization:** Creates `.js` files (not `.ts`)  
✅ **Discovery:** `npx endorphin list` shows tests without errors  
✅ **CLI Commands:** All commands execute and show output  
✅ **Configuration:** Config files load without syntax errors  

## 🔗 Additional Resources

- **Automated Testing:** `npm run test:local` (for development)
- **Package Tests:** `./tests/package-tests/run-all-tests.sh`
- **Documentation:** [Main README](../../README.md)
- **Issues:** [GitHub Issues](https://github.com/andrewnovykov/endorphin-ai/issues)