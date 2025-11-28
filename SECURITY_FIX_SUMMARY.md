# Security Fix Summary

## 🚨 Critical Security Issues Fixed

Your API keys were exposed in the frontend code, which led to them being leaked and reported. This document explains what was fixed and what you need to do next.

---

## What Was Fixed

### 1. Removed Hardcoded API Keys from Frontend

**File**: `apps/web/src/services/geminiService.ts`

- ❌ **BEFORE**: API key was hardcoded: `const API_KEY = '1c1aa0b4b71f43518dd7d03ba933bd3c.nD3WVYmgqa8thszj'`
- ✅ **AFTER**: Frontend now calls the backend API securely (no API keys in frontend)

### 2. Removed API Key Injection from Vite Configs

**Files**:

- `vite.config.ts`
- `apps/web/vite.config.ts`
- ❌ **BEFORE**: Vite was injecting API keys into the frontend bundle via `define` configuration
- ✅ **AFTER**: Only non-sensitive configuration (backend API URL) is exposed

### 3. Created Secure Backend Endpoint

**File**: `apps/api/src/modules/news/controllers/news.controller.ts`

- ✅ **NEW**: Added `/api/v1/news/ai/generate` endpoint
- ✅ Backend securely calls AI APIs using keys stored server-side only

### 4. Updated Frontend to Use Backend

**File**: `apps/web/src/services/geminiService.ts`

- ✅ Frontend now makes requests to backend API instead of calling AI services directly
- ✅ All AI API keys are now handled securely on the backend

### 5. Removed Leaked Keys from .env

**File**: `.env`

- ❌ **REMOVED**: Old leaked API key
- ⚠️ **TODO**: You need to get a new API key (see below)

### 6. Updated GitHub Actions

**File**: `.github/workflows/deploy.yml`

- ✅ Removed `VITE_GLM_API_KEY` from build environment
- ✅ Only `VITE_API_URL` is passed to frontend builds

---

## 🔑 What You Need to Do Now

### Step 1: Get a New GLM API Key

1. Visit https://open.bigmodel.cn/
2. Sign in to your account
3. Generate a **NEW** API key
4. **IMPORTANT**: Do NOT use the old key - it has been leaked and reported

### Step 2: Update Your Backend .env File

Edit the `.env` file (at the root of your project) and add your new API key:

```env
GLM_API_KEY=your-new-api-key-here
```

**CRITICAL**: This file should NEVER be committed to Git. It's already in `.gitignore`.

### Step 3: Deploy Your Backend

Your backend needs to be deployed and accessible for the frontend to work. Options:

1. **Vercel** (Recommended for NestJS)
2. **Railway**
3. **Render**
4. **Your own server**

Make sure the backend is running and note its URL (e.g., `https://your-backend.vercel.app`)

### Step 4: Update Frontend Configuration

1. **For Local Development**: Update `.env` or `apps/web/.env`:

   ```env
   VITE_API_URL=http://localhost:4000/api/v1
   ```

2. **For Production**: Update GitHub repository secrets:
   - Go to: `Settings > Secrets and variables > Actions`
   - Delete the old secret: `VITE_GLM_API_KEY` (if it exists)
   - Update or create: `VITE_API_URL` = `https://your-backend-url.com/api/v1`

### Step 5: Test Locally

1. Start the backend:

   ```bash
   cd apps/api
   pnpm dev
   ```

2. In a new terminal, start the frontend:

   ```bash
   cd apps/web
   pnpm dev
   ```

3. Visit `http://localhost:3000` and verify that news generation works

### Step 6: Deploy

1. **Commit your changes** (the API key is no longer in the code):

   ```bash
   git add .
   git commit -m "security: Fix API key leak - move all AI calls to backend"
   git push
   ```

2. **GitHub Pages** will automatically deploy your frontend
3. Make sure your backend is also deployed and accessible

---

## 🔒 Security Best Practices Going Forward

### ✅ DO:

- Store ALL API keys in backend `.env` files only
- Never commit `.env` files to Git
- Use backend endpoints for all external API calls
- Regularly rotate API keys
- Monitor API usage for unusual activity

### ❌ DON'T:

- Never hardcode API keys in source code
- Never put API keys in frontend code (including environment variables that get bundled)
- Never commit sensitive credentials to Git
- Never share API keys in public repositories or screenshots

---

## Architecture After Fix

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   Frontend  │                    │   Backend   │                    │   GLM API   │
│ (GitHub     │  ──────────────▶   │  (NestJS)   │  ──────────────▶   │  (Secure)   │
│  Pages)     │   HTTP Request     │             │   API Key in       │             │
│             │   No API Keys      │             │   Server .env      │             │
└─────────────┘                    └─────────────┘                    └─────────────┘
```

**Before**: Frontend → GLM API (API key exposed ❌)
**After**: Frontend → Backend → GLM API (API key secure ✅)

---

## Testing Checklist

- [ ] New GLM API key obtained
- [ ] Backend `.env` updated with new key
- [ ] Backend running locally on port 4000
- [ ] Frontend running locally on port 3000
- [ ] News generation works locally
- [ ] Backend deployed to production
- [ ] GitHub secret `VITE_API_URL` updated
- [ ] Frontend deployed to GitHub Pages
- [ ] News generation works in production

---

## Questions or Issues?

If you encounter any problems:

1. Check that the backend is running and accessible
2. Verify the `VITE_API_URL` is correct
3. Check backend logs for API errors
4. Ensure the new GLM API key is valid

The backend API endpoint is: `GET /api/v1/news/ai/generate?count=8`
