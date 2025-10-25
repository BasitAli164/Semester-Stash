#!/usr/bin/env python3
"""
Face Attendance System Backend
Run with: python run.py
"""

import os
from app.main import create_app

# Create application instance
app = create_app('development')

if __name__ == '__main__':
    print("🚀 Starting Face Attendance System Backend...")
    print("📍 Access the API at: http://localhost:5000")
    print("📚 API documentation available at: http://localhost:5000/api/health")
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )