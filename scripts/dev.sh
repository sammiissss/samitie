#!/bin/bash

# Development script for Fares Church Website
# Starts both client and admin websites in development mode

echo "🚀 Starting development servers..."

# Check if we're in the right directory
if [ ! -d "client" ] || [ ! -d "admin" ]; then
    echo "❌ Error: client and admin directories not found"
    echo "Please run this script from the WEBSITE root directory"
    exit 1
fi

# Start client website
echo "🌐 Starting client website on port 3000..."
cd client
npm run dev &
CLIENT_PID=$!

# Wait a moment for client to start
sleep 3

# Start admin website
echo "🔧 Starting admin website on port 3001..."
cd ../admin
npm run dev &
ADMIN_PID=$!

echo ""
echo "✅ Development servers started!"
echo ""
echo "🌐 Client website: http://localhost:3000"
echo "🔧 Admin website:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to kill both processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $CLIENT_PID 2>/dev/null
    kill $ADMIN_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set up trap for Ctrl+C
trap cleanup INT

# Wait for both processes
wait
