import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-key-for-project-mgmt')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///projects.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-super-secret-key')
