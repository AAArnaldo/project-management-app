from database.db import db

# Association table for many-to-many relationship between projects and users
project_users = db.Table('project_users',
    db.Column('id', db.Integer, primary_key=True),
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), nullable=False),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), nullable=False)
)

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Pending') # 'Pending', 'In Progress', 'Completed'
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    users = db.relationship('User', secondary=project_users, lazy='subquery',
        backref=db.backref('projects', lazy=True))
        
    creator = db.relationship('User', foreign_keys=[created_by])

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'created_by': self.created_by,
            'creator_name': self.creator.name if self.creator else None,
            'assigned_users': [user.to_dict() for user in self.users]
        }
