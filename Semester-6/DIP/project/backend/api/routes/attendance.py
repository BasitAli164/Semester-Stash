from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models.database import db, User, Student, Attendance, Embedding
from api.utils.face_recognition import FaceRecognition
from api.utils.security import allowed_file, secure_filename_custom
import os
import uuid
from datetime import datetime, date
import base64
import numpy as np

attendance_bp = Blueprint('attendance', __name__)
face_recognizer = FaceRecognition()

@attendance_bp.route('/api/mark-attendance', methods=['POST'])
@jwt_required()
def mark_attendance():
    try:
        current_user = get_jwt_identity()
        
        if 'image' not in request.files and 'image_data' not in request.json:
            return jsonify({'message': 'Image or image data is required'}), 400
        
        # Handle file upload or base64 image data
        if 'image' in request.files:
            file = request.files['image']
            if not file or not allowed_file(file.filename):
                return jsonify({'message': 'Invalid image file'}), 400
            
            # Save temporary image
            temp_filename = f"temp_{uuid.uuid4()}.jpg"
            temp_path = os.path.join('storage', 'images', 'temp', temp_filename)
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            file.save(temp_path)
            image_path = temp_path
            
        else:
            # Handle base64 image data
            image_data = request.json.get('image_data')
            if not image_data:
                return jsonify({'message': 'Image data is required'}), 400
            
            # Extract base64 data
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            temp_filename = f"temp_{uuid.uuid4()}.jpg"
            temp_path = os.path.join('storage', 'images', 'temp', temp_filename)
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            
            with open(temp_path, 'wb') as f:
                f.write(image_bytes)
            image_path = temp_path
        
        try:
            # Get all embeddings from database
            embeddings_data = Embedding.query.all()
            
            if not embeddings_data:
                return jsonify({'message': 'No trained embeddings found in system'}), 400
            
            # Create embeddings dictionary
            embeddings_dict = {}
            for emb in embeddings_data:
                embeddings_dict[emb.student_id] = emb.vector
            
            # Find best match
            best_match, distance, similarity = face_recognizer.find_best_match(image_path, embeddings_dict)
            
            if not best_match:
                return jsonify({
                    'message': 'No matching face found',
                    'matched': False,
                    'confidence': float(similarity) if similarity else 0
                }), 404
            
            # Check if attendance already marked today
            existing_attendance = Attendance.query.filter_by(
                student_id=best_match,
                date=date.today()
            ).first()
            
            if existing_attendance:
                return jsonify({
                    'message': 'Attendance already marked for today',
                    'matched': True,
                    'student_id': best_match,
                    'confidence': float(similarity),
                    'already_marked': True
                }), 200
            
            # Create attendance record
            new_attendance = Attendance(
                student_id=best_match,
                status='Present',
                confidence=float(similarity)
            )
            
            db.session.add(new_attendance)
            db.session.commit()
            
            # Get student details
            student = Student.query.get(best_match)
            user = User.query.get(student.user_id)
            
            return jsonify({
                'message': 'Attendance marked successfully',
                'matched': True,
                'student': {
                    'id': student.id,
                    'name': user.name,
                    'enrollment_id': student.enrollment_id
                },
                'confidence': float(similarity),
                'attendance_id': new_attendance.id,
                'timestamp': datetime.now().isoformat()
            }), 200
            
        finally:
            # Clean up temporary file
            if os.path.exists(image_path):
                os.remove(image_path)
                
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Attendance marking failed: {str(e)}'}), 500

@attendance_bp.route('/api/reports', methods=['GET'])
@jwt_required()
def get_attendance_reports():
    try:
        current_user = get_jwt_identity()
        student_id = request.args.get('student_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = Attendance.query.join(Student).join(User)
        
        # Filter by student if user is student or specific student requested
        if current_user['role'] == 'student':
            student = Student.query.filter_by(user_id=current_user['id']).first()
            if student:
                query = query.filter(Attendance.student_id == student.id)
        elif student_id:
            query = query.filter(Attendance.student_id == student_id)
        
        # Date filters
        if start_date:
            query = query.filter(Attendance.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        if end_date:
            query = query.filter(Attendance.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
        
        attendance_records = query.order_by(Attendance.date.desc(), Attendance.time.desc()).all()
        
        reports = []
        for record in attendance_records:
            report_data = record.to_dict()
            report_data['student_name'] = record.student.user.name
            report_data['enrollment_id'] = record.student.enrollment_id
            reports.append(report_data)
        
        return jsonify({
            'reports': reports,
            'count': len(reports),
            'total_present': len([r for r in reports if r['status'] == 'Present'])
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to fetch reports: {str(e)}'}), 500

@attendance_bp.route('/api/attendance-stats', methods=['GET'])
@jwt_required()
def get_attendance_stats():
    try:
        current_user = get_jwt_identity()
        
        if current_user['role'] == 'student':
            student = Student.query.filter_by(user_id=current_user['id']).first()
            if not student:
                return jsonify({'message': 'Student profile not found'}), 404
            
            total_days = Attendance.query.filter_by(student_id=student.id).count()
            present_days = Attendance.query.filter_by(student_id=student.id, status='Present').count()
            
            attendance_rate = (present_days / total_days * 100) if total_days > 0 else 0
            
            return jsonify({
                'total_days': total_days,
                'present_days': present_days,
                'attendance_rate': round(attendance_rate, 2),
                'student_id': student.id
            }), 200
            
        else:  # Admin - overall stats
            total_students = Student.query.filter_by(is_active=True).count()
            total_attendance_today = Attendance.query.filter_by(date=date.today()).count()
            
            # Recent attendance (last 7 days)
            recent_attendance = Attendance.query.filter(
                Attendance.date >= date.today().replace(day=date.today().day-7)
            ).count()
            
            return jsonify({
                'total_students': total_students,
                'attendance_today': total_attendance_today,
                'recent_attendance': recent_attendance,
                'attendance_rate_today': round((total_attendance_today / total_students * 100) if total_students > 0 else 0, 2)
            }), 200
            
    except Exception as e:
        return jsonify({'message': f'Failed to fetch stats: {str(e)}'}), 500