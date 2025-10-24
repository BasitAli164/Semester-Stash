from flask import jsonify
from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class ResponseFormatter:
    """Standardized response formatting utilities"""
    
    @staticmethod
    def success(
        message: str = "Success",
        data: Any = None,
        status_code: int = 200,
        pagination: Optional[Dict] = None
    ) -> tuple:
        """Format successful response"""
        response_data = {
            'status': 'success',
            'message': message,
            'status_code': status_code
        }
        
        if data is not None:
            response_data['data'] = data
        
        if pagination:
            response_data['pagination'] = pagination
        
        return jsonify(response_data), status_code
    
    @staticmethod
    def created(message: str = "Resource created successfully", data: Any = None) -> tuple:
        """Format resource created response"""
        return ResponseFormatter.success(message, data, 201)
    
    @staticmethod
    def paginated(
        data: List[Any],
        total: int,
        page: int,
        per_page: int,
        message: str = "Data retrieved successfully"
    ) -> tuple:
        """Format paginated response"""
        total_pages = (total + per_page - 1) // per_page if per_page > 0 else 1
        
        pagination = {
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': total_pages,
            'has_next': page < total_pages,
            'has_prev': page > 1
        }
        
        return ResponseFormatter.success(message, data, 200, pagination)
    
    @staticmethod
    def error(
        message: str = "An error occurred",
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Any = None
    ) -> tuple:
        """Format error response"""
        error_data = {
            'status': 'error',
            'message': message,
            'status_code': status_code
        }
        
        if error_code:
            error_data['error_code'] = error_code
        
        if details:
            error_data['details'] = details
        
        logger.warning(f"Error response: {message} (Code: {status_code})")
        return jsonify(error_data), status_code
    
    @staticmethod
    def from_exception(exception) -> tuple:
        """Format response from exception"""
        if hasattr(exception, 'to_dict'):
            # Custom API exception
            return jsonify(exception.to_dict()), exception.status_code
        else:
            # Generic exception
            return ResponseFormatter.error(
                message=str(exception) or "An unexpected error occurred",
                status_code=500,
                error_code='unexpected_error'
            )