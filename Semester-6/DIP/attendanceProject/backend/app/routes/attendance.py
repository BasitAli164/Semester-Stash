from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.models.attendance import Attendance, AttendanceStatus
from app.utils.decorators import admin_required, student_required
from app.services.face_service import FaceRecognitionService
from datetime import datetime, date, timedelta
import logging

logger = logging.getLogger(__name__)

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/mark', methods=['POST'])
@jwt_required()
@student_required
def mark_attendance(current_user):
    """Mark attendance using face recognition (Student only)"""
    try:
        # Check if attendance already marked for today
        today = date.today()
        existing_attendance = Attendance.query.filter_by(
            user_id=current_user.id, 
            date=today
        ).first()
        
        if existing_attendance:
            return jsonify({
                'message': 'Attendance already marked for today',
                'attendance': existing_attendance.to_dict(),
                'already_marked': True
            }), 200
        
        # Verify face if image provided
        confidence = None
        if 'image_data' in request.json or 'image' in request.files:
            from app.utils.file_handlers import FileHandler
            import os
            
            image_path = None
            
            # Handle file upload
            if 'image' in request.files:
                file = request.files['image']
                if file and FileHandler.allowed_file(file.filename):
                    image_path = FileHandler.save_uploaded_file(file, current_user.id, 'attendance')
            
            # Handle base64 image data
            elif 'image_data' in request.json:
                base64_data = request.json['image_data']
                image_path = FileHandler.save_base64_image(base64_data, current_user.id, 'attendance')
            
            if image_path:
                # Verify face
                face_service = FaceRecognitionService()
                threshold = request.json.get('threshold', 0.4)
                
                verified, confidence, message = face_service.verify_face(
                    image_path, 
                    current_user.id, 
                    threshold
                )
                
                # Clean up temporary file
                try:
                    if os.path.exists(image_path):
                        os.remove(image_path)
                except:
                    pass
                
                if not verified:
                    return jsonify({
                        'message': f'Face verification failed: {message}',
                        'error': 'face_verification_failed',
                        'confidence': confidence
                    }), 400
        
        # Mark attendance
        attendance = Attendance.mark_attendance(
            user_id=current_user.id,
            confidence=confidence,
            status=AttendanceStatus.PRESENT,
            method='face_recognition' if confidence else 'manual'
        )
        
        if isinstance(attendance, Attendance):
            db.session.add(attendance)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Attendance marked successfully',
            'attendance': attendance.to_dict() if hasattr(attendance, 'to_dict') else None,
            'already_marked': False
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking attendance: {str(e)}")
        return jsonify({
            'message': 'Failed to mark attendance',
            'error': str(e)
        }), 500

@attendance_bp.route('/admin/mark-manual', methods=['POST'])
@admin_required
def mark_attendance_manual(current_user):
    """Manually mark attendance for a student (Admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['user_id', 'date', 'status']
        if not all(field in data for field in required_fields):
            return jsonify({
                'message': 'Missing required fields: user_id, date, status',
                'error': 'missing_fields'
            }), 400
        
        student = User.query.get(data['user_id'])
        if not student or student.role != UserRole.STUDENT:
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
            user_id=data['user_id'], 
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
            user_id=data['user_id'],
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
            'attendance': attendance.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking manual attendance: {str(e)}")
        return jsonify({
            'message': 'Failed to mark attendance manually',
            'error': str(e)
        }), 500

@attendance_bp.route('/admin/reports', methods=['GET'])
@admin_required
def get_attendance_reports(current_user):
    """Get attendance reports with filtering (Admin only)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        user_id = request.args.get('user_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        status = request.args.get('status')
        
        query = Attendance.query.join(User)
        
        # Apply filters
        if user_id:
            query = query.filter(Attendance.user_id == user_id)
        
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

@attendance_bp.route('/admin/stats', methods=['GET'])
@admin_required
def get_admin_attendance_stats(current_user):
    """Get admin attendance statistics (Admin only)"""
    try:
        # Date range (current month)
        today = date.today()
        first_day_of_month = today.replace(day=1)
        
        # Total statistics
        total_students = User.query.filter_by(role=UserRole.STUDENT, is_active=True).count()
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
        logger.error(f"Error getting admin attendance stats: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve attendance statistics',
            'error': str(e)
        }), 500

@attendance_bp.route('/admin/export', methods=['GET'])
@admin_required
def export_attendance(current_user):
    """Export attendance data to CSV (Admin only)"""
    try:
        import csv
        from io import StringIO
        from flask import Response
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Attendance.query.join(User).filter(User.role == UserRole.STUDENT)
        
        if start_date:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Attendance.date >= start_date_obj)
        
        if end_date:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Attendance.date <= end_date_obj)
        
        attendance_data = query.order_by(Attendance.date.desc()).all()
        
        # Create CSV in memory
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Date', 'Time', 'Student ID', 'Student Name', 'Status', 'Method', 'Confidence'])
        
        # Write data
        for attendance in attendance_data:
            writer.writerow([
                attendance.date.isoformat(),
                attendance.time.isoformat() if attendance.time else '',
                attendance.user_id,
                attendance.user.name,
                attendance.status.value,
                attendance.method,
                attendance.confidence or ''
            ])
        
        # Create response
        response = Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename=attendance_export_{date.today()}.csv'
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error exporting attendance: {str(e)}")
        return jsonify({
            'message': 'Failed to export attendance data',
            'error': str(e)
        }), 500

@attendance_bp.route('/test', methods=['GET'])
def test_attendance_routes():
    """Test endpoint for attendance routes"""
    return jsonify({
        'message': 'Attendance routes are working',
        'status': 'active'
    }), 200