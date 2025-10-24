from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
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
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
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

@attendance_bp.route('/mark-manual', methods=['POST'])
@jwt_required()
def mark_attendance_manual():
    """Manually mark attendance"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        data = request.get_json()
        
        try:
            attendance_date = datetime.strptime(data.get('date', date.today().isoformat()), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'message': 'Invalid date format. Use YYYY-MM-DD',
                'error': 'invalid_date_format'
            }), 400
        
        # Check if attendance already exists
        existing = Attendance.query.filter_by(
            user_id=current_user.id, 
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
            user_id=current_user.id,
            date=attendance_date,
            time=datetime.utcnow().time(),
            status=AttendanceStatus(data.get('status', 'present')),
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

@attendance_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_attendance_reports():
    """Get attendance reports with filtering"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        status = request.args.get('status')
        
        query = Attendance.query.filter_by(user_id=current_user.id)
        
        # Apply filters
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
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        # Date range (current month)
        today = date.today()
        first_day_of_month = today.replace(day=1)
        
        # Total statistics
        total_attendance_today = Attendance.query.filter_by(user_id=current_user.id, date=today).count()
        
        # Monthly statistics
        monthly_attendance = db.session.query(
            Attendance.status,
            db.func.count(Attendance.id)
        ).filter(
            Attendance.user_id == current_user.id,
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
            day_attendance = Attendance.query.filter_by(user_id=current_user.id, date=day).count()
            last_7_days.append({
                'date': day.isoformat(),
                'attendance_count': day_attendance
            })
        
        stats = {
            'overview': {
                'attendance_today': total_attendance_today,
                'attendance_rate_today': (total_attendance_today / 1 * 100) if total_attendance_today > 0 else 0
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
    """Get today's attendance status"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        today = date.today()
        attendance = Attendance.query.filter_by(
            user_id=current_user.id, 
            date=today
        ).first()
        
        attendance_data = attendance.to_dict() if attendance else None
        
        return jsonify({
            'message': 'Today\'s attendance retrieved successfully',
            'attendance': attendance_data,
            'date': today.isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting today's attendance: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve attendance',
            'error': str(e)
        }), 500

@attendance_bp.route('/history', methods=['GET'])
@jwt_required()
def get_attendance_history():
    """Get attendance history with pagination"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 30, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Attendance.query.filter_by(user_id=current_user.id)
        
        # Date filtering
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
        
        # Order by date descending
        attendance_pagination = query.order_by(Attendance.date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        attendance_data = {
            'attendance': [attendance.to_dict() for attendance in attendance_pagination.items],
            'total': attendance_pagination.total,
            'pages': attendance_pagination.pages,
            'current_page': page,
            'per_page': per_page
        }
        
        return jsonify({
            'message': 'Attendance history retrieved successfully',
            'data': attendance_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting attendance history: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve attendance history',
            'error': str(e)
        }), 500

@attendance_bp.route('/export', methods=['GET'])
@jwt_required()
def export_attendance():
    """Export attendance data to CSV"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        import csv
        from io import StringIO
        from flask import Response
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Attendance.query.filter_by(user_id=current_user.id)
        
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
        writer.writerow(['Date', 'Time', 'Status', 'Method', 'Confidence'])
        
        # Write data
        for attendance in attendance_data:
            writer.writerow([
                attendance.date.isoformat(),
                attendance.time.isoformat() if attendance.time else '',
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