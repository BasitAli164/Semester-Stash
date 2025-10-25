import sqlite3
import os
from app.config import Config
from app.models.user import User
from app.models.student import Student
from app.models.attendance import Attendance

class DatabaseService:
    """Database service for SQLite operations"""
    
    def __init__(self):
        self.db_path = Config.DATABASE_PATH
        self._ensure_database_exists()
    
    def _ensure_database_exists(self):
        """Ensure database file and tables exist"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        User.create_table(cursor)
        Student.create_table(cursor)
        Attendance.create_table(cursor)
        
        # Create default admin user if not exists
        self._create_default_admin(cursor, conn)
        
        conn.close()
    
    def _create_default_admin(self, cursor, conn):
        """Create default admin user"""
        cursor.execute('SELECT COUNT(*) FROM users')
        if cursor.fetchone()[0] == 0:
            admin = User(
                username='admin',
                email='admin@school.edu',
            )
            admin.set_password('admin123')
            admin.save(cursor, conn)
            print("Default admin user created: admin/admin123")
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def execute_query(self, query, params=()):
        """Execute a query and return results"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        result = cursor.fetchall()
        conn.close()
        return result
    
    def execute_commit(self, query, params=()):
        """Execute a query and commit changes"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        conn.close()

# Global instance
db_service = DatabaseService()