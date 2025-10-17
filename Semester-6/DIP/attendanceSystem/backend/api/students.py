from flask import Blueprint, request, jsonify
from typing import Dict, List, Any
from datetime import datetime

# Create blueprint
students_bp = Blueprint('students', __name__)

# Mock students data for testing
MOCK_STUDENTS = [
    {
        'id': '1',
        'student_id': 'STU001',
        'name': 'John Doe',
        'email': 'john.doe@university.edu',
        'department': 'Computer Science',
        'registration_date': '2024-01-15',
        'is_active': True,
        'created_at': '2024-01-15 10:00:00',
        'face_images_captured': 5
    },
    {
        'id': '2', 
        'student_id': 'STU002',
        'name': 'Jane Smith',
        'email': 'jane.smith@university.edu',
        'department': 'Electrical Engineering',
        'registration_date': '2024-01-16',
        'is_active': True,
        'created_at': '2024-01-16 11:30:00',
        'face_images_captured': 3
    },
    {
        'id': '3',
        'student_id': 'STU003',
        'name': 'Mike Johnson',
        'email': 'mike.johnson@university.edu',
        'department': 'Mechanical Engineering',
        'registration_date': '2024-01-17',
        'is_active': False,
        'created_at': '2024-01-17 09:15:00',
        'face_images_captured': 0
    }
]

@students_bp.route('/students', methods=['GET'])
def get_all_students():
    """Get all students"""
    try:
        print("📋 Fetching all students")
        return jsonify({
            'success': True,
            'students': MOCK_STUDENTS
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
        
        # Find student in mock data
        student = next((s for s in MOCK_STUDENTS if s['student_id'] == student_id), None)
        
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

@students_bp.route('/students', methods=['POST'])
def register_student():
    """Register new student"""
    try:
        data = request.get_json()
        print(f"➕ Registering new student: {data}")
        
        # Validate required fields
        if not data or 'student_id' not in data or 'name' not in data:
            return jsonify({
                'success': False,
                'message': 'Student ID and name are required'
            }), 400
        
        # Check if student ID already exists
        existing_student = next((s for s in MOCK_STUDENTS if s['student_id'] == data['student_id']), None)
        if existing_student:
            return jsonify({
                'success': False,
                'message': 'Student ID already exists'
            }), 400
        
        # Create new student
        new_student = {
            'id': str(len(MOCK_STUDENTS) + 1),
            'student_id': data['student_id'],
            'name': data['name'],
            'email': data.get('email', ''),
            'department': data.get('department', ''),
            'registration_date': datetime.now().strftime('%Y-%m-%d'),
            'is_active': True,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'face_images_captured': 0
        }
        
        # Add to mock data (in real app, save to database)
        MOCK_STUDENTS.append(new_student)
        
        return jsonify({
            'success': True,
            'message': 'Student registered successfully',
            'student': new_student
        }), 201
        
    except Exception as e:
        print(f"❌ Error in register_student: {str(e)}")
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
        
        # Find student
        student_index = next((i for i, s in enumerate(MOCK_STUDENTS) if s['student_id'] == student_id), -1)
        
        if student_index == -1:
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
        
        # Update student data
        if 'name' in data:
            MOCK_STUDENTS[student_index]['name'] = data['name']
        if 'email' in data:
            MOCK_STUDENTS[student_index]['email'] = data['email']
        if 'department' in data:
            MOCK_STUDENTS[student_index]['department'] = data['department']
        if 'is_active' in data:
            MOCK_STUDENTS[student_index]['is_active'] = data['is_active']
        
        return jsonify({
            'success': True,
            'message': 'Student updated successfully',
            'student': MOCK_STUDENTS[student_index]
        }), 200
        
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
        
        # Find student
        student_index = next((i for i, s in enumerate(MOCK_STUDENTS) if s['student_id'] == student_id), -1)
        
        if student_index == -1:
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
        
        # Remove student from mock data
        deleted_student = MOCK_STUDENTS.pop(student_index)
        
        return jsonify({
            'success': True,
            'message': 'Student deleted successfully',
            'student': deleted_student
        }), 200
        
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
        
        # Find student
        student_index = next((i for i, s in enumerate(MOCK_STUDENTS) if s['student_id'] == student_id), -1)
        
        if student_index == -1:
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
        
        # Update face images count
        images_count = len(data.get('images', []))
        MOCK_STUDENTS[student_index]['face_images_captured'] = images_count
        
        return jsonify({
            'success': True,
            'message': f'Captured {images_count} face images for student',
            'images_captured': images_count
        }), 200
        
    except Exception as e:
        print(f"❌ Error in capture_face_images: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500