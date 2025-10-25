import os
import json
from flask import Blueprint, request, jsonify
from app.utils.security import jwt_required
from app.utils.helpers import save_uploaded_file, ensure_folders_exist, cleanup_file
from app.models.student import Student
from app.services.database_service import db_service
from app.services.facenet_service import face_net_service
from app.config import Config

students_bp = Blueprint('students', __name__)

@students_bp.route('', methods=['GET'])  # REMOVED TRAILING SLASH
@jwt_required
def get_students():
    """Get all students"""
    try:
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        students = Student.get_all(cursor)
        conn.close()
        
        return jsonify({
            'students': [student.to_dict() for student in students],
            'count': len(students)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get students: {str(e)}'}), 500

@students_bp.route('/<int:student_id>', methods=['GET'])
@jwt_required
def get_student(student_id):
    """Get student by ID"""
    try:
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        student = Student.find_by_id(student_id, cursor)
        conn.close()
        
        if student:
            return jsonify({'student': student.to_dict()}), 200
        else:
            return jsonify({'error': 'Student not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Failed to get student: {str(e)}'}), 500

@students_bp.route('', methods=['POST'])  # REMOVED TRAILING SLASH
@jwt_required
def register_student():
    """Register a new student"""
    try:
        ensure_folders_exist()
        
        # Get form data
        name = request.form.get('name')
        student_id = request.form.get('student_id')
        class_name = request.form.get('class')
        
        if not name or not student_id:
            return jsonify({'error': 'Name and student ID are required'}), 400
        
        # Check if student already exists
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        existing_student = Student.find_by_student_id(student_id, cursor)
        if existing_student:
            conn.close()
            return jsonify({'error': 'Student ID already exists'}), 400
        
        # Handle file uploads
        uploaded_files = request.files.getlist('images')
        if not uploaded_files:
            conn.close()
            return jsonify({'error': 'At least one image is required'}), 400
        
        saved_image_paths = []
        temp_image_paths = []
        
        # Save uploaded images
        for file in uploaded_files:
            if file.filename:
                filename = save_uploaded_file(file, Config.STUDENT_IMAGES_FOLDER)
                if filename:
                    file_path = os.path.join(Config.STUDENT_IMAGES_FOLDER, filename)
                    saved_image_paths.append(file_path)
                    temp_image_paths.append(file_path)
        
        if not saved_image_paths:
            conn.close()
            return jsonify({'error': 'No valid images uploaded'}), 400
        
        # Extract face embeddings
        print(f"Processing {len(temp_image_paths)} images for {name}...")
        avg_embedding = face_net_service.process_student_registration(temp_image_paths)
        
        if avg_embedding is None:
            # Cleanup uploaded files
            for file_path in temp_image_paths:
                cleanup_file(file_path)
            conn.close()
            return jsonify({'error': 'No faces detected in uploaded images'}), 400
        
        # Create and save student
        student = Student(
            name=name,
            student_id=student_id,
            class_name=class_name,
            face_embedding=avg_embedding,
            image_paths=saved_image_paths
        )
        
        student.save(cursor, conn)
        conn.close()
        
        return jsonify({
            'message': 'Student registered successfully',
            'student': student.to_dict()
        }), 201
        
    except Exception as e:
        # Cleanup on error
        if 'temp_image_paths' in locals():
            for file_path in temp_image_paths:
                cleanup_file(file_path)
        return jsonify({'error': f'Failed to register student: {str(e)}'}), 500

@students_bp.route('/<int:student_id>', methods=['PUT'])
@jwt_required
def update_student(student_id):
    """Update student information"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        student = Student.find_by_id(student_id, cursor)
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        # Update fields
        if 'name' in data:
            student.name = data['name']
        if 'class' in data:
            student.class_name = data['class']
        
        student.save(cursor, conn)
        conn.close()
        
        return jsonify({
            'message': 'Student updated successfully',
            'student': student.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update student: {str(e)}'}), 500

@students_bp.route('/<int:student_id>', methods=['DELETE'])
@jwt_required
def delete_student(student_id):
    """Delete student"""
    try:
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        student = Student.find_by_id(student_id, cursor)
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        # Cleanup image files
        for image_path in student.image_paths:
            cleanup_file(image_path)
        
        student.delete(cursor, conn)
        conn.close()
        
        return jsonify({'message': 'Student deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete student: {str(e)}'}), 500

@students_bp.route('/embeddings', methods=['GET'])
@jwt_required
def get_embeddings():
    """Get all student embeddings for recognition"""
    try:
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        embeddings_dict = Student.get_all_embeddings(cursor)
        conn.close()
        
        # Convert numpy arrays to lists for JSON serialization
        serializable_dict = {}
        for student_id, data in embeddings_dict.items():
            serializable_dict[student_id] = {
                'name': data['name'],
                'class': data['class'],
                'embedding': data['embedding'].tolist()
            }
        
        return jsonify({
            'embeddings': serializable_dict,
            'count': len(serializable_dict)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get embeddings: {str(e)}'}), 500