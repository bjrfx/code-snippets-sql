# Azure Deployment Guide

## Problem
Azure Static Web Apps **only serves static files** (HTML, CSS, JS). It doesn't run Node.js/Express backends. Your backend needs to be deployed separately.

## Solution: Two-Part Deployment

### Part 1: Deploy Backend (Express API)

#### Option A: Azure App Service (Recommended)

1. **Install Azure CLI** (if not already installed):
   ```bash
   brew install azure-cli
   ```

2. **Login to Azure**:
   ```bash
   az login
   ```

3. **Set environment variables**:
   ```bash
   export JWT_SECRET="your-super-secret-jwt-key-change-this"
   export DATABASE_URL="your-database-connection-string"
   ```

4. **Run deployment script**:
   ```bash
   ./deploy-backend-azure.sh
   ```

5. **Note the backend URL** (e.g., `https://code-snippets-api.azurewebsites.net`)

#### Option B: Azure Container Apps (More Scalable)

1. Create Dockerfile in project root:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY dist ./dist
   ENV NODE_ENV=production
   EXPOSE 3000
   CMD ["node", "dist/index.js"]
   ```

2. Build and deploy:
   ```bash
   npm run build
   az containerapp up --name code-snippets-api \
     --resource-group code-snippets-rg \
     --location westus2 \
     --ingress external --target-port 3000
   ```

### Part 2: Update Frontend Configuration

1. **Update `.env.production`** with your backend URL:
   ```env
   VITE_API_URL=https://code-snippets-api.azurewebsites.net
   ```

2. **Rebuild the frontend**:
   ```bash
   npm run build
   ```

3. **Redeploy to Azure Static Web Apps**:
   ```bash
   swa deploy --env production
   ```

### Part 3: Configure CORS

Update your backend to allow requests from the frontend:

Add to `server/index.ts` before routes:
```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://blue-forest-05190c01e-preview.westus2.3.azurestaticapps.net');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

## Quick Start (Summary)

```bash
# 1. Deploy backend
az login
export DATABASE_URL="your-db-url"
export JWT_SECRET="your-secret"
./deploy-backend-azure.sh

# 2. Update frontend config
echo "VITE_API_URL=https://code-snippets-api.azurewebsites.net" > .env.production

# 3. Rebuild and deploy frontend
npm run build
swa deploy --env production
```

## Environment Variables Needed

### Backend (Azure App Service)
- `NODE_ENV=production`
- `JWT_SECRET=your-secret-key`
- `DATABASE_URL=your-database-connection-string`

### Frontend (Build time)
- `VITE_API_URL=https://your-backend-url.azurewebsites.net`

## Troubleshooting

### 405 Method Not Allowed
- ✅ **Fixed**: Service worker now skips API requests
- ✅ **Fixed**: Backend deployed separately from frontend
- Make sure CORS is configured correctly

### CORS Errors
Add frontend URL to backend CORS configuration

### Database Connection Issues
Verify DATABASE_URL is set correctly in Azure App Service settings
