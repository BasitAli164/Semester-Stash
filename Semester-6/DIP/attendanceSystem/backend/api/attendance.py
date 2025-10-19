# backend/api/attendance.py
from flask import Blueprint, request, jsonify, send_file
import os
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta


# Create blueprint
attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/attendance/recognize', methods=['POST'])
def recognize_faces():
    """Recognize faces in image"""
    try:
        print("📸 Face recognition endpoint called")
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'message': 'Image data is required'
            }), 400
        
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        success, message, results = attendance_service.recognize_faces(data['image'])
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'results': results
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
    except Exception as e:
        print(f"❌ Error in recognize_faces: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/mark', methods=['POST'])
def mark_attendance():
    """Mark attendance for recognized students"""
    try:
        data = request.get_json()
        print(f"📝 Marking attendance for {len(data.get('recognized_faces', []))} students")
        
        if not data or 'recognized_faces' not in data:
            return jsonify({
                'success': False,
                'message': 'Recognized faces data is required'
            }), 400
        
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        marked_count, detailed_results = attendance_service.mark_attendance_from_recognition(data['recognized_faces'])
        
        return jsonify({
            'success': True,
            'message': f'Attendance marked for {marked_count} student(s)',
            'marked_count': marked_count,
            'detailed_results': detailed_results
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
        
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        success, message = attendance_service.mark_manual_attendance(
            data['student_id'],
            data.get('status', 'present'),
            data.get('notes')
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
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
        print(f"📊 Fetching attendance for date: {date}")
        
        # Import inside function to avoid circular imports
        from services.attendance_service import AttendanceService
        
        attendance_service = AttendanceService()
        report = attendance_service.get_attendance_report(date)
        
        print(f"✅ Attendance report generated: {len(report.get('attendance', []))} records")
        
        return jsonify({
            'success': True,
            'report': report
        }), 200
        
    except Exception as e:
        print(f"❌ Error in get_attendance: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return a basic response even if there's an error
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}',
            'report': {
                'attendance': [],
                'absent_students': [],
                'stats': {
                    'date': date,
                    'present_count': 0,
                    'absent_count': 0,
                    'total_students': 0,
                    'attendance_rate': 0
                },
                'date': date,
                'total_records': 0
            }
        }), 500

@attendance_bp.route('/attendance/stats', methods=['GET'])
def get_attendance_stats():
    """Get attendance statistics"""
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        stats = attendance_service.get_attendance_stats(date)
        
        return jsonify({
            'success': True,
            'stats': stats
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
        
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        report = attendance_service.get_attendance_range_report(start_date, end_date)
        
        return jsonify({
            'success': True,
            'report': report
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
        
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        success, message, filepath = attendance_service.export_attendance(date)
        
        if success:
            return send_file(filepath, as_attachment=True, download_name=f"attendance_{date}.csv")
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/model/status', methods=['GET'])
def get_model_status():
    """Check if face recognition model is ready"""
    try:
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        model_ready = attendance_service.is_model_ready()
        
        return jsonify({
            'success': True,
            'model_ready': model_ready
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500
@attendance_bp.route('/attendance/debug/recognition', methods=['POST'])
def debug_recognition():
    """Debug endpoint for recognition testing"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'message': 'Image data is required'
            }), 400
        
        from services.attendance_service import AttendanceService
        from utils.image_processor import ImageProcessor
        import numpy as np
        import cv2
        
        attendance_service = AttendanceService()
        
        # Test model loading
        model_info = attendance_service.face_recognizer.get_model_info()
        
        # Test face detection
        image_processor = ImageProcessor()
        image = image_processor.base64_to_image(data['image'])
        image_array = np.array(image)
        
        # Test recognition
        success, message, results = attendance_service.recognize_faces(data['image'])
        
        debug_info = {
            'model_info': model_info,
            'recognition_success': success,
            'recognition_message': message,
            'results_count': len(results),
            'results': results
        }
        
        return jsonify({
            'success': True,
            'debug_info': debug_info
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Debug error: {str(e)}'
        }), 500