import sqlite3
import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Any

class DatabaseManager:
    """Manages all database operations for the attendance system"""
    
    def __init__(self, db_path: str = None):
        from config import config
        self.config = config
        self.db_path = db_path or self.config.DATABASE_PATH
        self._create_tables()
    
    def _get_connection(self) -> sqlite3.Connection:
        """Get database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def _create_tables(self):
        """Create necessary tables if they don't exist"""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Students table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT,
                    department TEXT,
                    phone TEXT,
                    registration_date TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Attendance table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    date TEXT NOT NULL,
                    time TEXT NOT NULL,
                    status TEXT DEFAULT 'present',
                    notes TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students (student_id),
                    UNIQUE(student_id, date)
                )
            ''')
            
            # System logs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS system_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level TEXT NOT NULL,
                    message TEXT NOT NULL,
                    module TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create indexes for better performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_students_id ON students(student_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_logs_created ON system_logs(created_at)')
            
            conn.commit()
    
    def add_student(self, student_id: str, name: str, email: str = None, 
                   department: str = None, phone: str = None) -> Tuple[bool, str]:
        """Add a new student to the database"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                registration_date = datetime.datetime.now().isoformat()
                
                cursor.execute('''
                    INSERT INTO students 
                    (student_id, name, email, department, phone, registration_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (student_id, name, email, department, phone, registration_date))
                
                conn.commit()
                self._log('INFO', f'Student registered: {student_id} - {name}')
                return True, "Student registered successfully"
                
        except sqlite3.IntegrityError:
            error_msg = f"Student ID {student_id} already exists"
            self._log('ERROR', error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Database error: {str(e)}"
            self._log('ERROR', error_msg)
            return False, error_msg
    
    def get_student(self, student_id: str) -> Optional[Dict[str, Any]]:
        """Get student by ID"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT * FROM students 
                    WHERE student_id = ? AND is_active = 1
                ''', (student_id,))
                
                row = cursor.fetchone()
                return dict(row) if row else None
                
        except Exception as e:
            self._log('ERROR', f"Error getting student {student_id}: {str(e)}")
            return None
    
    def get_all_students(self, active_only: bool = True) -> List[Dict[str, Any]]:
        """Get all students"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                if active_only:
                    cursor.execute('''
                        SELECT student_id, name, email, department, phone, 
                               registration_date, created_at
                        FROM students 
                        WHERE is_active = 1 
                        ORDER BY name
                    ''')
                else:
                    cursor.execute('''
                        SELECT student_id, name, email, department, phone,
                               registration_date, created_at, is_active
                        FROM students 
                        ORDER BY name
                    ''')
                
                return [dict(row) for row in cursor.fetchall()]
                
        except Exception as e:
            self._log('ERROR', f"Error getting students: {str(e)}")
            return []
    
    def get_students_count(self) -> int:
        """Get total number of active students"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT COUNT(*) FROM students WHERE is_active = 1')
                return cursor.fetchone()[0]
        except Exception as e:
            self._log('ERROR', f"Error getting students count: {str(e)}")
            return 0
    
    def update_student(self, student_id: str, **kwargs) -> Tuple[bool, str]:
        """Update student information"""
        try:
            if not kwargs:
                return False, "No fields to update"
            
            allowed_fields = {'name', 'email', 'department', 'phone', 'is_active'}
            update_fields = {k: v for k, v in kwargs.items() if k in allowed_fields}
            
            if not update_fields:
                return False, "No valid fields to update"
            
            with self._get_connection() as conn:
                cursor = conn.cursor()
                set_clause = ', '.join([f"{field} = ?" for field in update_fields.keys()])
                values = list(update_fields.values())
                values.append(student_id)
                
                cursor.execute(f'''
                    UPDATE students 
                    SET {set_clause}, updated_at = CURRENT_TIMESTAMP
                    WHERE student_id = ?
                ''', values)
                
                if cursor.rowcount == 0:
                    return False, "Student not found"
                
                conn.commit()
                self._log('INFO', f'Student updated: {student_id}')
                return True, "Student updated successfully"
                
        except Exception as e:
            error_msg = f"Error updating student: {str(e)}"
            self._log('ERROR', error_msg)
            return False, error_msg
    
    def mark_attendance(self, student_id: str, name: str, status: str = "present", 
                       notes: str = None) -> Tuple[bool, str]:
        """Mark attendance for a student"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if already marked today
                today = datetime.datetime.now().strftime('%Y-%m-%d')
                cursor.execute('''
                    SELECT id FROM attendance 
                    WHERE student_id = ? AND date = ?
                ''', (student_id, today))
                
                if cursor.fetchone():
                    return False, f"Attendance already marked for {name} today"
                
                # Mark attendance
                current_time = datetime.datetime.now().strftime('%H:%M:%S')
                cursor.execute('''
                    INSERT INTO attendance (student_id, name, date, time, status, notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (student_id, name, today, current_time, status, notes))
                
                conn.commit()
                self._log('INFO', f'Attendance marked: {student_id} - {name} at {current_time}')
                return True, f"Attendance marked for {name} at {current_time}"
                
        except Exception as e:
            error_msg = f"Error marking attendance: {str(e)}"
            self._log('ERROR', error_msg)
            return False, error_msg
    
    def get_attendance(self, date: str = None) -> List[Dict[str, Any]]:
        """Get attendance records for a specific date"""
        try:
            if not date:
                date = datetime.datetime.now().strftime('%Y-%m-%d')
            
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT a.student_id, a.name, a.time, a.status, a.notes, 
                           s.department, s.email
                    FROM attendance a
                    LEFT JOIN students s ON a.student_id = s.student_id
                    WHERE a.date = ?
                    ORDER BY a.time DESC
                ''', (date,))
                
                return [dict(row) for row in cursor.fetchall()]
                
        except Exception as e:
            self._log('ERROR', f"Error getting attendance for {date}: {str(e)}")
            return []
    
    def get_attendance_stats(self, date: str = None) -> Dict[str, Any]:
        """Get attendance statistics for a date"""
        try:
            if not date:
                date = datetime.datetime.now().strftime('%Y-%m-%d')
            
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Total active students
                cursor.execute('SELECT COUNT(*) FROM students WHERE is_active = 1')
                total_students = cursor.fetchone()[0]
                
                # Present students today
                cursor.execute('''
                    SELECT COUNT(DISTINCT student_id) 
                    FROM attendance 
                    WHERE date = ? AND status = 'present'
                ''', (date,))
                present_count = cursor.fetchone()[0]
                
                # Late students (marked after 9:30 AM)
                cursor.execute('''
                    SELECT COUNT(DISTINCT student_id) 
                    FROM attendance 
                    WHERE date = ? AND time > '09:30:00' AND status = 'present'
                ''', (date,))
                late_count = cursor.fetchone()[0]
                
                # Absent students
                absent_count = total_students - present_count
                
                # Attendance rate
                attendance_rate = round((present_count / total_students) * 100, 2) if total_students > 0 else 0
                
                return {
                    'date': date,
                    'total_students': total_students,
                    'present': present_count,
                    'absent': absent_count,
                    'late': late_count,
                    'attendance_rate': attendance_rate,
                    'on_time': present_count - late_count
                }
                
        except Exception as e:
            self._log('ERROR', f"Error getting attendance stats: {str(e)}")
            return {}
    
    def get_attendance_history(self, student_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get attendance history for a student"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                start_date = (datetime.datetime.now() - datetime.timedelta(days=days)).strftime('%Y-%m-%d')
                
                cursor.execute('''
                    SELECT date, time, status, notes
                    FROM attendance
                    WHERE student_id = ? AND date >= ?
                    ORDER BY date DESC, time DESC
                ''', (student_id, start_date))
                
                return [dict(row) for row in cursor.fetchall()]
                
        except Exception as e:
            self._log('ERROR', f"Error getting attendance history for {student_id}: {str(e)}")
            return []
    
    def get_attendance_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Get attendance records for a date range"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT date, student_id, name, time, status, notes
                    FROM attendance
                    WHERE date BETWEEN ? AND ?
                    ORDER BY date DESC, time DESC
                ''', (start_date, end_date))
                
                return [dict(row) for row in cursor.fetchall()]
                
        except Exception as e:
            self._log('ERROR', f"Error getting attendance range {start_date} to {end_date}: {str(e)}")
            return []
    
    def _log(self, level: str, message: str, module: str = "database"):
        """Add system log entry"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO system_logs (level, message, module)
                    VALUES (?, ?, ?)
                ''', (level, message, module))
                conn.commit()
        except Exception as e:
            print(f"Failed to log: {e}")  # Fallback logging
    
    def get_system_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get system logs"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT level, message, module, created_at
                    FROM system_logs
                    ORDER BY created_at DESC
                    LIMIT ?
                ''', (limit,))
                
                return [dict(row) for row in cursor.fetchall()]
                
        except Exception as e:
            print(f"Error getting system logs: {e}")
            return []