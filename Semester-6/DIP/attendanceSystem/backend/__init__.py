"""
Smart Attendance System Backend Package

A comprehensive face recognition-based attendance system built with Flask and OpenCV.
"""

__version__ = '1.0.0'
__author__ = 'Smart Attendance System Team'
__description__ = 'Face recognition attendance system backend'

# Package-level imports for easier access
from .app import create_app
from .config import config

# Define what should be imported with "from backend import *"
__all__ = [
    'create_app',
    'config'
]