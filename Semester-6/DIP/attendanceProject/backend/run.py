import os
from app import create_app
from app.utils.config_manager import ConfigManager

# Load environment variables
ConfigManager.load_environment()

# Create app instance
app = create_app()

@app.route('/')
def hello():
    return {'message': 'Facial Attendance System API', 'status': 'running'}

@app.route('/health')
def health():
    return {'status': 'healthy', 'service': 'facial-attendance-api'}

@app.route('/api/test')
def test_all():
    return {
        'message': 'All systems working!', 
        'endpoints': {
            'auth': '/api/auth/*',
            'admin': '/api/admin/*', 
            'student': '/api/student/*',
            'attendance': '/api/attendance/*'
        }
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Facial Attendance System API on port {port}")
    print(f"📍 Local URL: http://localhost:{port}/")
    print(f"❤️  Health Check: http://localhost:{port}/health")
    print(f"🧪 Test Endpoint: http://localhost:{port}/api/test")
    print(f"🔐 Auth Endpoints: http://localhost:{port}/api/auth/*")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )