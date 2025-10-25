import sqlite3
from datetime import datetime, date

class Attendance:
    """Attendance model"""
    
    def __init__(self, id=None, student_id=None, name=None, class_name=None, 
                 timestamp=None, status='Present'):
        self.id = id
        self.student_id = student_id
        self.name = name
        self.class_name = class_name
        self.timestamp = timestamp or datetime.utcnow()
        self.status = status
    
    @staticmethod
    def create_table(cursor):
        """Create attendance table"""
        cursor.execute('''
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
    
    @staticmethod
    def mark_attendance(student_id, name, class_name, cursor, conn, status='Present'):
        """Mark attendance for a student"""
        # Check if already marked today
        cursor.execute('''
            SELECT * FROM attendance 
            WHERE student_id = ? AND DATE(timestamp) = DATE('now')
        ''', (student_id,))
        
        existing = cursor.fetchone()
        
        if not existing:
            cursor.execute('''
                INSERT INTO attendance (student_id, name, class, status)
                VALUES (?, ?, ?, ?)
            ''', (student_id, name, class_name, status))
            conn.commit()
            return True
        return False
    
    @staticmethod
    def get_today_attendance(cursor):
        """Get today's attendance records - INCLUDE ID"""
        cursor.execute('''
            SELECT id, name, student_id, class, timestamp, status
            FROM attendance 
            WHERE DATE(timestamp) = DATE('now')
            ORDER BY timestamp DESC
        ''')
        records = []
        for row in cursor.fetchall():
            attendance = Attendance(
                id=row[0],
                name=row[1],
                student_id=row[2],
                class_name=row[3],
                timestamp=row[4],
                status=row[5]
            )
            records.append(attendance)
        return records
    
    @staticmethod
    def get_attendance_by_date_range(cursor, start_date, end_date):
        """Get attendance records for date range - INCLUDE ID"""
        cursor.execute('''
            SELECT id, name, student_id, class, timestamp, status
            FROM attendance 
            WHERE DATE(timestamp) BETWEEN ? AND ?
            ORDER BY timestamp DESC
        ''', (start_date, end_date))
        records = []
        for row in cursor.fetchall():
            attendance = Attendance(
                id=row[0],
                name=row[1],
                student_id=row[2],
                class_name=row[3],
                timestamp=row[4],
                status=row[5]
            )
            records.append(attendance)
        return records
    
    @staticmethod
    def get_student_attendance(cursor, student_id, days=30):
        """Get attendance history for a specific student - INCLUDE ID"""
        cursor.execute('''
            SELECT id, timestamp, status
            FROM attendance 
            WHERE student_id = ? AND DATE(timestamp) >= DATE('now', '-' || ? || ' days')
            ORDER BY timestamp DESC
        ''', (student_id, days))
        return cursor.fetchall()
    
    def to_dict(self):
        """Convert to dictionary - ensure ID is included"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'name': self.name,
            'class': self.class_name,
            'timestamp': self.timestamp.isoformat() if isinstance(self.timestamp, datetime) else self.timestamp,
            'status': self.status
        }