import sqlite3
import numpy as np
from datetime import datetime
import json

class Student:
    """Student model"""
    
    def __init__(self, id=None, name=None, student_id=None, class_name=None, 
                 face_embedding=None, registration_date=None, image_paths=None):
        self.id = id
        self.name = name
        self.student_id = student_id
        self.class_name = class_name
        self.face_embedding = face_embedding  # numpy array
        self.registration_date = registration_date or datetime.utcnow()
        self.image_paths = image_paths or []
    
    @staticmethod
    def create_table(cursor):
        """Create students table"""
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                student_id TEXT UNIQUE NOT NULL,
                class TEXT,
                face_embedding BLOB,
                image_paths TEXT,  -- JSON array of image paths
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    
    @staticmethod
    def get_all(cursor):
        """Get all students"""
        cursor.execute('''
            SELECT id, name, student_id, class, face_embedding, image_paths, registration_date
            FROM students ORDER BY name
        ''')
        students = []
        for row in cursor.fetchall():
            student = Student(
                id=row[0],
                name=row[1],
                student_id=row[2],
                class_name=row[3],
                face_embedding=np.frombuffer(row[4], dtype=np.float32) if row[4] else None,
                image_paths=json.loads(row[5]) if row[5] else [],
                registration_date=row[6]
            )
            students.append(student)
        return students
    
    @staticmethod
    def find_by_id(student_id, cursor):
        """Find student by ID"""
        cursor.execute('''
            SELECT id, name, student_id, class, face_embedding, image_paths, registration_date
            FROM students WHERE id = ?
        ''', (student_id,))
        row = cursor.fetchone()
        if row:
            return Student(
                id=row[0],
                name=row[1],
                student_id=row[2],
                class_name=row[3],
                face_embedding=np.frombuffer(row[4], dtype=np.float32) if row[4] else None,
                image_paths=json.loads(row[5]) if row[5] else [],
                registration_date=row[6]
            )
        return None
    
    @staticmethod
    def find_by_student_id(student_id, cursor):
        """Find student by student ID"""
        cursor.execute('''
            SELECT id, name, student_id, class, face_embedding, image_paths, registration_date
            FROM students WHERE student_id = ?
        ''', (student_id,))
        row = cursor.fetchone()
        if row:
            return Student(
                id=row[0],
                name=row[1],
                student_id=row[2],
                class_name=row[3],
                face_embedding=np.frombuffer(row[4], dtype=np.float32) if row[4] else None,
                image_paths=json.loads(row[5]) if row[5] else [],
                registration_date=row[6]
            )
        return None
    
    @staticmethod
    def get_all_embeddings(cursor):
        """Get all student embeddings for recognition"""
        cursor.execute('SELECT student_id, name, class, face_embedding FROM students')
        embeddings_dict = {}
        for row in cursor.fetchall():
            if row[3]:  # face_embedding exists
                embeddings_dict[row[0]] = {
                    'name': row[1],
                    'class': row[2],
                    'embedding': np.frombuffer(row[3], dtype=np.float32)
                }
        return embeddings_dict
    
    def save(self, cursor, conn):
        """Save student to database"""
        embedding_blob = self.face_embedding.tobytes() if self.face_embedding is not None else None
        image_paths_json = json.dumps(self.image_paths) if self.image_paths else '[]'
        
        if self.id is None:
            cursor.execute('''
                INSERT INTO students (name, student_id, class, face_embedding, image_paths)
                VALUES (?, ?, ?, ?, ?)
            ''', (self.name, self.student_id, self.class_name, embedding_blob, image_paths_json))
            self.id = cursor.lastrowid
        else:
            cursor.execute('''
                UPDATE students 
                SET name = ?, student_id = ?, class = ?, face_embedding = ?, image_paths = ?
                WHERE id = ?
            ''', (self.name, self.student_id, self.class_name, embedding_blob, image_paths_json, self.id))
        conn.commit()
    
    def delete(self, cursor, conn):
        """Delete student from database"""
        cursor.execute('DELETE FROM students WHERE id = ?', (self.id,))
        conn.commit()
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'student_id': self.student_id,
            'class': self.class_name,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None,
            'image_paths': self.image_paths,
            'has_face_embedding': self.face_embedding is not None
        }