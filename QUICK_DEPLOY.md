# 🚀 Quick Vercel Deployment Fix

## The Problem
Your GUI (static files) isn't showing up in Vercel because the project needs to be redeployed with the correct configuration.

## The Solution

### Step 1: Deploy Fresh Project
Run this command and answer the prompts:

```bash
vercel
```

**Answer these prompts:**
- `Set up and deploy?` → **Y** (Yes)
- `Which scope?` → Press Enter (use your account)
- `Link to existing project?` → **N** (No - create new project)
- `What's your project's name?` → **website-chatbot** (or your preferred name)
- `In which directory is your code located?` → Press Enter (uses current directory)

### Step 2: Set Environment Variables
After deployment, go to your Vercel dashboard and add these environment variables:

1. **Go to:** https://vercel.com/dashboard
2. **Click** on your project
3. **Go to:** Settings → Environment Variables
4. **Add these 3 variables:**

```
OPENAI_API_KEY = sk-your-openai-api-key-here
SUPABASE_URL = https://your-project.supabase.co  
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key-here
```

5. **Set for:** Production, Preview, Development
6. **Click** "Save" for each

### Step 3: Redeploy
After setting environment variables:

```bash
vercel --prod
```

## What's Fixed
✅ **Simplified vercel.json** - Removed complex routing that was causing issues
✅ **Cleaned up files** - Removed unnecessary files and directories
✅ **Proper structure** - All static files in root directory
✅ **Node.js version** - Specified Node 18.x for compatibility

## Expected Result
After deployment, you should see:
- **Main chatbot:** `https://your-project.vercel.app`
- **Dashboard:** `https://your-project.vercel.app/dashboard.html`
- **Working API:** All endpoints functional

## If Still Not Working
1. Check Vercel function logs in dashboard
2. Verify environment variables are set correctly
3. Make sure all files are in the root directory (not in subdirectories)
4. Check that your Supabase database has the `conversations` table

Your project structure should look like this:
```
├── api/
│   ├── lib/
│   └── index.js
├── index.html
├── dashboard.html
├── styles.css
├── dashboard.css
├── script.js
├── dashboard.js
├── vercel.json
└── package.json
```
