from flask import Blueprint, request, jsonify
from app.utils.security import jwt_required
from app.models.attendance import Attendance
from app.services.database_service import db_service
from datetime import datetime, timedelta

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/today', methods=['GET'])
@jwt_required
def get_today_attendance():
    """Get today's attendance records"""
    try:
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Include ID in the query
        cursor.execute('''
            SELECT id, name, student_id, class, timestamp, status
            FROM attendance 
            WHERE DATE(timestamp) = DATE('now')
            ORDER BY timestamp DESC
        ''')
        records = []
        for row in cursor.fetchall():
            attendance = Attendance(
                id=row[0],  # Include ID
                name=row[1],
                student_id=row[2],
                class_name=row[3],
                timestamp=row[4],
                status=row[5]
            )
            records.append(attendance)
        conn.close()
        
        return jsonify({
            'attendance': [record.to_dict() for record in records],
            'count': len(records)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get today\'s attendance: {str(e)}'}), 500

@attendance_bp.route('/mark', methods=['POST'])
@jwt_required
def mark_attendance():
    """Mark attendance for a student"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        name = data.get('name')
        class_name = data.get('class')
        status = data.get('status', 'Present')
        
        if not student_id or not name:
            return jsonify({'error': 'Student ID and name are required'}), 400
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        success = Attendance.mark_attendance(student_id, name, class_name, cursor, conn, status)
        conn.close()
        
        if success:
            return jsonify({'message': 'Attendance marked successfully'}), 201
        else:
            return jsonify({'message': 'Attendance already marked today'}), 200
            
    except Exception as e:
        return jsonify({'error': f'Failed to mark attendance: {str(e)}'}), 500

@attendance_bp.route('/history', methods=['GET'])
@jwt_required
def get_attendance_history():
    """Get attendance history with filters"""
    try:
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        student_id = request.args.get('student_id')
        class_name = request.args.get('class')
        status = request.args.get('status')
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Build query based on filters - INCLUDE ID
        query = '''
            SELECT id, name, student_id, class, timestamp, status
            FROM attendance 
            WHERE 1=1
        '''
        params = []
        
        if start_date:
            query += ' AND DATE(timestamp) >= ?'
            params.append(start_date)
        
        if end_date:
            query += ' AND DATE(timestamp) <= ?'
            params.append(end_date)
        
        if student_id:
            query += ' AND student_id = ?'
            params.append(student_id)
        
        if class_name:
            query += ' AND class = ?'
            params.append(class_name)
        
        if status:
            query += ' AND status = ?'
            params.append(status)
        
        query += ' ORDER BY timestamp DESC'
        
        cursor.execute(query, params)
        records = []
        for row in cursor.fetchall():
            attendance = Attendance(
                id=row[0],  # Include ID
                name=row[1],
                student_id=row[2],
                class_name=row[3],
                timestamp=row[4],
                status=row[5]
            )
            records.append(attendance)
        
        conn.close()
        
        return jsonify({
            'attendance': [record.to_dict() for record in records],
            'count': len(records),
            'filters': {
                'start_date': start_date,
                'end_date': end_date,
                'student_id': student_id,
                'class': class_name,
                'status': status
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get attendance history: {str(e)}'}), 500

@attendance_bp.route('/range', methods=['GET'])
@jwt_required
def get_attendance_by_range():
    """Get attendance records for date range"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'error': 'Start date and end date are required'}), 400
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Include ID in the query
        cursor.execute('''
            SELECT id, name, student_id, class, timestamp, status
            FROM attendance 
            WHERE DATE(timestamp) BETWEEN ? AND ?
            ORDER BY timestamp DESC
        ''', (start_date, end_date))
        records = []
        for row in cursor.fetchall():
            attendance = Attendance(
                id=row[0],  # Include ID
                name=row[1],
                student_id=row[2],
                class_name=row[3],
                timestamp=row[4],
                status=row[5]
            )
            records.append(attendance)
        conn.close()
        
        return jsonify({
            'attendance': [record.to_dict() for record in records],
            'count': len(records),
            'start_date': start_date,
            'end_date': end_date
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get attendance by range: {str(e)}'}), 500

@attendance_bp.route('/student/<student_id>', methods=['GET'])
@jwt_required
def get_student_attendance(student_id):
    """Get attendance history for a specific student"""
    try:
        days = request.args.get('days', 30, type=int)
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Include ID in the query
        cursor.execute('''
            SELECT id, timestamp, status
            FROM attendance 
            WHERE student_id = ? AND DATE(timestamp) >= DATE('now', '-' || ? || ' days')
            ORDER BY timestamp DESC
        ''', (student_id, days))
        
        attendance_list = []
        for row in cursor.fetchall():
            attendance_list.append({
                'id': row[0],  # Include ID
                'timestamp': row[1],
                'status': row[2]
            })
        
        conn.close()
        
        return jsonify({
            'student_id': student_id,
            'attendance': attendance_list,
            'days': days,
            'count': len(attendance_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get student attendance: {str(e)}'}), 500

@attendance_bp.route('/stats', methods=['GET'])
@jwt_required
def get_attendance_stats():
    """Get attendance statistics for a date range"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Build query for statistics
        query = '''
            SELECT 
                status,
                COUNT(*) as count
            FROM attendance 
            WHERE 1=1
        '''
        params = []
        
        if start_date:
            query += ' AND DATE(timestamp) >= ?'
            params.append(start_date)
        
        if end_date:
            query += ' AND DATE(timestamp) <= ?'
            params.append(end_date)
        
        query += ' GROUP BY status'
        
        cursor.execute(query, params)
        stats = {}
        total = 0
        
        for row in cursor.fetchall():
            stats[row[0]] = row[1]
            total += row[1]
        
        # Calculate percentages
        percentages = {}
        for status, count in stats.items():
            percentages[status] = round((count / total) * 100, 2) if total > 0 else 0
        
        conn.close()
        
        return jsonify({
            'stats': stats,
            'percentages': percentages,
            'total': total,
            'date_range': {
                'start_date': start_date,
                'end_date': end_date
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get attendance stats: {str(e)}'}), 500