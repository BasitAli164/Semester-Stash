from flask import Blueprint, request, jsonify
from datetime import datetime, date
from app.utils.security import jwt_required
from app.models.attendance import Attendance
from app.models.student import Student
from app.services.database_service import db_service

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/mark', methods=['POST'])
@jwt_required
def mark_attendance():
    """Mark attendance for a student"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        student_id = data.get('student_id')
        name = data.get('name')
        class_name = data.get('class')
        status = data.get('status', 'Present')
        
        if not student_id or not name:
            return jsonify({'error': 'Student ID and name are required'}), 400
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Verify student exists
        student = Student.find_by_student_id(student_id, cursor)
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        # Mark attendance
        success = Attendance.mark_attendance(
            student_id, name, class_name or student.class_name, 
            cursor, conn, status
        )
        conn.close()
        
        if success:
            return jsonify({
                'message': 'Attendance marked successfully',
                'student': {
                    'student_id': student_id,
                    'name': name,
                    'class': class_name or student.class_name
                }
            }), 201
        else:
            return jsonify({
                'message': 'Attendance already marked today',
                'student': {
                    'student_id': student_id,
                    'name': name,
                    'class': class_name or student.class_name
                }
            }), 200
            
    except Exception as e:
        return jsonify({'error': f'Failed to mark attendance: {str(e)}'}), 500

@attendance_bp.route('/today', methods=['GET'])
@jwt_required
def get_today_attendance():
    """Get today's attendance records"""
    try:
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        records = Attendance.get_today_attendance(cursor)
        conn.close()
        
        return jsonify({
            'attendance': [record.to_dict() for record in records],
            'date': date.today().isoformat(),
            'count': len(records)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get attendance: {str(e)}'}), 500

@attendance_bp.route('/reports', methods=['GET'])
@jwt_required
def get_attendance_reports():
    """Get attendance reports for date range"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'error': 'Start date and end date are required'}), 400
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        records = Attendance.get_attendance_by_date_range(cursor, start_date, end_date)
        conn.close()
        
        return jsonify({
            'attendance': [record.to_dict() for record in records],
            'start_date': start_date,
            'end_date': end_date,
            'count': len(records)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get attendance report: {str(e)}'}), 500

@attendance_bp.route('/student/<student_id>', methods=['GET'])
@jwt_required
def get_student_attendance(student_id):
    """Get attendance history for a specific student"""
    try:
        days = request.args.get('days', 30, type=int)
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Verify student exists
        student = Student.find_by_student_id(student_id, cursor)
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        records = Attendance.get_student_attendance(cursor, student_id, days)
        conn.close()
        
        attendance_data = []
        for timestamp, status in records:
            attendance_data.append({
                'timestamp': timestamp,
                'status': status
            })
        
        return jsonify({
            'student': student.to_dict(),
            'attendance': attendance_data,
            'days': days,
            'count': len(attendance_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get student attendance: {str(e)}'}), 500

@attendance_bp.route('/stats', methods=['GET'])
@jwt_required
def get_attendance_stats():
    """Get attendance statistics"""
    try:
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Get today's stats
        cursor.execute('''
            SELECT COUNT(*) as total_students FROM students
        ''')
        total_students = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT COUNT(DISTINCT student_id) as present_today 
            FROM attendance 
            WHERE DATE(timestamp) = DATE('now')
        ''')
        present_today = cursor.fetchone()[0]
        
        # Get weekly stats
        cursor.execute('''
            SELECT DATE(timestamp) as date, COUNT(DISTINCT student_id) as present_count
            FROM attendance 
            WHERE DATE(timestamp) >= DATE('now', '-7 days')
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        ''')
        weekly_stats = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'stats': {
                'total_students': total_students,
                'present_today': present_today,
                'absent_today': total_students - present_today,
                'attendance_rate_today': (present_today / total_students * 100) if total_students > 0 else 0
            },
            'weekly_stats': [
                {'date': row[0], 'present_count': row[1]} 
                for row in weekly_stats
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get attendance stats: {str(e)}'}), 500