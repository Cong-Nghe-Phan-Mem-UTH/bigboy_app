#!/bin/bash
# Script to restart Expo app with clear cache

echo "🔄 Restarting Expo app with clear cache..."
cd "$(dirname "$0")"

# Clear Expo cache
echo "🧹 Clearing cache..."
npx expo start --clear
