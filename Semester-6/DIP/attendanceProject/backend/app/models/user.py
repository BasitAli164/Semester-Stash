from app import db, bcrypt
from sqlalchemy import CheckConstraint
from datetime import datetime
import enum

class UserRole(enum.Enum):
    """User role enumeration"""
    ADMIN = "admin"
    STUDENT = "student"

class User(db.Model):
    """User model for storing admin and student accounts"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    email = db.Column(db.String(120), unique=True, nullable=True)
    image_dir = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    embeddings = db.relationship('Embedding', backref='user', cascade='all, delete-orphan', lazy=True)
    attendance_records = db.relationship('Attendance', backref='user', cascade='all, delete-orphan', lazy=True)
    
    # Check constraint for role
    __table_args__ = (
        CheckConstraint(role.in_([role.value for role in UserRole]), name='valid_role_check'),
    )
    
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
            'role': self.role.value,
            'image_dir': self.image_dir,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<User {self.username} - {self.role.value}>'