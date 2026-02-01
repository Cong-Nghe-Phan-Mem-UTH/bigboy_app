#!/bin/bash
# Script to create restaurant staff account
# This script automatically uses the venv Python

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_PYTHON="$SCRIPT_DIR/venv/bin/python3"

if [ ! -f "$VENV_PYTHON" ]; then
    echo "❌ Virtual environment not found!"
    echo "💡 Please run: python3 -m venv venv"
    echo "   Then: source venv/bin/activate"
    echo "   Then: pip install -r requirements.txt"
    exit 1
fi

echo "🚀 Creating restaurant staff account..."
echo ""

"$VENV_PYTHON" "$SCRIPT_DIR/create_restaurant_staff.py"
