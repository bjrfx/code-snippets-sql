# 🚀 Fix for 405 Method Not Allowed Error

## The Problem
Azure Static Web Apps **ONLY serves static files**. It cannot run your Express backend. Your backend needs to be deployed separately.

## What I Fixed

### 1. ✅ Service Worker (sw.js)
- Now skips API requests entirely (no longer intercepts them)
- Bumped cache version to v2 (forces clients to get new service worker)

### 2. ✅ CORS Configuration (server/index.ts)
- Added CORS headers to allow requests from your Azure Static Web App
- Handles preflight OPTIONS requests properly

### 3. ✅ API Client (client/src/lib/api.ts)
- Now uses `VITE_API_URL` environment variable for production
- Falls back to relative URLs in development

### 4. ✅ Configuration Files
- Created `.env.production` for production API URL
- Fixed `staticwebapp.config.json` schema errors

## What You Need to Do

### Step 1: Deploy Your Backend Separately

You have **3 options**:

#### Option A: Azure App Service (Easiest - Recommended)
```bash
# 1. Login to Azure
az login

# 2. Set your environment variables
export DATABASE_URL="your-database-url"
export JWT_SECRET="your-super-secret-key"

# 3. Run the deployment script
./deploy-backend-azure.sh
```

This will deploy your Express backend to: `https://code-snippets-api.azurewebsites.net`

#### Option B: Use Existing Backend URL
If you already have the backend deployed somewhere, skip to Step 2.

#### Option C: Deploy to Another Service
- Railway: `railway up`
- Render: Connect GitHub repo
- Heroku: `git push heroku main`
- Any VPS with Node.js

### Step 2: Update Frontend Configuration

1. **Edit `.env.production`** with your actual backend URL:
   ```env
   VITE_API_URL=https://code-snippets-api.azurewebsites.net
   ```

2. **Rebuild the frontend**:
   ```bash
   npm run build
   ```

3. **Deploy to Azure Static Web Apps**:
   ```bash
   swa deploy --env production
   ```

   OR use Azure CLI:
   ```bash
   az staticwebapp deploy \
     --name blue-forest-05190c01e \
     --resource-group code-snippets-rg \
     --source ./dist/public
   ```

### Step 3: Update CORS (If Needed)

If your Azure Static Web App URL changes, update the CORS allowed origins in `server/index.ts`:

```typescript
const allowedOrigins = [
  'https://your-new-url.azurestaticapps.net',  // <- Add here
  'https://blue-forest-05190c01e-preview.westus2.3.azurestaticapps.net',
  'http://localhost:5173',
];
```

Then redeploy the backend.

## Quick Commands

```bash
# Full deployment flow:

# 1. Deploy backend
az login
export DATABASE_URL="your-db-url"
export JWT_SECRET="your-secret"
./deploy-backend-azure.sh

# 2. Get the backend URL (e.g., https://code-snippets-api.azurewebsites.net)

# 3. Update .env.production
echo "VITE_API_URL=https://code-snippets-api.azurewebsites.net" > .env.production

# 4. Rebuild and deploy frontend
npm run build
swa deploy --env production
```

## Testing

After deployment:

1. **Clear browser cache** (or use incognito mode)
2. Try to login - should work now!
3. Check browser console - should see requests going to your backend URL

## Troubleshooting

### Still getting 405?
- Make sure `.env.production` has the correct backend URL
- Rebuild: `npm run build`
- Redeploy frontend: `swa deploy --env production`

### CORS errors?
- Add your frontend URL to `allowedOrigins` in `server/index.ts`
- Redeploy backend

### Service worker still causing issues?
1. Open DevTools → Application → Service Workers
2. Click "Unregister"
3. Hard refresh (Cmd+Shift+R)

## Summary

Your app needs **two separate deployments**:
1. **Backend (Express API)** → Azure App Service / Container Apps / Railway / etc.
2. **Frontend (React SPA)** → Azure Static Web Apps (already deployed)

The frontend will call the backend via the URL in `VITE_API_URL`.
