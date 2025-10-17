"""
Utilities package for Smart Attendance System.

This package contains helper utilities for:
- Image processing
- File management
- Other common operations
"""

from .image_processor import ImageProcessor
from .file_manager import FileManager

__all__ = [
    'ImageProcessor',
    'FileManager'
]