from flask import Blueprint, request, jsonify, send_file
import os
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta

# Create blueprint
attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/attendance/recognize', methods=['POST'])
def recognize_faces():
    """Recognize faces in image - TEMPORARY MOCK VERSION"""
    try:
        print("📸 Face recognition endpoint called")
        
        # TEMPORARY: Return mock data for testing
        mock_results = [
            {
                'student_id': 'STU001',
                'name': 'John Doe',
                'confidence': 92.5,
                'status': 'recognized'
            },
            {
                'student_id': 'unknown_1',
                'name': 'Unknown Person',
                'confidence': 45.2,
                'status': 'unknown'
            }
        ]
        
        print(f"✅ Returning mock data: {len(mock_results)} faces detected")
        
        return jsonify({
            'success': True,
            'message': f'Detected {len(mock_results)} faces: 1 recognized, 1 unknown',
            'results': mock_results
        }), 200
        
    except Exception as e:
        print(f"❌ Error in recognize_faces: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/mark', methods=['POST'])
def mark_attendance():
    """Mark attendance for recognized students - TEMPORARY MOCK VERSION"""
    try:
        data = request.get_json()
        print(f"📝 Marking attendance for {len(data.get('recognized_faces', []))} students")
        
        # TEMPORARY: Return mock success response
        return jsonify({
            'success': True,
            'message': f'Attendance marked for 1 student',
            'marked_count': 1,
            'detailed_results': [
                {
                    'student_id': 'STU001',
                    'name': 'John Doe',
                    'attendance_marked': True,
                    'attendance_message': 'Attendance marked successfully',
                    'attendance_time': datetime.now().strftime('%H:%M:%S')
                }
            ]
        }), 200
        
    except Exception as e:
        print(f"❌ Error in mark_attendance: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/manual', methods=['POST'])
def mark_manual_attendance():
    """Manually mark attendance for a student"""
    try:
        data = request.get_json()
        
        if not data or 'student_id' not in data:
            return jsonify({
                'success': False,
                'message': 'Student ID is required'
            }), 400
        
        student_id = data['student_id']
        status = data.get('status', 'present')
        
        # TEMPORARY: Return mock success
        return jsonify({
            'success': True,
            'message': f'Manual attendance marked for {student_id}'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records"""
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # TEMPORARY: Return mock attendance data
        mock_attendance = [
            {
                'id': 1,
                'student_id': 'STU001',
                'name': 'John Doe',
                'date': date,
                'time': '09:15:00',
                'status': 'present',
                'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            {
                'id': 2,
                'student_id': 'STU002', 
                'name': 'Jane Smith',
                'date': date,
                'time': '09:16:00',
                'status': 'present',
                'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        ]
        
        return jsonify({
            'success': True,
            'report': {
                'attendance': mock_attendance,
                'absent_students': [],
                'stats': {
                    'total_students': 2,
                    'present_today': 2,
                    'absent_today': 0,
                    'attendance_rate': 100.0
                },
                'date': date,
                'total_records': 2
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/stats', methods=['GET'])
def get_attendance_stats():
    """Get attendance statistics"""
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # TEMPORARY: Return mock stats
        mock_stats = {
            'total_students': 50,
            'present_today': 45,
            'absent_today': 5,
            'late_today': 2,
            'attendance_rate': 90.0,
            'weekly_trend': 2.5
        }
        
        return jsonify({
            'success': True,
            'stats': mock_stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/range', methods=['GET'])
def get_attendance_range():
    """Get attendance records for a date range"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({
                'success': False,
                'message': 'Both start_date and end_date are required'
            }), 400
        
        # TEMPORARY: Return empty range data
        return jsonify({
            'success': True,
            'report': {
                'start_date': start_date,
                'end_date': end_date,
                'total_days': 7,
                'total_students': 50,
                'student_attendance': {},
                'daily_attendance': [],
                'date_range': []
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/export', methods=['GET'])
def export_attendance():
    """Export attendance data to CSV"""
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # TEMPORARY: Return mock export message
        return jsonify({
            'success': True,
            'message': 'Export feature will be available soon'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/model/status', methods=['GET'])
def get_model_status():
    """Check if face recognition model is ready"""
    try:
        # TEMPORARY: Return mock status
        return jsonify({
            'success': True,
            'model_ready': True
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500