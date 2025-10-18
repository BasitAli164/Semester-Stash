# backend/api/students.py
from flask import Blueprint, request, jsonify
from typing import Dict, List, Any
from datetime import datetime

# Create blueprint
students_bp = Blueprint('students', __name__)

@students_bp.route('/students', methods=['GET'])
def get_all_students():
    """Get all students"""
    try:
        print("📋 Fetching all students")
        
        from services.student_service import StudentService
        student_service = StudentService()
        
        include_stats = request.args.get('include_stats', 'false').lower() == 'true'
        students = student_service.get_all_students(include_stats=include_stats)
        
        return jsonify({
            'success': True,
            'students': students,
            'count': len(students)
        }), 200
    except Exception as e:
        print(f"❌ Error in get_all_students: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get student by ID"""
    try:
        print(f"📋 Fetching student: {student_id}")
        
        from services.student_service import StudentService
        student_service = StudentService()
        
        student = student_service.get_student_info(student_id)
        
        if student:
            return jsonify({
                'success': True,
                'student': student
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
            
    except Exception as e:
        print(f"❌ Error in get_student: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

# backend/api/students.py - Update the register_student endpoint
@students_bp.route('/students', methods=['POST'])
def register_student():
    """Register new student with face images"""
    try:
        # Check if it's form data with images or JSON without images
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle form data with images
            return register_student_with_images()
        else:
            # Handle JSON data (old way - just student info)
            return register_student_basic()
        
    except Exception as e:
        print(f"❌ Error in register_student: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

def register_student_with_images():
    """Register student with face images from form data"""
    try:
        # Get form data
        student_id = request.form.get('student_id')
        name = request.form.get('name')
        email = request.form.get('email')
        department = request.form.get('department')
        phone = request.form.get('phone')
        
        print(f"➕ Registering new student with images: {student_id} - {name}")
        
        # Validate required fields
        required_fields = ['student_id', 'name', 'email', 'department']
        for field in required_fields:
            if not request.form.get(field) or not request.form.get(field).strip():
                return jsonify({
                    'success': False,
                    'message': f'{field.replace("_", " ").title()} is required'
                }), 400
        
        # Get uploaded images
        images = request.files.getlist('images')
        print(f"📸 Received {len(images)} images for student {student_id}")
        
        if len(images) == 0:
            return jsonify({
                'success': False,
                'message': 'At least one face image is required'
            }), 400
        
        from services.student_service import StudentService
        student_service = StudentService()
        
        # Prepare student data
        student_data = {
            'student_id': student_id,
            'name': name,
            'email': email,
            'department': department,
            'phone': phone,
            'images': images  # Pass images to service
        }
        
        success, message = student_service.register_student_with_images(student_data)
        
        if success:
            # Get the created student info
            student = student_service.get_student_info(student_id)
            
            print(f"✅ Student registered successfully with images: {student_id}")
            
            return jsonify({
                'success': True,
                'message': message,
                'student': student
            }), 201
        else:
            print(f"❌ Student registration with images failed: {message}")
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
    except Exception as e:
        print(f"❌ Error in register_student_with_images: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

def register_student_basic():
    """Register student without images (basic info only)"""
    try:
        data = request.get_json()
        print(f"➕ Registering new student (basic): {data}")
        
        # Validate required fields
        required_fields = ['student_id', 'name', 'email', 'department']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    'success': False,
                    'message': f'{field.replace("_", " ").title()} is required'
                }), 400
        
        from services.student_service import StudentService
        student_service = StudentService()
        
        success, message = student_service.register_student(data)
        
        if success:
            # Get the created student info
            student_id = data['student_id']
            student = student_service.get_student_info(student_id)
            
            print(f"✅ Student registered successfully (basic): {student_id}")
            
            return jsonify({
                'success': True,
                'message': message,
                'student': student
            }), 201
        else:
            print(f"❌ Student registration (basic) failed: {message}")
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
    except Exception as e:
        print(f"❌ Error in register_student_basic: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500
    
@students_bp.route('/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    """Update student"""
    try:
        data = request.get_json()
        print(f"✏️ Updating student: {student_id}")
        
        from services.student_service import StudentService
        student_service = StudentService()
        
        success, message = student_service.update_student(student_id, data)
        
        if success:
            # Get updated student info
            student = student_service.get_student_info(student_id)
            return jsonify({
                'success': True,
                'message': message,
                'student': student
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
    except Exception as e:
        print(f"❌ Error in update_student: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete student"""
    try:
        print(f"🗑️ Deleting student: {student_id}")
        
        from services.student_service import StudentService
        student_service = StudentService()
        
        # Get student info before deletion
        student = student_service.get_student_info(student_id)
        if not student:
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
        
        # Delete face images first
        student_service.delete_student_faces(student_id)
        
        # For now, we'll just deactivate the student since we don't have delete in database
        success, message = student_service.update_student(student_id, {'is_active': False})
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Student deactivated successfully',
                'student': student
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
    except Exception as e:
        print(f"❌ Error in delete_student: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/<student_id>/capture', methods=['POST'])
def capture_face_images(student_id):
    """Capture face images for student"""
    try:
        data = request.get_json()
        print(f"📸 Capturing face images for student: {student_id}")
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'message': 'Image data is required'
            }), 400
        
        from services.student_service import StudentService
        student_service = StudentService()
        
        success, message, images_captured = student_service.capture_face_images(student_id, data['image'])
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'images_captured': images_captured
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
    except Exception as e:
        print(f"❌ Error in capture_face_images: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/<student_id>/faces', methods=['DELETE'])
def delete_student_faces(student_id):
    """Delete all face images for student"""
    try:
        print(f"🗑️ Deleting face images for student: {student_id}")
        
        from services.student_service import StudentService
        student_service = StudentService()
        
        success, message = student_service.delete_student_faces(student_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
    except Exception as e:
        print(f"❌ Error in delete_student_faces: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/stats', methods=['GET'])
def get_student_stats():
    """Get student statistics"""
    try:
        print("📊 Getting student statistics")
        
        from services.student_service import StudentService
        student_service = StudentService()
        
        stats = student_service.get_student_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        print(f"❌ Error in get_student_stats: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500