# Import all models for easy access
from app.models.user import User, UserRole
from app.models.embedding import Embedding
from app.models.attendance import Attendance, AttendanceStatus

__all__ = ['User', 'UserRole', 'Embedding', 'Attendance', 'AttendanceStatus']