#!/bin/bash

# Script to start Expo app locally (web, iOS simulator, or Android emulator)
# This is easier for testing without needing to scan QR codes on phone

echo "🚀 Starting Expo App Locally..."
echo ""
echo "Choose your platform:"
echo "  1) Web Browser (easiest - no setup needed)"
echo "  2) iOS Simulator (requires Xcode)"
echo "  3) Android Emulator (requires Android Studio)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "🌐 Starting on Web Browser..."
    echo "   The app will open at http://localhost:19006"
    echo "   Make sure your backend is running on http://localhost:4000"
    echo ""
    npm run web
    ;;
  2)
    echo ""
    echo "📱 Starting on iOS Simulator..."
    echo "   Make sure Xcode is installed and iOS Simulator is available"
    echo "   Make sure your backend is running on http://localhost:4000"
    echo ""
    npm run ios
    ;;
  3)
    echo ""
    echo "🤖 Starting on Android Emulator..."
    echo "   Make sure Android Studio is installed and an emulator is running"
    echo "   Make sure your backend is running on http://localhost:4000"
    echo ""
    npm run android
    ;;
  *)
    echo "❌ Invalid choice. Exiting..."
    exit 1
    ;;
esac
