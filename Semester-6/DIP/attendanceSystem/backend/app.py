from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
from datetime import datetime

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Import config after app creation to avoid circular imports
    from config import config
    app.config.from_object(config)
    
    # CORS configuration
    CORS(app, 
         origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"], 
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         supports_credentials=True)
    
    # Import and register blueprints
    from api.students import students_bp
    from api.attendance import attendance_bp
    from api.system import system_bp
    
    app.register_blueprint(students_bp, url_prefix='/api')
    app.register_blueprint(attendance_bp, url_prefix='/api')
    app.register_blueprint(system_bp, url_prefix='/api')
    
    # Root endpoint - API welcome and overview
    @app.route('/')
    def root():
        return jsonify({
            'success': True,
            'message': 'Smart Attendance System API',
            'version': '1.0.0',
            'status': 'running',
            'timestamp': datetime.now().isoformat(),
            'endpoints': {
                'students': {
                    'register': 'POST /api/students',
                    'list': 'GET /api/students',
                    'details': 'GET /api/students/<student_id>',
                    'capture_faces': 'POST /api/students/<student_id>/capture',
                    'update': 'PUT /api/students/<student_id>',
                    'delete_faces': 'DELETE /api/students/<student_id>/faces',
                    'stats': 'GET /api/students/stats'
                },
                'attendance': {
                    'recognize': 'POST /api/attendance/recognize',
                    'mark': 'POST /api/attendance/mark',
                    'manual': 'POST /api/attendance/manual',
                    'get': 'GET /api/attendance',
                    'range': 'GET /api/attendance/range',
                    'stats': 'GET /api/attendance/stats',
                    'export': 'GET /api/attendance/export',
                    'model_status': 'GET /api/attendance/model/status'
                },
                'system': {
                    'health': 'GET /api/system/health',
                    'status': 'GET /api/system/status',
                    'train': 'POST /api/system/train',
                    'training_status': 'GET /api/system/training/status',
                    'validate_training': 'GET /api/system/training/validate',
                    'storage': 'GET /api/system/storage',
                    'logs': 'GET /api/system/logs',
                    'cleanup': 'POST /api/system/cleanup'
                }
            },
            'documentation': 'Visit /api for detailed API documentation'
        })
    
    # API documentation endpoint - Detailed endpoint information
    @app.route('/api')
    def api_docs():
        return jsonify({
            'success': True,
            'message': 'Smart Attendance System API Documentation',
            'version': '1.0.0',
            'base_url': 'http://localhost:5000/api',
            'authentication': 'None required for development',
            'response_format': 'JSON',
            'endpoints': {
                'students': {
                    'POST /api/students': {
                        'description': 'Register new student',
                        'parameters': {
                            'body': {
                                'student_id': 'string (required, unique)',
                                'name': 'string (required)',
                                'email': 'string (optional)',
                                'department': 'string (optional)',
                                'phone': 'string (optional)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'message': 'string'
                        }
                    },
                    'GET /api/students': {
                        'description': 'Get all students',
                        'parameters': {
                            'query': {
                                'include_stats': 'boolean (optional)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'students': 'array',
                            'count': 'integer'
                        }
                    },
                    'GET /api/students/<student_id>': {
                        'description': 'Get student details',
                        'parameters': {
                            'path': {
                                'student_id': 'string (required)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'student': 'object'
                        }
                    },
                    'POST /api/students/<student_id>/capture': {
                        'description': 'Capture face images for student',
                        'parameters': {
                            'path': {
                                'student_id': 'string (required)'
                            },
                            'body': {
                                'image': 'string (required, base64)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'message': 'string',
                            'images_captured': 'integer'
                        }
                    },
                    'PUT /api/students/<student_id>': {
                        'description': 'Update student information',
                        'parameters': {
                            'path': {
                                'student_id': 'string (required)'
                            },
                            'body': {
                                'name': 'string (optional)',
                                'email': 'string (optional)',
                                'department': 'string (optional)',
                                'phone': 'string (optional)',
                                'is_active': 'boolean (optional)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'message': 'string'
                        }
                    },
                    'DELETE /api/students/<student_id>/faces': {
                        'description': 'Delete all face images for student',
                        'parameters': {
                            'path': {
                                'student_id': 'string (required)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'message': 'string'
                        }
                    },
                    'GET /api/students/count': {
                        'description': 'Get total students count',
                        'response': {
                            'success': 'boolean',
                            'count': 'integer'
                        }
                    },
                    'GET /api/students/stats': {
                        'description': 'Get students statistics',
                        'response': {
                            'success': 'boolean',
                            'stats': 'object'
                        }
                    }
                },
                'attendance': {
                    'POST /api/attendance/recognize': {
                        'description': 'Recognize faces in image',
                        'parameters': {
                            'body': {
                                'image': 'string (required, base64)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'message': 'string',
                            'results': 'array'
                        }
                    },
                    'POST /api/attendance/mark': {
                        'description': 'Mark attendance for recognized students',
                        'parameters': {
                            'body': {
                                'recognized_faces': 'array (required)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'message': 'string',
                            'marked_count': 'integer',
                            'detailed_results': 'array'
                        }
                    },
                    'POST /api/attendance/manual': {
                        'description': 'Manually mark attendance',
                        'parameters': {
                            'body': {
                                'student_id': 'string (required)',
                                'status': 'string (optional, default: "present")',
                                'notes': 'string (optional)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'message': 'string'
                        }
                    },
                    'GET /api/attendance': {
                        'description': 'Get attendance records',
                        'parameters': {
                            'query': {
                                'date': 'string (optional, format: YYYY-MM-DD)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'report': 'object'
                        }
                    },
                    'GET /api/attendance/range': {
                        'description': 'Get attendance records for date range',
                        'parameters': {
                            'query': {
                                'start_date': 'string (required, format: YYYY-MM-DD)',
                                'end_date': 'string (required, format: YYYY-MM-DD)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'report': 'object'
                        }
                    },
                    'GET /api/attendance/stats': {
                        'description': 'Get attendance statistics',
                        'parameters': {
                            'query': {
                                'date': 'string (optional, format: YYYY-MM-DD)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'stats': 'object'
                        }
                    },
                    'GET /api/attendance/export': {
                        'description': 'Export attendance to CSV',
                        'parameters': {
                            'query': {
                                'date': 'string (optional, format: YYYY-MM-DD)'
                            }
                        },
                        'response': 'CSV file download'
                    },
                    'GET /api/attendance/model/status': {
                        'description': 'Check if face recognition model is ready',
                        'response': {
                            'success': 'boolean',
                            'model_ready': 'boolean'
                        }
                    }
                },
                'system': {
                    'GET /api/system/health': {
                        'description': 'System health check',
                        'response': {
                            'success': 'boolean',
                            'status': 'string',
                            'timestamp': 'string',
                            'components': 'object'
                        }
                    },
                    'GET /api/system/status': {
                        'description': 'Complete system status',
                        'response': {
                            'success': 'boolean',
                            'status': 'object'
                        }
                    },
                    'POST /api/system/train': {
                        'description': 'Train face recognition model',
                        'response': {
                            'success': 'boolean',
                            'message': 'string',
                            'stats': 'object'
                        }
                    },
                    'GET /api/system/training/status': {
                        'description': 'Get training status',
                        'response': {
                            'success': 'boolean',
                            'status': 'object'
                        }
                    },
                    'GET /api/system/training/validate': {
                        'description': 'Validate training data readiness',
                        'response': {
                            'success': 'boolean',
                            'can_train': 'boolean',
                            'issues': 'array'
                        }
                    },
                    'GET /api/system/storage': {
                        'description': 'Get storage information',
                        'response': {
                            'success': 'boolean',
                            'storage': 'object'
                        }
                    },
                    'GET /api/system/logs': {
                        'description': 'Get system logs',
                        'parameters': {
                            'query': {
                                'limit': 'integer (optional, default: 100)'
                            }
                        },
                        'response': {
                            'success': 'boolean',
                            'logs': 'array'
                        }
                    },
                    'POST /api/system/cleanup': {
                        'description': 'Clean up temporary files',
                        'response': {
                            'success': 'boolean',
                            'message': 'string'
                        }
                    }
                }
            }
        })
    
    # Health check endpoint - Simple status check
    @app.route('/health')
    def health():
        return jsonify({
            'success': True,
            'status': 'healthy',
            'service': 'Smart Attendance System API',
            'timestamp': datetime.now().isoformat()
        })
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'message': 'Bad request - check your input data',
            'error': str(error) if config.DEBUG else None
        }), 400
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Endpoint not found',
            'documentation': 'Visit /api for available endpoints',
            'error': str(error) if config.DEBUG else None
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'message': 'Method not allowed for this endpoint',
            'error': str(error) if config.DEBUG else None
        }), 405
    
    @app.errorhandler(415)
    def unsupported_media_type(error):
        return jsonify({
            'success': False,
            'message': 'Unsupported media type - please use application/json',
            'error': str(error) if config.DEBUG else None
        }), 415
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'error': str(error) if config.DEBUG else None
        }), 500
    
    # Handle generic exceptions
    @app.errorhandler(Exception)
    def handle_exception(error):
        # Log the error
        if config.DEBUG:
            print(f"Unhandled exception: {error}")
            import traceback
            traceback.print_exc()
        
        return jsonify({
            'success': False,
            'message': 'An unexpected error occurred',
            'error': str(error) if config.DEBUG else 'Internal server error'
        }), 500
    
    # Before request handler - for logging and pre-processing
    @app.before_request
    def before_request():
        if config.DEBUG:
            print(f"Incoming request: {request.method} {request.path}")
    
    # After request handler - for CORS and post-processing
    @app.after_request
    def after_request(response):
        # Add CORS headers to all responses
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        
        # Add security headers
        response.headers.add('X-Content-Type-Options', 'nosniff')
        response.headers.add('X-Frame-Options', 'DENY')
        response.headers.add('X-XSS-Protection', '1; mode=block')
        
        return response
    
    return app

def main():
    """Main function to run the application"""
    app = create_app()
    
    # Print startup information
    print("🚀 Starting Smart Attendance System Backend...")
    print("📍 API URL: http://{}:{}".format(config.HOST, config.PORT))
    print("📚 API Documentation: http://{}:{}/api".format(config.HOST, config.PORT))
    print("🔍 Health Check: http://{}:{}/health".format(config.HOST, config.PORT))
    print("🎯 Root Endpoint: http://{}:{}/".format(config.HOST, config.PORT))
    
    print("\n📊 Available Endpoints:")
    print("   Students:")
    print("   - GET  /api/students".ljust(40) + "Get all students")
    print("   - POST /api/students".ljust(40) + "Register new student")
    print("   - POST /api/students/{id}/capture".ljust(40) + "Capture face images")
    print("   - GET  /api/students/stats".ljust(40) + "Get student statistics")
    
    print("   Attendance:")
    print("   - POST /api/attendance/recognize".ljust(40) + "Recognize faces")
    print("   - POST /api/attendance/mark".ljust(40) + "Mark attendance")
    print("   - GET  /api/attendance".ljust(40) + "Get attendance records")
    print("   - GET  /api/attendance/stats".ljust(40) + "Get attendance statistics")
    print("   - GET  /api/attendance/export".ljust(40) + "Export to CSV")
    
    print("   System:")
    print("   - POST /api/system/train".ljust(40) + "Train model")
    print("   - GET  /api/system/status".ljust(40) + "System status")
    print("   - GET  /api/system/health".ljust(40) + "Health check")
    print("   - GET  /api/system/storage".ljust(40) + "Storage info")
    
    print("\n⚡ Server Configuration:")
    print("   - Host: {}".format(config.HOST))
    print("   - Port: {}".format(config.PORT))
    print("   - Debug: {}".format(config.DEBUG))
    print("   - Data Directory: {}".format(config.DATA_DIR))
    
    print("\n🎯 Starting server...")
    print("   Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        app.run(
            host=config.HOST,
            port=config.PORT,
            debug=config.DEBUG,
            threaded=True  # Handle multiple requests concurrently
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()