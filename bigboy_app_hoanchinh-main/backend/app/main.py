"""
Main entry point for Flask application
"""
import os
import sys

# Add parent directory to Python path to allow imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from app.create_app import create_app

app = create_app()

if __name__ == "__main__":
    # Get port from environment variable
    port = int(os.environ.get('PORT', 4000))
    # Disable debug in production
    debug = os.environ.get('DEBUG', 'False').lower() in ['true', '1']
    
    # Get local IP address for mobile app connection
    import socket
    def get_local_ip():
        try:
            # Connect to a remote address to get local IP
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "localhost"
    
    local_ip = get_local_ip()
    
    # Print startup info
    print("=" * 60)
    print(f"🚀 Starting Flask app on port {port}")
    print(f"📊 Debug mode: {debug}")
    print(f"🌐 Environment: {'Production' if app.config.get('PRODUCTION') else 'Development'}")
    print(f"🔗 Local URL: http://localhost:{port}")
    print(f"📱 Mobile App URL: http://{local_ip}:{port}")
    print(f"🔍 Health check: http://{local_ip}:{port}/health")
    print(f"📝 Test endpoint: http://{local_ip}:{port}/test")
    print("=" * 60)
    
    try:
        app.run(host="0.0.0.0", port=port, debug=debug)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
