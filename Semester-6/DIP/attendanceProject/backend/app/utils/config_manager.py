import os
import logging
from typing import Any, Dict
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class ConfigManager:
    """Configuration management utilities"""
    
    @staticmethod
    def load_environment():
        """Load environment variables from .env file"""
        env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
        if os.path.exists(env_path):
            load_dotenv(env_path)
            logger.info("Environment variables loaded from .env file")
        else:
            logger.warning(".env file not found, using system environment variables")
    
    @staticmethod
    def get_required_env(key: str, default: Any = None) -> str:
        """Get required environment variable or raise error"""
        value = os.getenv(key, default)
        if value is None:
            raise ValueError(f"Required environment variable {key} is not set")
        return value
    
    @staticmethod
    def get_bool_env(key: str, default: bool = False) -> bool:
        """Get boolean environment variable"""
        value = os.getenv(key, str(default)).lower()
        return value in ('true', '1', 'yes', 'on')
    
    @staticmethod
    def get_int_env(key: str, default: int = 0) -> int:
        """Get integer environment variable"""
        try:
            return int(os.getenv(key, default))
        except (TypeError, ValueError):
            logger.warning(f"Invalid integer value for {key}, using default: {default}")
            return default
    
    @staticmethod
    def get_float_env(key: str, default: float = 0.0) -> float:
        """Get float environment variable"""
        try:
            return float(os.getenv(key, default))
        except (TypeError, ValueError):
            logger.warning(f"Invalid float value for {key}, using default: {default}")
            return default
    
    @staticmethod
    def validate_config(config: Dict[str, Any]) -> bool:
        """Validate critical configuration values"""
        required_keys = [
            'SECRET_KEY',
            'SQLALCHEMY_DATABASE_URI',
            'JWT_SECRET_KEY'
        ]
        
        missing_keys = [key for key in required_keys if not config.get(key)]
        if missing_keys:
            logger.error(f"Missing required configuration keys: {', '.join(missing_keys)}")
            return False
        
        # Validate file paths
        file_paths = [
            'TRAINING_IMAGES_PATH',
            'PROCESSED_FACES_PATH',
            'MODELS_STORAGE_PATH'
        ]
        
        for path_key in file_paths:
            path = config.get(path_key)
            if path:
                try:
                    os.makedirs(path, exist_ok=True)
                except Exception as e:
                    logger.error(f"Could not create directory for {path_key}: {str(e)}")
                    return False
        
        logger.info("Configuration validation successful")
        return True