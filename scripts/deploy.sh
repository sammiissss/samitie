#!/bin/bash

# Deployment script for Fares Church Website
# Deploys both client and admin websites

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -d "client" ] || [ ! -d "admin" ]; then
    echo "❌ Error: client and admin directories not found"
    echo "Please run this script from the WEBSITE root directory"
    exit 1
fi

# Build client website
echo "📦 Building client website..."
cd client
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Client build failed"
    exit 1
fi

echo "✅ Client website built successfully"

# Build admin website
echo "📦 Building admin website..."
cd ../admin
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Admin build failed"
    exit 1
fi

echo "✅ Admin website built successfully"

# Return to root directory
cd ..

echo "🎉 Both websites built successfully!"
echo ""
echo "📁 Build outputs:"
echo "   Client: client/dist/"
echo "   Admin:  admin/dist/"
echo ""
echo "🌐 Next steps:"
echo "   1. Upload client/dist to your main domain"
echo "   2. Upload admin/dist to your admin subdomain"
echo "   3. Configure DNS settings"
echo "   4. Test both websites"
