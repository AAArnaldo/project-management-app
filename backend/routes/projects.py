from flask import Blueprint, request, jsonify
from models.project import Project
from models.user import User
from database.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

projects_bp = Blueprint('projects', __name__)

def is_admin():
    claims = get_jwt()
    return claims.get('role') == 'Admin'

@projects_bp.route('/api/projects', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = int(get_jwt_identity())
    
    if is_admin():
        # Admin can view all projects
        projects = Project.query.all()
    else:
        # User views assigned projects
        user = User.query.get(user_id)
        if not user:
             return jsonify({'message': 'User not found'}), 404
        projects = user.projects
        
    return jsonify([project.to_dict() for project in projects]), 200

@projects_bp.route('/api/projects', methods=['POST'])
@jwt_required()
def create_project():
    if not is_admin():
        return jsonify({'message': 'Admin privileges required'}), 403
        
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'message': 'Project name is required'}), 400
        
    user_id = int(get_jwt_identity())
    
    new_project = Project(
        name=data['name'],
        description=data.get('description', ''),
        status=data.get('status', 'Pending'),
        created_by=user_id
    )
    
    # Assign users if provided
    assigned_user_ids = data.get('assigned_users', [])
    if assigned_user_ids:
        users_to_assign = User.query.filter(User.id.in_(assigned_user_ids)).all()
        new_project.users.extend(users_to_assign)
        
    db.session.add(new_project)
    db.session.commit()
    
    return jsonify({
        'message': 'Project created successfully',
        'project': new_project.to_dict()
    }), 201

@projects_bp.route('/api/projects/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404
        
    if not is_admin():
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if project not in user.projects:
            return jsonify({'message': 'Access denied'}), 403
            
    return jsonify(project.to_dict()), 200

@projects_bp.route('/api/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404
        
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if is_admin():
        # Admin can update everything
        project.name = data.get('name', project.name)
        project.description = data.get('description', project.description)
        project.status = data.get('status', project.status)
        
        # Update assigned users if provided in request
        if 'assigned_users' in data:
            users_to_assign = User.query.filter(User.id.in_(data['assigned_users'])).all()
            project.users = users_to_assign
    else:
        # User capability: "Update project status"
        user = User.query.get(user_id)
        if project not in user.projects:
            return jsonify({'message': 'Access denied'}), 403
            
        # Only allow updating status
        if 'status' in data:
            project.status = data['status']
            
    db.session.commit()
    
    return jsonify({
        'message': 'Project updated successfully',
        'project': project.to_dict()
    }), 200

@projects_bp.route('/api/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    if not is_admin():
        return jsonify({'message': 'Admin privileges required'}), 403
        
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404
        
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': 'Project deleted successfully'}), 200
