"""
Services package for Smart Attendance System.

This package contains business logic services for:
- Student management
- Attendance processing  
- Model training
"""

from .student_service import StudentService
from .attendance_service import AttendanceService
from .training_service import TrainingService

__all__ = [
    'StudentService',
    'AttendanceService',
    'TrainingService'
]