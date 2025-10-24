from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.attendance import Attendance, AttendanceStatus
from app.utils.decorators import student_required
from datetime import datetime, date, timedelta
import logging

logger = logging.getLogger(__name__)

student_bp = Blueprint('student', __name__)

@student_bp.route('/profile', methods=['GET'])
@jwt_required()
@student_required
def get_student_profile(current_user):
    """Get student profile (Student only)"""
    try:
        return jsonify({
            'message': 'Profile retrieved successfully',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting student profile: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve profile',
            'error': str(e)
        }), 500

@student_bp.route('/profile', methods=['PUT'])
@jwt_required()
@student_required
def update_student_profile(current_user):
    """Update student profile (Student only)"""
    try:
        data = request.get_json()
        
        allowed_fields = ['name', 'email']
        updated_fields = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                setattr(current_user, field, data[field])
                updated_fields.append(field)
        
        if updated_fields:
            current_user.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': f'Profile updated successfully. Updated fields: {", ".join(updated_fields)}',
                'user': current_user.to_dict()
            }), 200
        else:
            return jsonify({
                'message': 'No valid fields to update',
                'error': 'no_updates'
            }), 400
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating student profile: {str(e)}")
        return jsonify({
            'message': 'Failed to update profile',
            'error': str(e)
        }), 500

@student_bp.route('/attendance/today', methods=['GET'])
@jwt_required()
@student_required
def get_today_attendance(current_user):
    """Get today's attendance status for student"""
    try:
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

@student_bp.route('/attendance/history', methods=['GET'])
@jwt_required()
@student_required
def get_attendance_history(current_user):
    """Get attendance history for student with pagination"""
    try:
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

@student_bp.route('/attendance/stats', methods=['GET'])
@jwt_required()
@student_required
def get_attendance_stats(current_user):
    """Get attendance statistics for student"""
    try:
        # Get current month dates
        today = date.today()
        first_day_of_month = today.replace(day=1)
        
        # Calculate statistics
        total_days = (today - first_day_of_month).days + 1
        present_days = Attendance.query.filter(
            Attendance.user_id == current_user.id,
            Attendance.date >= first_day_of_month,
            Attendance.date <= today,
            Attendance.status == AttendanceStatus.PRESENT
        ).count()
        
        absent_days = Attendance.query.filter(
            Attendance.user_id == current_user.id,
            Attendance.date >= first_day_of_month,
            Attendance.date <= today,
            Attendance.status == AttendanceStatus.ABSENT
        ).count()
        
        attendance_rate = (present_days / total_days * 100) if total_days > 0 else 0
        
        # Get recent attendance streak
        recent_attendance = Attendance.query.filter(
            Attendance.user_id == current_user.id,
            Attendance.date <= today
        ).order_by(Attendance.date.desc()).limit(7).all()
        
        current_streak = 0
        for att in recent_attendance:
            if att.status == AttendanceStatus.PRESENT:
                current_streak += 1
            else:
                break
        
        stats = {
            'current_month': {
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'attendance_rate': round(attendance_rate, 2)
            },
            'current_streak': current_streak,
            'total_attendance': Attendance.query.filter_by(user_id=current_user.id).count()
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

@student_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@student_required
def get_student_dashboard(current_user):
    """Get student dashboard data"""
    try:
        today = date.today()
        
        # Today's attendance
        today_attendance = Attendance.query.filter_by(
            user_id=current_user.id, 
            date=today
        ).first()
        
        # Recent attendance (last 5 days)
        recent_attendance = Attendance.query.filter(
            Attendance.user_id == current_user.id,
            Attendance.date <= today
        ).order_by(Attendance.date.desc()).limit(5).all()
        
        # Monthly stats
        first_day_of_month = today.replace(day=1)
        present_days_month = Attendance.query.filter(
            Attendance.user_id == current_user.id,
            Attendance.date >= first_day_of_month,
            Attendance.date <= today,
            Attendance.status == AttendanceStatus.PRESENT
        ).count()
        
        total_days_month = (today - first_day_of_month).days + 1
        monthly_rate = (present_days_month / total_days_month * 100) if total_days_month > 0 else 0
        
        dashboard_data = {
            'today_attendance': today_attendance.to_dict() if today_attendance else None,
            'recent_attendance': [att.to_dict() for att in recent_attendance],
            'monthly_stats': {
                'present_days': present_days_month,
                'total_days': total_days_month,
                'attendance_rate': round(monthly_rate, 2)
            },
            'user': current_user.to_dict()
        }
        
        return jsonify({
            'message': 'Dashboard data retrieved successfully',
            'data': dashboard_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting student dashboard: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve dashboard data',
            'error': str(e)
        }), 500

@student_bp.route('/test', methods=['GET'])
@jwt_required()
@student_required
def test_student_routes(current_user):
    """Test endpoint for student routes"""
    return jsonify({
        'message': 'Student routes are working',
        'user': current_user.to_dict()
    }), 200