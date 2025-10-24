from app import db
from datetime import datetime, date
import enum

class AttendanceStatus(enum.Enum):
    """Attendance status enumeration"""
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"

class Attendance(db.Model):
    """Attendance model for storing attendance records"""
    __tablename__ = 'attendance'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, default=date.today)
    time = db.Column(db.Time, nullable=False, default=datetime.utcnow)
    status = db.Column(db.Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.PRESENT)
    confidence = db.Column(db.Float, nullable=True)  # Recognition confidence score
    method = db.Column(db.String(20), default='face_recognition')  # 'face_recognition', 'manual'
    location = db.Column(db.String(100), nullable=True)  # Optional: GPS/room location
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Composite unique constraint - one attendance per user per day
    __table_args__ = (
        db.UniqueConstraint('user_id', 'date', name='unique_attendance_per_day'),
        db.Index('idx_user_date', 'user_id', 'date'),
        db.Index('idx_date_status', 'date', 'status'),
    )
    
    def to_dict(self):
        """Convert attendance object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time.isoformat() if self.time else None,
            'status': self.status.value,
            'confidence': self.confidence,
            'method': self.method,
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def mark_attendance(cls, user_id, confidence=None, status=AttendanceStatus.PRESENT, method='face_recognition'):
        """Helper method to mark attendance for today"""
        today = date.today()
        
        # Check if attendance already marked for today
        existing = cls.query.filter_by(user_id=user_id, date=today).first()
        if existing:
            return existing  # Already marked
        
        attendance = cls(
            user_id=user_id,
            date=today,
            time=datetime.utcnow().time(),
            status=status,
            confidence=confidence,
            method=method
        )
        
        db.session.add(attendance)
        return attendance
    
    def __repr__(self):
        return f'<Attendance User:{self.user_id} Date:{self.date} Status:{self.status.value}>'