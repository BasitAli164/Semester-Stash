import sqlite3
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User:
    """User model for admin authentication"""
    
    def __init__(self, id=None, username=None, email=None, password_hash=None, created_at=None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at or datetime.utcnow()
    
    def set_password(self, password):
        """Set hashed password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    @staticmethod
    def create_table(cursor):
        """Create users table"""
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    
    @staticmethod
    def find_by_username(username, cursor):
        """Find user by username"""
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user_data = cursor.fetchone()
        if user_data:
            return User(
                id=user_data[0],
                username=user_data[1],
                email=user_data[2],
                password_hash=user_data[3],
                created_at=user_data[4]
            )
        return None
    
    @staticmethod
    def find_by_id(user_id, cursor):
        """Find user by ID"""
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user_data = cursor.fetchone()
        if user_data:
            return User(
                id=user_data[0],
                username=user_data[1],
                email=user_data[2],
                password_hash=user_data[3],
                created_at=user_data[4]
            )
        return None
    
    def save(self, cursor, conn):
        """Save user to database"""
        if self.id is None:
            cursor.execute('''
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            ''', (self.username, self.email, self.password_hash))
            self.id = cursor.lastrowid
        else:
            cursor.execute('''
                UPDATE users 
                SET username = ?, email = ?, password_hash = ?
                WHERE id = ?
            ''', (self.username, self.email, self.password_hash, self.id))
        conn.commit()
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }