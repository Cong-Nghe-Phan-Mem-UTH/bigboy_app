#!/bin/bash
# Script to get ngrok public URL

echo "🔍 Getting ngrok URL..."
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool | grep -A 5 "public_url" | grep "https://" | head -1 | sed 's/.*"\(https:\/\/[^"]*\)".*/\1/'

if [ $? -ne 0 ]; then
    echo "❌ Could not get ngrok URL. Make sure ngrok is running."
    echo "   Start ngrok with: ngrok http 4000"
fi

