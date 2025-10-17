"""
API package for Smart Attendance System.

This package contains all API route handlers and endpoints.
"""

from .students import students_bp
from .attendance import attendance_bp
from .system import system_bp

# List of all API blueprints for easy registration
all_blueprints = [
    students_bp,
    attendance_bp,
    system_bp
]

__all__ = [
    'students_bp',
    'attendance_bp', 
    'system_bp',
    'all_blueprints'
]

# Package metadata
__version__ = '1.0.0'
__description__ = 'API routes for Smart Attendance System'