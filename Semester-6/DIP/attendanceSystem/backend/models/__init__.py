"""
Models package for Smart Attendance System.

This package contains all data models and database-related functionality.
"""

from .database import DatabaseManager
from .face_model import FaceRecognizer

__all__ = [
    'DatabaseManager',
    'FaceRecognizer'
]