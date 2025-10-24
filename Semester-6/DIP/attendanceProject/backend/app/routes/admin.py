from flask import Blueprint, request, jsonify
from app.utils.decorators import admin_required
from app.models.user import User, UserRole
from app import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users(current_user):
    """Get all users (Admin only)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        role_filter = request.args.get('role')
        
        query = User.query
        
        if role_filter:
            query = query.filter_by(role=UserRole(role_filter))
        
        users_pagination = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        users_data = {
            'users': [user.to_dict() for user in users_pagination.items],
            'total': users_pagination.total,
            'pages': users_pagination.pages,
            'current_page': page
        }
        
        return jsonify({
            'message': 'Users retrieved successfully',
            'data': users_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Failed to retrieve users',
            'error': str(e)
        }), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(current_user, user_id):
    """Get specific user details (Admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        return jsonify({
            'message': 'User retrieved successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Failed to retrieve user',
            'error': str(e)
        }), 500

@admin_bp.route('/users/<int:user_id>/toggle-active', methods=['PUT'])
@admin_required
def toggle_user_active(current_user, user_id):
    """Toggle user active status (Admin only)"""
    try:
        if user_id == current_user.id:
            return jsonify({
                'message': 'Cannot deactivate your own account',
                'error': 'self_deactivation_not_allowed'
            }), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        user.is_active = not user.is_active
        db.session.commit()
        
        action = "activated" if user.is_active else "deactivated"
        
        return jsonify({
            'message': f'User {action} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Failed to update user status',
            'error': str(e)
        }), 500

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_admin_stats(current_user):
    """Get admin dashboard statistics"""
    try:
        total_users = User.query.count()
        total_students = User.query.filter_by(role=UserRole.STUDENT).count()
        total_admins = User.query.filter_by(role=UserRole.ADMIN).count()
        active_users = User.query.filter_by(is_active=True).count()
        
        stats = {
            'total_users': total_users,
            'total_students': total_students,
            'total_admins': total_admins,
            'active_users': active_users
        }
        
        return jsonify({
            'message': 'Statistics retrieved successfully',
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Failed to retrieve statistics',
            'error': str(e)
        }), 500