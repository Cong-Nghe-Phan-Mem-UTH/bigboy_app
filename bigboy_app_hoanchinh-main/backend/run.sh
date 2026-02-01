#!/bin/bash
# Run script for development

# Always run from this script's directory
cd "$(dirname "$0")"

export FLASK_APP=app/main.py
export FLASK_ENV=development

# Ensure the current directory (backend) is on PYTHONPATH so the `app` package can be imported
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Run the Flask app as a module so imports like `from app.create_app import create_app` work
python3 -m app.main

