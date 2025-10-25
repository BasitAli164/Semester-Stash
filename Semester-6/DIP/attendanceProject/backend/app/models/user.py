from app import db, bcrypt
from datetime import datetime

class User(db.Model):
    """User model for storing student accounts"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    student_id = db.Column(db.String(20), unique=True, nullable=True)  # Student ID number
    image_dir = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    embeddings = db.relationship('Embedding', backref='user', cascade='all, delete-orphan', lazy=True)
    attendance_records = db.relationship('Attendance', backref='user', cascade='all, delete-orphan', lazy=True)
    
    @property
    def password(self):
        """Prevent password from being accessed"""
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        """Set password hash"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def verify_password(self, password):
        """Verify password against hash"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'username': self.username,
            'email': self.email,
            'student_id': self.student_id,
            'image_dir': self.image_dir,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'embedding_count': len(self.embeddings),
            'attendance_count': len(self.attendance_records)
        }
    
    def __repr__(self):
        return f'<User {self.username}>'