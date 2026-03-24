from flask import Blueprint, request, jsonify
from models.project import Project
from models.user import User
from models.comment import Comment
from models.task import Task
from models.notification import Notification
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
    db.session.flush() # To get new_project.id and create notifications
    
    if assigned_user_ids:
        for u in users_to_assign:
            if u.id != user_id:
                notif = Notification(user_id=u.id, message=f"Has sido asignado al nuevo proyecto: {new_project.name}")
                db.session.add(notif)
                
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
            old_users = set(project.users)
            users_to_assign = User.query.filter(User.id.in_(data['assigned_users'])).all()
            project.users = users_to_assign
            
            new_users = set(users_to_assign) - old_users
            for u in new_users:
                if u.id != user_id:
                    notif = Notification(user_id=u.id, message=f"Has sido asignado al proyecto: {project.name}")
                    db.session.add(notif)
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

@projects_bp.route('/api/projects/<int:project_id>/comments', methods=['GET', 'POST'])
@jwt_required()
def handle_comments(project_id):
    project = Project.query.get_or_404(project_id)
    user_id = int(get_jwt_identity())
    
    if request.method == 'GET':
        comments = Comment.query.filter_by(project_id=project_id).order_by(Comment.created_at.asc()).all()
        return jsonify([c.to_dict() for c in comments]), 200
        
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('content'):
            return jsonify({'message': 'Content is required'}), 400
            
        new_comment = Comment(
            content=data['content'],
            project_id=project_id,
            user_id=user_id
        )
        db.session.add(new_comment)
        db.session.commit()
        return jsonify(new_comment.to_dict()), 201

@projects_bp.route('/api/projects/<int:project_id>/tasks', methods=['GET', 'POST'])
@jwt_required()
def handle_tasks(project_id):
    project = Project.query.get_or_404(project_id)
    
    if request.method == 'GET':
        tasks = Task.query.filter_by(project_id=project_id).order_by(Task.created_at.asc()).all()
        return jsonify([t.to_dict() for t in tasks]), 200
        
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('title'):
            return jsonify({'message': 'Title is required'}), 400
            
        new_task = Task(title=data['title'], project_id=project_id)
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201

@projects_bp.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    
    if request.method == 'PUT':
        data = request.get_json()
        if 'is_completed' in data:
            task.is_completed = data['is_completed']
        if 'title' in data:
            task.title = data['title']
        db.session.commit()
        return jsonify(task.to_dict()), 200
        
    if request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted'}), 200
