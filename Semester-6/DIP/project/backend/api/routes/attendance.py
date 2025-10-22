from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models.database import db, User, Student, Embedding
from api.utils.security import role_required, allowed_file, secure_filename_custom
import os
from datetime import datetime
import uuid
import cv2

students_bp = Blueprint('students', __name__)

@students_bp.route('/api/register-student', methods=['POST'])
@jwt_required()
@role_required('admin')
def register_student():
    try:
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('username') or not data.get('password') or not data.get('enrollment_id'):
            return jsonify({'message': 'Name, username, password, and enrollment ID are required'}), 400
        
        # Check if username already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        # Check if enrollment ID already exists
        if Student.query.filter_by(enrollment_id=data['enrollment_id']).first():
            return jsonify({'message': 'Enrollment ID already exists'}), 400
        
        # Create user
        new_user = User(
            name=data['name'],
            username=data['username'],
            role='student'
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.flush()  # Get the user ID
        
        # Create student profile
        image_dir = f"student_{new_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        full_image_dir = os.path.join('storage', 'images', image_dir)
        os.makedirs(full_image_dir, exist_ok=True)
        
        new_student = Student(
            user_id=new_user.id,
            enrollment_id=data['enrollment_id'],
            image_dir=image_dir
        )
        
        db.session.add(new_student)
        db.session.commit()
        
        return jsonify({
            'message': 'Student registered successfully',
            'student': {
                **new_user.to_dict(),
                'enrollment_id': new_student.enrollment_id,
                'image_dir': new_student.image_dir
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Student registration failed: {str(e)}'}), 500

@students_bp.route('/api/upload-images', methods=['POST'])
@jwt_required()
@role_required('admin')
def upload_student_images():
    try:
        student_id = request.form.get('student_id')
        if not student_id:
            return jsonify({'message': 'Student ID is required'}), 400
        
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'message': 'Student not found'}), 404
        
        if 'images' not in request.files:
            return jsonify({'message': 'No images provided'}), 400
        
        files = request.files.getlist('images')
        saved_files = []
        
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename_custom(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join('storage', 'images', student.image_dir, unique_filename)
                
                file.save(file_path)
                saved_files.append(unique_filename)
        
        return jsonify({
            'message': f'{len(saved_files)} images uploaded successfully',
            'saved_files': saved_files,
            'student_id': student_id
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Image upload failed: {str(e)}'}), 500

@students_bp.route('/api/preprocess', methods=['POST'])
@jwt_required()
@role_required('admin')
def preprocess_images():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'message': 'Student ID is required'}), 400
        
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'message': 'Student not found'}), 404
        
        image_dir = os.path.join('storage', 'images', student.image_dir)
        if not os.path.exists(image_dir):
            return jsonify({'message': 'Student image directory not found'}), 404
        
        processed_count = 0
        failed_images = []
        
        for filename in os.listdir(image_dir):
            if allowed_file(filename) and not filename.startswith('processed_'):
                try:
                    image_path = os.path.join(image_dir, filename)
                    
                    # Use OpenCV for preprocessing instead of DeepFace
                    img = cv2.imread(image_path)
                    if img is None:
                        failed_images.append({'filename': filename, 'error': 'Could not read image'})
                        continue
                    
                    # Convert to grayscale for face detection
                    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                    
                    # Load face detector
                    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                    
                    if len(faces) == 0:
                        failed_images.append({'filename': filename, 'error': 'No face detected'})
                        continue
                    
                    # Process first face found
                    x, y, w, h = faces[0]
                    face_img = img[y:y+h, x:x+w]
                    
                    # Resize to standard size
                    face_img = cv2.resize(face_img, (224, 224))
                    
                    # Save processed image
                    processed_filename = f"processed_{filename}"
                    processed_path = os.path.join(image_dir, processed_filename)
                    cv2.imwrite(processed_path, face_img)
                    
                    processed_count += 1
                    
                except Exception as e:
                    failed_images.append({'filename': filename, 'error': str(e)})
        
        return jsonify({
            'message': f'Processed {processed_count} images successfully',
            'processed_count': processed_count,
            'failed_images': failed_images
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Preprocessing failed: {str(e)}'}), 500

@students_bp.route('/api/train', methods=['POST'])
@jwt_required()
@role_required('admin')
def train_student():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'message': 'Student ID is required'}), 400
        
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'message': 'Student not found'}), 404
        
        image_dir = os.path.join('storage', 'images', student.image_dir)
        if not os.path.exists(image_dir):
            return jsonify({'message': 'Student image directory not found'}), 404
        
        # Get all valid images
        image_files = [f for f in os.listdir(image_dir) if allowed_file(f) and f.startswith('processed_')]
        
        if not image_files:
            return jsonify({'message': 'No processed images found for training'}), 400
        
        # Lazy import to avoid startup issues
        from api.utils.face_recognition import FaceRecognition
        face_recognizer = FaceRecognition()
        
        embeddings = []
        failed_count = 0
        
        for filename in image_files:
            try:
                image_path = os.path.join(image_dir, filename)
                embedding = face_recognizer.generate_embedding(image_path)
                
                # Store embedding in database
                new_embedding = Embedding(
                    student_id=student.id,
                    model=face_recognizer.model_name,
                    vector=embedding.tolist()
                )
                db.session.add(new_embedding)
                embeddings.append(embedding)
                
            except Exception as e:
                failed_count += 1
                continue
        
        db.session.commit()
        
        return jsonify({
            'message': f'Training completed. {len(embeddings)} embeddings generated, {failed_count} failed',
            'embeddings_count': len(embeddings),
            'failed_count': failed_count,
            'student_id': student_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Training failed: {str(e)}'}), 500

@students_bp.route('/api/students', methods=['GET'])
@jwt_required()
def get_students():
    try:
        current_user = get_jwt_identity()
        students = Student.query.join(User).all()
        
        students_data = []
        for student in students:
            student_data = {
                **student.to_dict(),
                'user': student.user.to_dict()
            }
            students_data.append(student_data)
        
        return jsonify({
            'students': students_data,
            'count': len(students_data)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to fetch students: {str(e)}'}), 500

@students_bp.route('/api/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_profile(user_id):
    try:
        current_user = get_jwt_identity()
        
        # Students can only view their own profile, admins can view any
        if current_user['role'] == 'student' and current_user['id'] != user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        student = Student.query.filter_by(user_id=user_id).first()
        
        profile_data = user.to_dict()
        if student:
            profile_data['student_info'] = student.to_dict()
        
        return jsonify({'profile': profile_data}), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to fetch profile: {str(e)}'}), 500

@students_bp.route('/api/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        user = User.query.get(current_user['id'])
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Update allowed fields
        if 'name' in data:
            user.name = data['name']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Profile update failed: {str(e)}'}), 500