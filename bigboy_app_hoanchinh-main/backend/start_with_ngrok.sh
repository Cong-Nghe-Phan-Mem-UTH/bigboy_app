#!/bin/bash
# Script to start Flask server with ngrok tunnel

echo "🛑 Stopping existing server on port 4000..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || echo "No process found on port 4000"
sleep 1

echo "🚀 Starting Flask server in background..."
cd "$(dirname "$0")"
python app/main.py &
FLASK_PID=$!
sleep 3

echo "🌐 Starting ngrok tunnel..."
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found. Please install ngrok first:"
    echo "   brew install ngrok/ngrok/ngrok"
    echo "   or download from https://ngrok.com/download"
    kill $FLASK_PID
    exit 1
fi

ngrok http 4000 &
NGROK_PID=$!
sleep 3

echo ""
echo "============================================================"
echo "✅ Server started!"
echo "📱 Flask server: http://localhost:4000"
echo "🌐 Check ngrok URL: http://localhost:4040"
echo ""
echo "📋 To get ngrok URL, run:"
echo "   curl http://localhost:4040/api/tunnels | python -m json.tool"
echo ""
echo "🛑 To stop: kill $FLASK_PID $NGROK_PID"
echo "============================================================"

# Wait for user to stop
wait

