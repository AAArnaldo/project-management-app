from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database.db import db

# Import Blueprints
from routes.auth import auth_bp
from routes.users import users_bp
from routes.projects import projects_bp
from database.init_db import init_sample_data

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize Extensions
    CORS(app)
    db.init_app(app)
    JWTManager(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(projects_bp)
    
    # Setup Database
    with app.app_context():
        import models.comment
        import models.task
        import models.notification
        
        db.create_all()
        init_sample_data(app)
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
