from database.db import db
from models.user import User
from models.project import Project

def init_sample_data(app):
    with app.app_context():
        # Check if db has users
        if User.query.first():
            print("Database already initialized.")
            return

        print("Initializing sample data...")
        
        # Create Admin
        admin = User(name='Admin Boss', email='admin@example.com', role='Admin')
        admin.set_password('admin123')
        
        # Create Users
        user1 = User(name='Alice Smith', email='alice@example.com', role='User')
        user1.set_password('user123')
        
        user2 = User(name='Bob Jones', email='bob@example.com', role='User')
        user2.set_password('user123')
        
        db.session.add(admin)
        db.session.add(user1)
        db.session.add(user2)
        db.session.commit()
        
        # Create Sample Projects
        p1 = Project(
            name='Website Redesign', 
            description='Revamp the corporate website with a modern look',
            status='In Progress',
            created_by=admin.id
        )
        p1.users.extend([user1, user2])
        
        p2 = Project(
            name='Mobile App API', 
            description='Develop REST API for the new mobile application',
            status='Pending',
            created_by=admin.id
        )
        p2.users.append(user1)
        
        p3 = Project(
            name='Security Audit', 
            description='Perform security audit and penetration testing',
            status='Completed',
            created_by=admin.id
        )
        p3.users.append(user2)
        
        db.session.add(p1)
        db.session.add(p2)
        db.session.add(p3)
        db.session.commit()
        
        print("Sample data successfully created!")
