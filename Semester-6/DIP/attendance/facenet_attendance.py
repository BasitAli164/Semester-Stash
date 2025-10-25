import os
import json
import cv2
# import torch
import sqlite3
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from datetime import datetime

class FaceNetAttendanceSystem:
    def __init__(self):
        # Initialize MTCNN for face detection
        self.mtcnn = MTCNN(
            keep_all=True,
            thresholds=[0.6, 0.7, 0.7],
            min_face_size=20,
            device='cpu'
        )
        
        # Initialize FaceNet for face recognition
        self.resnet = InceptionResnetV1(
            pretrained='vggface2',
            classify=False,
            device='cpu'
        ).eval()
        
        # Setup database
        self.setup_database()
        
    def setup_database(self):
        """Initialize SQLite database for students and attendance"""
        self.conn = sqlite3.connect('face_attendance.db')
        self.cursor = self.conn.cursor()
        
        # Students table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                student_id TEXT UNIQUE NOT NULL,
                class TEXT,
                face_embedding BLOB,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Attendance table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT,
                name TEXT,
                class TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'Present',
                FOREIGN KEY (student_id) REFERENCES students (student_id)
            )
        ''')
        
        self.conn.commit()
        print("✅ Database initialized successfully")
    
    def extract_face_embeddings(self, image_path):
        """
        Extract face embeddings from an image using FaceNet
        """
        try:
            # Load image
            image = Image.open(image_path).convert('RGB')
            
            # Detect faces in the image
            faces, probs = self.mtcnn(image, return_prob=True)
            
            if faces is not None:
                embeddings_list = []
                
                for i, face in enumerate(faces):
                    if probs[i] > 0.9:  # Only use high-confidence detections
                        # Calculate embedding
                        face_embedding = self.resnet(face.unsqueeze(0))
                        embeddings_list.append(face_embedding.detach().numpy())
                
                if embeddings_list:
                    return np.vstack(embeddings_list)
            
            print(f"❌ No face detected in {os.path.basename(image_path)}")
            return None
            
        except Exception as e:
            print(f"❌ Error processing {os.path.basename(image_path)}: {e}")
            return None
    
    def register_student(self, image_paths, name, student_id, class_name):
        """
        Register a new student with multiple images
        """
        all_embeddings = []
        
        print(f"📸 Processing {len(image_paths)} images for {name}...")
        
        for image_path in image_paths:
            print(f"   Processing: {os.path.basename(image_path)}")
            embeddings = self.extract_face_embeddings(image_path)
            if embeddings is not None:
                all_embeddings.extend(embeddings)
        
        if not all_embeddings:
            print(f"❌ No valid faces found for {name}")
            return False
        
        # Average the embeddings for better accuracy
        avg_embedding = np.mean(all_embeddings, axis=0)
        
        # Store in database
        try:
            self.cursor.execute('''
                INSERT OR REPLACE INTO students (name, student_id, class, face_embedding)
                VALUES (?, ?, ?, ?)
            ''', (name, student_id, class_name, avg_embedding.tobytes()))
            
            self.conn.commit()
            print(f"✅ Student {name} registered successfully with {len(all_embeddings)} face embeddings")
            return True
            
        except Exception as e:
            print(f"❌ Database error for {name}: {e}")
            return False
    
    def load_all_embeddings(self):
        """
        Load all registered face embeddings from database
        """
        self.cursor.execute('SELECT student_id, name, class, face_embedding FROM students')
        results = self.cursor.fetchall()
        
        embeddings_dict = {}
        for student_id, name, class_name, embedding_blob in results:
            embedding = np.frombuffer(embedding_blob, dtype=np.float32)
            embeddings_dict[student_id] = {
                'name': name,
                'class': class_name,
                'embedding': embedding
            }
        
        print(f"✅ Loaded {len(embeddings_dict)} students from database")
        return embeddings_dict
    
    def recognize_face(self, face_embedding, known_embeddings_dict, threshold=0.8):
        """
        Recognize a face by comparing with known embeddings
        """
        best_match = None
        min_distance = float('inf')
        
        for student_id, data in known_embeddings_dict.items():
            known_embedding = data['embedding']
            
            # Calculate Euclidean distance between embeddings
            distance = np.linalg.norm(face_embedding - known_embedding)
            
            if distance < min_distance and distance < threshold:
                min_distance = distance
                best_match = student_id
        
        return best_match, min_distance
    
    def mark_attendance(self, student_id, known_embeddings_dict):
        """
        Mark attendance for recognized student
        """
        if student_id in known_embeddings_dict:
            student_data = known_embeddings_dict[student_id]
            
            # Check if already marked today
            self.cursor.execute('''
                SELECT * FROM attendance 
                WHERE student_id = ? AND DATE(timestamp) = DATE('now')
            ''', (student_id,))
            
            existing = self.cursor.fetchone()
            
            if not existing:
                self.cursor.execute('''
                    INSERT INTO attendance (student_id, name, class, status)
                    VALUES (?, ?, ?, 'Present')
                ''', (student_id, student_data['name'], student_data['class']))
                
                self.conn.commit()
                print(f"✅ Attendance marked for {student_data['name']}")
                return student_data
            else:
                print(f"⚠️  Attendance already marked today for {student_data['name']}")
                return student_data
        return None
    
    def start_real_time_attendance(self):
        """
        Start real-time attendance marking using webcam
        """
        cap = cv2.VideoCapture(0)
        known_embeddings = self.load_all_embeddings()
        
        if not known_embeddings:
            print("❌ No students registered in database. Please register students first.")
            return
        
        print("🚀 Starting real-time attendance system...")
        print("Press 'q' to quit")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert frame to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(rgb_frame)
            
            # Detect faces
            faces, probs = self.mtcnn(pil_image, return_prob=True)
            
            if faces is not None:
                for i, face in enumerate(faces):
                    if probs[i] > 0.9:  # High confidence detection
                        # Extract embedding
                        face_embedding = self.resnet(face.unsqueeze(0))
                        embedding_np = face_embedding.detach().numpy()[0]
                        
                        # Recognize face
                        student_id, distance = self.recognize_face(embedding_np, known_embeddings)
                        
                        if student_id:
                            student_data = known_embeddings[student_id]
                            
                            # Draw bounding box and info
                            cv2.putText(frame, f"Recognized: {student_data['name']}", 
                                      (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                            cv2.putText(frame, f"ID: {student_id}", 
                                      (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                            cv2.putText(frame, f"Distance: {distance:.3f}", 
                                      (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                            
                            # Mark attendance
                            self.mark_attendance(student_id, known_embeddings)
                            
                        else:
                            cv2.putText(frame, "Unknown Face", 
                                      (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            cv2.imshow('FaceNet Attendance System - Press Q to quit', frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        print("✅ Attendance system stopped")

def get_dataset_path():
    """
    Automatically find dataset path based on current structure
    """
    # Current directory (where facenet_attendance.py is located)
    current_dir = os.getcwd()
    
    # Check if dataset folder exists in current directory
    dataset_path = os.path.join(current_dir, "dataset")
    
    if os.path.exists(dataset_path):
        print(f"✅ Dataset found at: {dataset_path}")
        return dataset_path
    else:
        print(f"❌ Dataset folder not found at: {dataset_path}")
        print("Please make sure 'dataset' folder exists in the same directory as this script")
        return None

def check_student_folders(dataset_path):
    """
    Check all student folders and validate their structure
    """
    valid_students = []
    
    print("\n🔍 Checking student folders...")
    
    for student_folder in os.listdir(dataset_path):
        student_path = os.path.join(dataset_path, student_folder)
        
        if os.path.isdir(student_path):
            info_path = os.path.join(student_path, 'info.json')
            
            # Check if info.json exists
            if not os.path.exists(info_path):
                print(f"❌ {student_folder}: info.json missing")
                continue
            
            # Check info.json content
            try:
                with open(info_path, 'r', encoding='utf-8') as f:
                    student_info = json.load(f)
                
                # Validate required fields
                if 'name' not in student_info or 'id' not in student_info:
                    print(f"❌ {student_folder}: info.json missing 'name' or 'id'")
                    continue
                    
            except Exception as e:
                print(f"❌ {student_folder}: Error reading info.json - {e}")
                continue
            
            # Find all image files
            image_files = []
            for file in os.listdir(student_path):
                if file.lower().endswith(('.jpg', '.jpeg', '.png')) and file != 'info.json':
                    image_files.append(os.path.join(student_path, file))
            
            if not image_files:
                print(f"❌ {student_folder}: No images found")
                continue
            
            valid_students.append({
                'folder': student_folder,
                'path': student_path,
                'info': student_info,
                'images': image_files
            })
            
            print(f"✅ {student_folder}: {len(image_files)} images found")
    
    return valid_students

def batch_register_students(system, dataset_path):
    """
    Batch register all students from dataset folder
    """
    valid_students = check_student_folders(dataset_path)
    
    if not valid_students:
        print("❌ No valid students found to register!")
        return
    
    print(f"\n📥 Registering {len(valid_students)} students...")
    
    success_count = 0
    for student in valid_students:
        print(f"\n🎯 Processing {student['info']['name']}...")
        
        success = system.register_student(
            image_paths=student['images'],
            name=student['info']['name'],
            student_id=student['info']['id'],
            class_name=student['info'].get('class', 'Unknown')
        )
        
        if success:
            success_count += 1
    
    print(f"\n🎉 Registration completed: {success_count}/{len(valid_students)} students registered successfully!")

def view_attendance_records(system):
    """
    View today's attendance records
    """
    system.cursor.execute('''
        SELECT name, student_id, class, timestamp 
        FROM attendance 
        WHERE DATE(timestamp) = DATE('now')
        ORDER BY timestamp DESC
    ''')
    
    records = system.cursor.fetchall()
    
    print(f"\n📊 Today's Attendance Records ({len(records)} entries):")
    print("-" * 60)
    
    if not records:
        print("No attendance records for today")
        return
    
    for name, student_id, class_name, timestamp in records:
        print(f"👤 {name} (ID: {student_id}) - {class_name}")
        print(f"   ⏰ {timestamp}")
        print()

def main():
    """
    Main function with user-friendly menu
    """
    print("🎯 FaceNet Attendance System")
    print("=" * 50)
    
    # Initialize system
    attendance_system = FaceNetAttendanceSystem()
    
    while True:
        print("\n📋 Main Menu:")
        print("1. 📥 Register All Students from Dataset")
        print("2. 🎥 Start Real-time Attendance")
        print("3. 👤 Register Single Student")
        print("4. 📊 View Today's Attendance")
        print("5. ❌ Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == "1":
            # Auto-detect dataset path
            dataset_path = get_dataset_path()
            if dataset_path:
                batch_register_students(attendance_system, dataset_path)
            else:
                print("Please check your dataset folder structure and try again.")
        
        elif choice == "2":
            attendance_system.start_real_time_attendance()
        
        elif choice == "3":
            print("\n👤 Register Single Student:")
            name = input("Enter student name: ").strip()
            student_id = input("Enter student ID: ").strip()
            class_name = input("Enter class: ").strip()
            
            # For single student, you need to provide full image paths
            print("Enter image paths (one per line, press Enter twice when done):")
            image_paths = []
            while True:
                path = input().strip()
                if not path:
                    break
                if os.path.exists(path):
                    image_paths.append(path)
                else:
                    print(f"❌ Path does not exist: {path}")
            
            if image_paths:
                attendance_system.register_student(image_paths, name, student_id, class_name)
            else:
                print("❌ No valid image paths provided")
        
        elif choice == "4":
            view_attendance_records(attendance_system)
        
        elif choice == "5":
            print("👋 Thank you for using FaceNet Attendance System!")
            break
        
        else:
            print("❌ Invalid choice. Please enter 1-5.")

if __name__ == "__main__":
    main()