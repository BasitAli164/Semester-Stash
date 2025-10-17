from flask import Blueprint, request, jsonify

# Create blueprint
students_bp = Blueprint('students', __name__)

@students_bp.route('/students', methods=['POST'])
def register_student():
    """Register a new student"""
    try:
        from services.student_service import StudentService
        student_service = StudentService()
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        success, message = student_service.register_student(data)
        
        return jsonify({
            'success': success,
            'message': message
        }), 200 if success else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/<student_id>/capture', methods=['POST'])
def capture_faces(student_id):
    """Capture face images for a student"""
    try:
        from services.student_service import StudentService
        student_service = StudentService()
        
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'message': 'Image data is required'
            }), 400
        
        success, message, count = student_service.capture_face_images(
            student_id, data['image']
        )
        
        return jsonify({
            'success': success,
            'message': message,
            'images_captured': count
        }), 200 if success else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students', methods=['GET'])
def get_students():
    """Get all students"""
    try:
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
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get student details"""
    try:
        from services.student_service import StudentService
        student_service = StudentService()
        
        student = student_service.get_student_info(student_id)
        
        if not student:
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
        
        return jsonify({
            'success': True,
            'student': student
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    """Update student information"""
    try:
        from services.student_service import StudentService
        student_service = StudentService()
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        success, message = student_service.update_student(student_id, data)
        
        return jsonify({
            'success': success,
            'message': message
        }), 200 if success else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/<student_id>/faces', methods=['DELETE'])
def delete_student_faces(student_id):
    """Delete all face images for a student"""
    try:
        from services.student_service import StudentService
        student_service = StudentService()
        
        success, message = student_service.delete_student_faces(student_id)
        
        return jsonify({
            'success': success,
            'message': message
        }), 200 if success else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/count', methods=['GET'])
def get_students_count():
    """Get students count"""
    try:
        from services.student_service import StudentService
        student_service = StudentService()
        
        count = student_service.db.get_students_count()
        
        return jsonify({
            'success': True,
            'count': count
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@students_bp.route('/students/stats', methods=['GET'])
def get_students_stats():
    """Get students statistics"""
    try:
        from services.student_service import StudentService
        student_service = StudentService()
        
        stats = student_service.get_student_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500