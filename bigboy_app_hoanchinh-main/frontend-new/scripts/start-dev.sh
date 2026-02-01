#!/bin/bash

# Script to start Expo dev server with proper configuration
# This script helps troubleshoot connection issues

echo "🚀 Starting Expo Dev Server..."
echo ""

# Get current IP
CURRENT_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "unknown")
echo "📍 Current IP: $CURRENT_IP"
echo ""

# Check if port 8081 is in use
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 8081 is already in use. Killing existing process..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Clear Expo cache
echo "🧹 Clearing Expo cache..."
rm -rf .expo
rm -rf node_modules/.cache

echo ""
echo "✅ Starting Expo with tunnel mode (recommended for iPhone)..."
echo "   If tunnel doesn't work, try: npm start (LAN mode)"
echo ""

# Start with tunnel mode
npm run start:tunnel

