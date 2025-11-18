#!/bin/bash

# Azure Backend Deployment Script
# This script deploys the Express backend to Azure App Service

# Configuration - UPDATE THESE VALUES
RESOURCE_GROUP="code-snippets-rg"
APP_NAME="code-snippets-api"
LOCATION="westus2"
SKU="B1"  # Basic tier

echo "🚀 Deploying backend to Azure App Service..."

# Create resource group if it doesn't exist
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan
echo "📋 Creating App Service plan..."
az appservice plan create \
  --name "${APP_NAME}-plan" \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku $SKU \
  --is-linux

# Create Web App
echo "🌐 Creating Web App..."
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_NAME}-plan" \
  --runtime "NODE:20-lts"

# Configure app settings
echo "⚙️  Configuring app settings..."
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NODE_ENV=production \
    JWT_SECRET="${JWT_SECRET:-your-secret-key-change-in-production}" \
    DATABASE_URL="${DATABASE_URL}"

# Enable CORS
echo "🔓 Enabling CORS..."
az webapp cors add \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --allowed-origins "https://blue-forest-05190c01e-preview.westus2.3.azurestaticapps.net"

# Deploy code
echo "📤 Deploying code..."
npm run build
zip -r deploy.zip dist node_modules package.json

az webapp deploy \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --src-path deploy.zip \
  --type zip

rm deploy.zip

echo "✅ Backend deployed successfully!"
echo "🔗 Backend URL: https://${APP_NAME}.azurewebsites.net"
echo ""
echo "Next steps:"
echo "1. Update .env.production with: VITE_API_URL=https://${APP_NAME}.azurewebsites.net"
echo "2. Rebuild and redeploy the frontend"
echo "3. Add your frontend URL to CORS if needed"
