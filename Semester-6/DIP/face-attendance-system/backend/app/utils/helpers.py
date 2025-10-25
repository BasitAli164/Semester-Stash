import os
import uuid
from werkzeug.utils import secure_filename
from app.config import Config

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_IMAGE_EXTENSIONS

def generate_unique_filename(filename):
    """Generate unique filename for uploads"""
    ext = filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return unique_name

def save_uploaded_file(file, folder):
    """Save uploaded file to specified folder"""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(filename)
        file_path = os.path.join(folder, unique_filename)
        file.save(file_path)
        return unique_filename
    return None

def ensure_folders_exist():
    """Ensure all required folders exist"""
    folders = [
        Config.UPLOAD_FOLDER,
        Config.STUDENT_IMAGES_FOLDER,
        Config.TEMP_UPLOAD_FOLDER
    ]
    
    for folder in folders:
        os.makedirs(folder, exist_ok=True)

def cleanup_file(file_path):
    """Delete file if exists"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except:
        pass
    return False