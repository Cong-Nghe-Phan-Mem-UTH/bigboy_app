#!/bin/bash
# Script to test API endpoints

BASE_URL="${1:-http://localhost:4000}"

echo "🧪 Testing API endpoints at: $BASE_URL"
echo ""

# Test 1: Health check
echo "1️⃣ Testing health endpoint..."
curl -s "$BASE_URL/health" | python3 -m json.tool || echo "❌ Health check failed"
echo ""

# Test 2: Test connection endpoint
echo "2️⃣ Testing connection endpoint..."
curl -s "$BASE_URL/api/v1/test-connection" | python3 -m json.tool || echo "❌ Connection test failed"
echo ""

# Test 3: Test customer register endpoint (should fail with validation, not network)
echo "3️⃣ Testing customer register endpoint..."
curl -s -X POST "$BASE_URL/api/v1/customer/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}' | python3 -m json.tool || echo "❌ Register test failed"
echo ""

echo "✅ Testing complete!"
echo ""
echo "📝 If all tests pass, mobile app should be able to connect."
echo "📱 Update API_BASE_URL in mobile app to: $BASE_URL"

