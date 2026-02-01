#!/bin/bash

# Script to setup ngrok for backend API
# This exposes your local backend (port 4000) to the internet

echo "🔧 Setting up ngrok for backend API..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "Install ngrok:"
    echo "  brew install ngrok/ngrok/ngrok"
    echo ""
    echo "Or download from: https://ngrok.com/download"
    exit 1
fi

echo "✅ ngrok found"
echo ""

# Check if authtoken is configured
if ! ngrok config check &>/dev/null; then
    echo "❌ ngrok authtoken not configured!"
    echo ""
    echo "📝 Setup instructions:"
    echo "   1. Sign up for free account: https://dashboard.ngrok.com/signup"
    echo "   2. Get your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "   3. Run this command with your authtoken:"
    echo "      ngrok config add-authtoken YOUR_AUTHTOKEN"
    echo ""
    echo "   Or run this command to open the setup page:"
    echo "   open https://dashboard.ngrok.com/get-started/your-authtoken"
    echo ""
    exit 1
fi

echo "✅ ngrok authtoken configured"
echo ""
echo "🚀 Starting ngrok tunnel for backend (port 4000)..."
echo "   This will expose your backend API to the internet"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Copy the 'Forwarding' URL (e.g., https://abc123.ngrok.io)"
echo "   2. Update NGROK_URL in src/constants/config.js with that URL"
echo "   3. Make sure to use 'https://' not 'http://'"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""

# Start ngrok
ngrok http 4000

