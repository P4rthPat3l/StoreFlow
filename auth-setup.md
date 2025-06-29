# 🔐 Authentication Setup Guide

This guide will help you set up authentication for Google Play Console and App Store Connect so the automation tool can access your accounts.

## 🚀 Quick Start

### 1. **Run the Authentication Setup**

```bash
# Setup authentication for all platforms
bun run src/scripts/setup-auth.ts

# Or setup for a specific platform
bun run src/scripts/setup-auth.ts --platform google_play
bun run src/scripts/setup-auth.ts --platform app_store
```

### 2. **Follow the Interactive Process**

The tool will:

1. 🌐 Open a browser window
2. 🔍 Check if you're already logged in
3. ⏳ Wait for you to manually log in
4. 💾 Save your session automatically
5. ✅ Validate the session works

## 📋 Step-by-Step Instructions

### **For Google Play Console:**

1. **Run the setup command:**

   ```bash
   bun run src/scripts/setup-auth.ts --platform google_play
   ```

2. **The tool will open Chrome and navigate to:**

   ```
   https://play.google.com/console
   ```

3. **Log in manually:**

   - Enter your Google email and password
   - Complete 2FA if enabled
   - Wait for the dashboard to load

4. **Session saved!** The tool will automatically detect when you're logged in and save your session to `google-play-auth.json`

### **For App Store Connect:**

1. **Run the setup command:**

   ```bash
   bun run src/scripts/setup-auth.ts --platform app_store
   ```

2. **The tool will open Safari/WebKit and navigate to:**

   ```
   https://appstoreconnect.apple.com
   ```

3. **Log in manually:**

   - Enter your Apple ID and password
   - Complete 2FA if enabled
   - Wait for the "My Apps" page to load

4. **Session saved!** The tool will save your session to `app-store-auth.json`

## 🔧 Advanced Options

### **Force Re-authentication**

If your session expires or you want to refresh it:

```bash
bun run src/scripts/setup-auth.ts --platform google_play --force
```

### **Validate Existing Sessions**

Check if your current sessions are still valid:

```bash
bun run src/scripts/setup-auth.ts --validate
```

### **Get Help**

```bash
bun run src/scripts/setup-auth.ts --help
```

## 📁 What Gets Created

After successful authentication, you'll have these files:

```
your-project/
├── google-play-auth.json    # Google Play Console session
├── app-store-auth.json      # App Store Connect session
└── src/
```

**⚠️ Important:**

- These files contain encrypted session data
- Never commit them to version control (they're in `.gitignore`)
- Never share them with others

## 🔍 Troubleshooting

### **"Auth file not found" error**

```bash
# This means you need to run the setup first
bun run src/scripts/setup-auth.ts --platform google_play
```

### **"Auth session is invalid" error**
