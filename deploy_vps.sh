#!/bin/bash

# KnowledgeBase Deployment Script for CloudPanel VPS
# Usage: bash deploy_vps.sh

echo "==========================================="
echo "🚀 Starting KnowledgeBase Deployment..."
echo "==========================================="

# Ensure we are in the project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root folder."
    exit 1
fi

# --- BACKEND ---
echo ""
echo "📦 [1/3] Setting up BACKEND..."
cd backend || exit

echo " - Installing dependencies..."
npm install --silent

echo " - Building TypeScript..."
npm run build

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "⚠️ .env file not found. Creating default production .env..."
    cat > .env <<EOL
NODE_ENV=production
PORT=6000
# Update these with your real keys!
OPENAI_API_KEY=your_openai_key_here
QDRANT_URL=http://127.0.0.1:6333
JWT_SECRET=change_this_secret_immediately
EOL
    echo "✅ Created .env (Please edit it later!)"
fi

echo " - Starting with PM2 on Port 6000..."
# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 not found. Installing globally..."
    npm install -g pm2
fi

pm2 delete kb-backend 2>/dev/null || true
pm2 start dist/index.js --name "kb-backend" -- --port 6000
pm2 save

echo "✅ Backend is running on Port 6000"

# --- FRONTEND ---
echo ""
echo "🎨 [2/3] Setting up FRONTEND..."
cd ../frontend || exit

echo " - Installing dependencies..."
npm install --silent

echo " - Building Next.js..."
npm run build

echo "✅ Frontend Built Successfully"

# --- SUMMARY ---
echo ""
echo "==========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "==========================================="
echo "1. Backend is running on Port 6000 (PM2 id: kb-backend)"
echo "2. Frontend build is ready."
echo "3. IMPORTANT: Edit 'backend/.env' to set your OPENAI_API_KEY!"
echo "4. IMPORTANT: Configure Nginx Proxy for /api -> 6000"
echo "==========================================="
