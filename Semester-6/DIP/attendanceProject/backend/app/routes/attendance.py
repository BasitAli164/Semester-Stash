from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.user import User
from app.models.attendance import Attendance, AttendanceStatus
from app.services.face_service import FaceRecognitionService
from datetime import datetime, date, timedelta
import logging
import os

logger = logging.getLogger(__name__)

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/mark', methods=['POST'])
@jwt_required()
def mark_attendance():
    """Mark attendance using face recognition"""
    try:
        # Check if image is provided
        if 'image' not in request.files and 'image_data' not in request.json:
            return jsonify({
                'message': 'No image provided',
                'error': 'missing_image'
            }), 400
        
        image_path = None
        
        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            if file and FileHandler.allowed_file(file.filename):
                from app.utils.file_handlers import FileHandler
                image_path = FileHandler.save_uploaded_file(file, 'temp', 'attendance')
        
        # Handle base64 image data (from webcam)
        elif 'image_data' in request.json:
            from app.utils.file_handlers import FileHandler
            base64_data = request.json['image_data']
            image_path = FileHandler.save_base64_image(base64_data, 'temp', 'attendance')
        
        if not image_path:
            return jsonify({
                'message': 'Invalid image format',
                'error': 'invalid_image'
            }), 400
        
        # Recognize face
        face_service = FaceRecognitionService()
        threshold = request.json.get('threshold', 0.4)
        
        recognized_user, confidence, message = face_service.recognize_face(image_path, threshold)
        
        # Clean up temporary file
        try:
            if os.path.exists(image_path):
                os.remove(image_path)
        except:
            pass
        
        if not recognized_user:
            return jsonify({
                'message': message,
                'recognized': False,
                'confidence': confidence
            }), 400
        
        # Check if attendance already marked for today
        today = date.today()
        existing_attendance = Attendance.query.filter_by(
            user_id=recognized_user.id, 
            date=today
        ).first()
        
        if existing_attendance:
            return jsonify({
                'message': 'Attendance already marked for today',
                'attendance': existing_attendance.to_dict(),
                'student': recognized_user.to_dict(),
                'already_marked': True
            }), 200
        
        # Mark attendance
        attendance = Attendance.mark_attendance(
            user_id=recognized_user.id,
            confidence=confidence,
            status=AttendanceStatus.PRESENT,
            method='face_recognition'
        )
        
        if isinstance(attendance, Attendance):
            db.session.add(attendance)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Attendance marked successfully',
            'attendance': attendance.to_dict() if hasattr(attendance, 'to_dict') else None,
            'student': recognized_user.to_dict(),
            'already_marked': False,
            'confidence': confidence
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking attendance: {str(e)}")
        return jsonify({
            'message': 'Failed to mark attendance',
            'error': str(e)
        }), 500

@attendance_bp.route('/manual', methods=['POST'])
@jwt_required()
def mark_attendance_manual():
    """Manually mark attendance for a student"""
    try:
        data = request.get_json()
        
        required_fields = ['student_id', 'date', 'status']
        if not all(field in data for field in required_fields):
            return jsonify({
                'message': 'Missing required fields: student_id, date, status',
                'error': 'missing_fields'
            }), 400
        
        student = User.query.get(data['student_id'])
        if not student:
            return jsonify({
                'message': 'Student not found',
                'error': 'student_not_found'
            }), 404
        
        try:
            attendance_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'message': 'Invalid date format. Use YYYY-MM-DD',
                'error': 'invalid_date_format'
            }), 400
        
        # Check if attendance already exists
        existing = Attendance.query.filter_by(
            user_id=data['student_id'], 
            date=attendance_date
        ).first()
        
        if existing:
            return jsonify({
                'message': 'Attendance already exists for this date',
                'attendance': existing.to_dict(),
                'error': 'attendance_exists'
            }), 400
        
        # Create attendance record
        attendance = Attendance(
            user_id=data['student_id'],
            date=attendance_date,
            time=datetime.utcnow().time(),
            status=AttendanceStatus(data['status']),
            method='manual',
            confidence=None
        )
        
        db.session.add(attendance)
        db.session.commit()
        
        return jsonify({
            'message': 'Attendance marked manually',
            'attendance': attendance.to_dict(),
            'student': student.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking manual attendance: {str(e)}")
        return jsonify({
            'message': 'Failed to mark attendance manually',
            'error': str(e)
        }), 500

@attendance_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_attendance_reports():
    """Get attendance reports with filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        student_id = request.args.get('student_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        status = request.args.get('status')
        
        query = Attendance.query.join(User)
        
        # Apply filters
        if student_id:
            query = query.filter(Attendance.user_id == student_id)
        
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(Attendance.date >= start_date_obj)
            except ValueError:
                return jsonify({
                    'message': 'Invalid start date format. Use YYYY-MM-DD',
                    'error': 'invalid_date_format'
                }), 400
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(Attendance.date <= end_date_obj)
            except ValueError:
                return jsonify({
                    'message': 'Invalid end date format. Use YYYY-MM-DD',
                    'error': 'invalid_date_format'
                }), 400
        
        if status:
            try:
                query = query.filter(Attendance.status == AttendanceStatus(status))
            except ValueError:
                return jsonify({
                    'message': 'Invalid status',
                    'error': 'invalid_status'
                }), 400
        
        # Order by date descending
        attendance_pagination = query.order_by(Attendance.date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        reports_data = {
            'attendance': [attendance.to_dict() for attendance in attendance_pagination.items],
            'total': attendance_pagination.total,
            'pages': attendance_pagination.pages,
            'current_page': page,
            'per_page': per_page
        }
        
        return jsonify({
            'message': 'Attendance reports retrieved successfully',
            'data': reports_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting attendance reports: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve attendance reports',
            'error': str(e)
        }), 500

@attendance_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_attendance_stats():
    """Get attendance statistics"""
    try:
        # Date range (current month)
        today = date.today()
        first_day_of_month = today.replace(day=1)
        
        # Total statistics
        total_students = User.query.filter_by(is_active=True).count()
        total_attendance_today = Attendance.query.filter_by(date=today).count()
        
        # Monthly statistics
        monthly_attendance = db.session.query(
            Attendance.status,
            db.func.count(Attendance.id)
        ).filter(
            Attendance.date >= first_day_of_month,
            Attendance.date <= today
        ).group_by(Attendance.status).all()
        
        monthly_stats = {status.value: 0 for status in AttendanceStatus}
        for status, count in monthly_attendance:
            monthly_stats[status.value] = count
        
        # Daily attendance for last 7 days
        last_7_days = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_attendance = Attendance.query.filter_by(date=day).count()
            last_7_days.append({
                'date': day.isoformat(),
                'attendance_count': day_attendance
            })
        
        stats = {
            'overview': {
                'total_students': total_students,
                'attendance_today': total_attendance_today,
                'attendance_rate_today': (total_attendance_today / total_students * 100) if total_students > 0 else 0
            },
            'monthly': monthly_stats,
            'last_7_days': last_7_days
        }
        
        return jsonify({
            'message': 'Attendance statistics retrieved successfully',
            'data': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting attendance stats: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve attendance statistics',
            'error': str(e)
        }), 500

@attendance_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_attendance():
    """Get today's attendance"""
    try:
        today = date.today()
        attendance_today = Attendance.query.filter_by(date=today).all()
        
        return jsonify({
            'message': 'Today\'s attendance retrieved successfully',
            'data': {
                'date': today.isoformat(),
                'attendance': [att.to_dict() for att in attendance_today],
                'total_count': len(attendance_today)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting today's attendance: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve today\'s attendance',
            'error': str(e)
        }), 500