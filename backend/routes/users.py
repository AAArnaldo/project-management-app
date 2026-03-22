from flask import Blueprint, request, jsonify
from models.user import User
from database.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

users_bp = Blueprint('users', __name__)

def is_admin():
    claims = get_jwt()
    return claims.get('role') == 'Admin'

@users_bp.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@users_bp.route('/api/users', methods=['POST'])
@jwt_required()
def create_user():
    if not is_admin():
        return jsonify({'message': 'Admin privileges required'}), 403
        
    data = request.get_json()
    
    # Validation
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    # Check if user exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'message': 'User with this email already exists'}), 400
        
    # Verify max users rule (Up to 4 Users + 1 Admin)
    # The requirement says "Up to 4 Users". Let's say max 5 accounts total.
    total_users = User.query.count()
    if total_users >= 5:
        return jsonify({'message': 'User limit reached (Max 5 total accounts)'}), 400

    role = data.get('role', 'User')
    if role not in ['Admin', 'User']:
        role = 'User'
        
    new_user = User(
        name=data['name'],
        email=data['email'],
        role=role
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'User created successfully',
        'user': new_user.to_dict()
    }), 201
