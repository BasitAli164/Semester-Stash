# Routes package
from .auth import auth_bp
from .students import students_bp
from .attendance import attendance_bp
from .admin import admin_bp

__all__ = ['auth_bp', 'students_bp', 'attendance_bp', 'admin_bp']