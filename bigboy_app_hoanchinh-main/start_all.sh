#!/bin/bash

# Script để chạy toàn bộ hệ thống BigBoy
# Docker (Postgres + Redis) → Backend → Web Dashboard → Mobile App

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
WEB_DASHBOARD_DIR="$SCRIPT_DIR/web-dashboard"
MOBILE_APP_DIR="$SCRIPT_DIR/frontend-new"

echo "🚀 Starting BigBoy System..."
echo "================================"
echo ""

# 1. Start Docker (Postgres + Redis) – không cần bật Docker Desktop thủ công
echo "🐳 Starting Docker (Postgres + Redis)..."
cd "$SCRIPT_DIR"
if docker compose up -d 2>/dev/null || docker-compose up -d 2>/dev/null; then
    echo "✅ Postgres & Redis started"
    sleep 3
else
    echo "⚠️  Docker not running or compose failed. Start Docker Desktop and run again."
    echo "   Or start manually: cd $SCRIPT_DIR && docker compose up -d"
fi
echo ""

# Check if directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$WEB_DASHBOARD_DIR" ]; then
    echo "❌ Web Dashboard directory not found: $WEB_DASHBOARD_DIR"
    exit 1
fi

if [ ! -d "$MOBILE_APP_DIR" ]; then
    echo "❌ Mobile App directory not found: $MOBILE_APP_DIR"
    exit 1
fi

echo "📋 Starting Backend..."
cd "$BACKEND_DIR"
./restart_server.sh &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   → http://localhost:4000"
echo ""

sleep 3

echo "📋 Starting Web Dashboard..."
cd "$WEB_DASHBOARD_DIR"
npm run dev &
WEB_PID=$!
echo "✅ Web Dashboard started (PID: $WEB_PID)"
echo "   → http://localhost:3000"
echo ""

sleep 2

echo "📋 Starting Mobile App..."
cd "$MOBILE_APP_DIR"
npm start &
MOBILE_PID=$!
echo "✅ Mobile App started (PID: $MOBILE_PID)"
echo "   → Expo DevTools will open"
echo ""

echo "================================"
echo "✅ All services started!"
echo ""
echo "📱 Access points:"
echo "   - Backend API: http://localhost:4000"
echo "   - Web Dashboard: http://localhost:3000"
echo "   - Mobile App: Check Expo DevTools"
echo ""
echo "⚠️  Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
wait
