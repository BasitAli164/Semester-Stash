from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models.database import db, User, Student, Attendance, Embedding
from api.utils.security import role_required
import os
from datetime import datetime, timedelta
import csv
from io import StringIO

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin/dashboard-stats', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_dashboard_stats():
    try:
        # Total students
        total_students = Student.query.filter_by(is_active=True).count()
        
        # Today's attendance
        today_attendance = Attendance.query.filter_by(date=datetime.now().date()).count()
        
        # This week's attendance
        week_start = datetime.now().date() - timedelta(days=datetime.now().weekday())
        week_attendance = Attendance.query.filter(Attendance.date >= week_start).count()
        
        # Recent registrations (last 7 days)
        recent_registrations = Student.query.filter(
            Student.created_at >= datetime.now() - timedelta(days=7)
        ).count()
        
        # Attendance rate
        attendance_rate = round((today_attendance / total_students * 100) if total_students > 0 else 0, 2)
        
        return jsonify({
            'total_students': total_students,
            'today_attendance': today_attendance,
            'week_attendance': week_attendance,
            'recent_registrations': recent_registrations,
            'attendance_rate': attendance_rate
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to fetch dashboard stats: {str(e)}'}), 500

@admin_bp.route('/api/admin/export-reports', methods=['GET'])
@jwt_required()
@role_required('admin')
def export_reports():
    try:
        format_type = request.args.get('format', 'json')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        student_id = request.args.get('student_id')
        
        # Build query
        query = Attendance.query.join(Student).join(User)
        
        if student_id:
            query = query.filter(Attendance.student_id == student_id)
        
        if start_date:
            query = query.filter(Attendance.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        if end_date:
            query = query.filter(Attendance.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
        
        attendance_records = query.order_by(Attendance.date.desc()).all()
        
        if format_type == 'csv':
            # Generate CSV
            output = StringIO()
            writer = csv.writer(output)
            writer.writerow(['Date', 'Time', 'Student Name', 'Enrollment ID', 'Status', 'Confidence'])
            
            for record in attendance_records:
                writer.writerow([
                    record.date.isoformat(),
                    record.time.isoformat() if record.time else '',
                    record.student.user.name,
                    record.student.enrollment_id,
                    record.status,
                    record.confidence or ''
                ])
            
            csv_data = output.getvalue()
            output.close()
            
            return jsonify({
                'csv_data': csv_data,
                'filename': f'attendance_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            }), 200
            
        else:  # JSON format
            reports = []
            for record in attendance_records:
                report_data = record.to_dict()
                report_data['student_name'] = record.student.user.name
                report_data['enrollment_id'] = record.student.enrollment_id
                reports.append(report_data)
            
            return jsonify({
                'reports': reports,
                'count': len(reports),
                'exported_at': datetime.now().isoformat()
            }), 200
            
    except Exception as e:
        return jsonify({'message': f'Export failed: {str(e)}'}), 500

@admin_bp.route('/api/admin/retrain-model', methods=['POST'])
@jwt_required()
@role_required('admin')
def retrain_model():
    try:
        from api.utils.face_recognition import FaceRecognition
        face_recognizer = FaceRecognition()
        
        # Get all active students
        active_students = Student.query.filter_by(is_active=True).all()
        
        retrained_count = 0
        failed_count = 0
        
        for student in active_students:
            try:
                # Clear existing embeddings
                Embedding.query.filter_by(student_id=student.id).delete()
                
                image_dir = os.path.join('storage', 'images', student.image_dir)
                if not os.path.exists(image_dir):
                    failed_count += 1
                    continue
                
                # Get processed images
                image_files = [f for f in os.listdir(image_dir) if f.startswith('processed_')]
                
                for filename in image_files:
                    try:
                        image_path = os.path.join(image_dir, filename)
                        embedding = face_recognizer.generate_embedding(image_path)
                        
                        new_embedding = Embedding(
                            student_id=student.id,
                            model=face_recognizer.model_name,
                            vector=embedding.tolist()
                        )
                        db.session.add(new_embedding)
                        
                    except Exception:
                        continue
                
                retrained_count += 1
                
            except Exception:
                failed_count += 1
                continue
        
        db.session.commit()
        
        return jsonify({
            'message': f'Model retraining completed. {retrained_count} students retrained, {failed_count} failed',
            'retrained_count': retrained_count,
            'failed_count': failed_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Model retraining failed: {str(e)}'}), 500

@admin_bp.route('/api/admin/system-status', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_system_status():
    try:
        # Check database connection
        db_status = 'healthy'
        try:
            db.session.execute('SELECT 1')
        except Exception:
            db_status = 'unhealthy'
        
        # Check storage directories
        storage_dirs = ['storage/images', 'storage/embeddings', 'instance']
        storage_status = {}
        
        for dir_path in storage_dirs:
            storage_status[dir_path] = 'exists' if os.path.exists(dir_path) else 'missing'
        
        # System info
        total_students = Student.query.count()
        total_embeddings = Embedding.query.count()
        total_attendance = Attendance.query.count()
        
        return jsonify({
            'database': db_status,
            'storage': storage_status,
            'system_info': {
                'total_students': total_students,
                'total_embeddings': total_embeddings,
                'total_attendance_records': total_attendance
            },
            'server_time': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get system status: {str(e)}'}), 500