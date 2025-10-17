from flask import Blueprint, request, jsonify, send_file
import os

# Create blueprint
attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/attendance/recognize', methods=['POST'])
def recognize_faces():
    """Recognize faces in image"""
    try:
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'message': 'Image data is required'
            }), 400
        
        success, message, results = attendance_service.recognize_faces(data['image'])
        
        return jsonify({
            'success': success,
            'message': message,
            'results': results
        }), 200 if success else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/mark', methods=['POST'])
def mark_attendance():
    """Mark attendance for recognized students"""
    try:
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        data = request.get_json()
        
        if not data or 'recognized_faces' not in data:
            return jsonify({
                'success': False,
                'message': 'Recognition results are required'
            }), 400
        
        marked_count, detailed_results = attendance_service.mark_attendance_from_recognition(
            data['recognized_faces']
        )
        
        return jsonify({
            'success': True,
            'message': f'Attendance marked for {marked_count} students',
            'marked_count': marked_count,
            'detailed_results': detailed_results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance/manual', methods=['POST'])
def mark_manual_attendance():
    """Manually mark attendance for a student"""
    try:
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        data = request.get_json()
        
        if not data or 'student_id' not in data:
            return jsonify({
                'success': False,
                'message': 'Student ID is required'
            }), 400
        
        student_id = data['student_id']
        status = data.get('status', 'present')
        notes = data.get('notes')
        
        success, message = attendance_service.mark_manual_attendance(student_id, status, notes)
        
        return jsonify({
            'success': success,
            'message': message
        }), 200 if success else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@attendance_bp.route('/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records"""
    try:
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        date = request.args.get('date')
        report = attendance_service.get_attendance_report(date)
        
        return jsonify({
            'success': True,
            'report': report
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
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({
                'success': False,
                'message': 'Both start_date and end_date are required'
            }), 400
        
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

@attendance_bp.route('/attendance/stats', methods=['GET'])
def get_attendance_stats():
    """Get attendance statistics"""
    try:
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        date = request.args.get('date')
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

@attendance_bp.route('/attendance/export', methods=['GET'])
def export_attendance():
    """Export attendance data to CSV"""
    try:
        from services.attendance_service import AttendanceService
        attendance_service = AttendanceService()
        
        date = request.args.get('date')
        
        success, message, filepath = attendance_service.export_attendance(date)
        
        if not success:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
        # Send file for download
        return send_file(
            filepath,
            as_attachment=True,
            download_name=os.path.basename(filepath),
            mimetype='text/csv'
        )
        
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
        
        is_ready = attendance_service.is_model_ready()
        
        return jsonify({
            'success': True,
            'model_ready': is_ready
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500