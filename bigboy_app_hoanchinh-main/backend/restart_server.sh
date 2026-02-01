#!/bin/bash
# Script to restart Flask server

echo "🛑 Stopping existing server on port 4000..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || echo "No process found on port 4000"
sleep 1

echo "🚀 Starting Flask server..."
cd "$(dirname "$0")"
if [ -x "venv/bin/python3" ]; then
  echo "Using virtual environment Python at venv/bin/python3"
  venv/bin/python3 app/main.py
else
  echo "venv/bin/python3 not found, falling back to system python3"
  python3 app/main.py
fi

