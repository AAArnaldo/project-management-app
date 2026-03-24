from database.db import db
from models.user import User
from models.project import Project
from models.task import Task
from models.comment import Comment
from models.notification import Notification
from datetime import datetime, timedelta

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
        
        user3 = User(name='Carlos Pérez', email='carlos@example.com', role='User')
        user3.set_password('user123')
        
        user4 = User(name='Daniela Ruiz', email='daniela@example.com', role='User')
        user4.set_password('user123')
        
        db.session.add_all([admin, user1, user2, user3, user4])
        db.session.commit()
        
        now = datetime.utcnow()
        
        # --- Projects ---
        p1 = Project(
            name='Rediseño del Sitio Web', 
            description='Renovar el sitio web corporativo con un diseño moderno y responsive',
            status='In Progress',
            created_by=admin.id
        )
        p1.users.extend([user1, user2])
        
        p2 = Project(
            name='API para App Móvil', 
            description='Desarrollar la API REST para la nueva aplicación móvil',
            status='Pending',
            created_by=admin.id
        )
        p2.users.extend([user1, user3])
        
        p3 = Project(
            name='Auditoría de Seguridad', 
            description='Realizar auditoría de seguridad y pruebas de penetración',
            status='Completed',
            created_by=admin.id
        )
        p3.users.append(user2)
        
        p4 = Project(
            name='Sistema de Inventario',
            description='Crear un sistema de gestión de inventario para el almacén principal',
            status='In Progress',
            created_by=admin.id
        )
        p4.users.extend([user3, user4])
        
        p5 = Project(
            name='Dashboard de Analítica',
            description='Panel de visualización de datos y métricas de negocio en tiempo real',
            status='Pending',
            created_by=admin.id
        )
        p5.users.extend([user1, user4])
        
        p6 = Project(
            name='Migración a la Nube',
            description='Migrar la infraestructura actual a AWS con contenedores Docker',
            status='Pending',
            created_by=admin.id
        )
        p6.users.extend([user2, user3])
        
        p7 = Project(
            name='App de Gestión de Clientes',
            description='CRM interno para seguimiento de clientes y oportunidades de venta',
            status='In Progress',
            created_by=admin.id
        )
        p7.users.extend([user1, user2, user4])
        
        p8 = Project(
            name='Automatización de Reportes',
            description='Sistema automático para generar y enviar reportes semanales por email',
            status='Pending',
            created_by=admin.id
        )
        p8.users.extend([user3, user4])
        
        p9 = Project(
            name='Portal de Capacitación',
            description='Plataforma e-learning interna con cursos y evaluaciones para el equipo',
            status='Completed',
            created_by=admin.id
        )
        p9.users.extend([user1, user3])
        
        db.session.add_all([p1, p2, p3, p4, p5, p6, p7, p8, p9])
        db.session.commit()
        
        # --- Tasks (some with past due dates to test overdue display) ---
        tasks_data = [
            # p1 - Rediseño Web (In Progress, some done)
            Task(title='Diseñar wireframes de la página principal', is_completed=True, project_id=p1.id, due_date=now - timedelta(days=5)),
            Task(title='Implementar diseño responsive', is_completed=False, project_id=p1.id, due_date=now + timedelta(days=3)),
            Task(title='Optimizar imágenes y assets', is_completed=False, project_id=p1.id, due_date=now - timedelta(days=1)),  # OVERDUE
            Task(title='Pruebas de rendimiento', is_completed=False, project_id=p1.id, due_date=now + timedelta(days=10)),
            
            # p2 - API Móvil (Pending)
            Task(title='Definir endpoints de autenticación', is_completed=False, project_id=p2.id, due_date=now + timedelta(days=7)),
            Task(title='Implementar CRUD de usuarios', is_completed=False, project_id=p2.id, due_date=now + timedelta(days=14)),
            Task(title='Documentar API con Swagger', is_completed=False, project_id=p2.id, due_date=now + timedelta(days=21)),
            
            # p3 - Auditoría (Completed, all done)
            Task(title='Análisis de vulnerabilidades', is_completed=True, project_id=p3.id, due_date=now - timedelta(days=15)),
            Task(title='Reporte de hallazgos', is_completed=True, project_id=p3.id, due_date=now - timedelta(days=10)),
            
            # p4 - Inventario (In Progress)
            Task(title='Diseñar modelo de datos', is_completed=True, project_id=p4.id, due_date=now - timedelta(days=3)),
            Task(title='Crear formularios de entrada/salida', is_completed=False, project_id=p4.id, due_date=now + timedelta(days=5)),
            Task(title='Integrar lector de códigos de barra', is_completed=False, project_id=p4.id, due_date=now - timedelta(days=2)),  # OVERDUE
            Task(title='Generar reportes de stock', is_completed=False, project_id=p4.id, due_date=now + timedelta(days=8)),
            
            # p5 - Analítica (Pending)
            Task(title='Conectar fuentes de datos', is_completed=False, project_id=p5.id, due_date=now + timedelta(days=10)),
            Task(title='Crear gráficos de KPIs', is_completed=False, project_id=p5.id, due_date=now + timedelta(days=15)),
            
            # p7 - CRM (In Progress)  
            Task(title='Módulo de contactos', is_completed=True, project_id=p7.id, due_date=now - timedelta(days=7)),
            Task(title='Pipeline de ventas', is_completed=True, project_id=p7.id, due_date=now - timedelta(days=4)),
            Task(title='Integración con email', is_completed=False, project_id=p7.id, due_date=now + timedelta(days=2)),
            Task(title='Reportes de conversión', is_completed=False, project_id=p7.id, due_date=now - timedelta(days=1)),  # OVERDUE
        ]
        
        db.session.add_all(tasks_data)
        db.session.commit()
        
        # --- Comments ---
        comments_data = [
            Comment(content='El diseño se ve genial, avancemos con la implementación.', project_id=p1.id, user_id=admin.id),
            Comment(content='Necesito los assets optimizados antes del viernes.', project_id=p1.id, user_id=user1.id),
            Comment(content='¿Qué framework usamos para la API?', project_id=p2.id, user_id=user1.id),
            Comment(content='Propongo usar Flask con SQLAlchemy como ya tenemos.', project_id=p2.id, user_id=user3.id),
            Comment(content='Auditoría completa. No se encontraron vulnerabilidades críticas.', project_id=p3.id, user_id=user2.id),
            Comment(content='El lector de códigos necesita una librería adicional.', project_id=p4.id, user_id=user3.id),
            Comment(content='El módulo de contactos ya está en producción.', project_id=p7.id, user_id=user1.id),
        ]
        
        db.session.add_all(comments_data)
        db.session.commit()
        
        # --- Notifications ---
        notifications_data = [
            Notification(user_id=user1.id, message=f'Has sido asignado al nuevo proyecto: {p1.name}'),
            Notification(user_id=user1.id, message=f'Has sido asignado al nuevo proyecto: {p2.name}'),
            Notification(user_id=user1.id, message=f'Has sido asignado al nuevo proyecto: {p5.name}'),
            Notification(user_id=user1.id, message=f'Has sido asignado al nuevo proyecto: {p7.name}'),
            Notification(user_id=user2.id, message=f'Has sido asignado al nuevo proyecto: {p1.name}'),
            Notification(user_id=user2.id, message=f'Has sido asignado al nuevo proyecto: {p3.name}'),
            Notification(user_id=user2.id, message=f'Has sido asignado al nuevo proyecto: {p6.name}'),
            Notification(user_id=user2.id, message=f'Has sido asignado al nuevo proyecto: {p7.name}'),
            Notification(user_id=user3.id, message=f'Has sido asignado al nuevo proyecto: {p2.name}'),
            Notification(user_id=user3.id, message=f'Has sido asignado al nuevo proyecto: {p4.name}'),
            Notification(user_id=user3.id, message=f'Has sido asignado al nuevo proyecto: {p6.name}'),
            Notification(user_id=user4.id, message=f'Has sido asignado al nuevo proyecto: {p4.name}'),
            Notification(user_id=user4.id, message=f'Has sido asignado al nuevo proyecto: {p5.name}'),
            Notification(user_id=user4.id, message=f'Has sido asignado al nuevo proyecto: {p7.name}'),
            Notification(user_id=user4.id, message=f'Has sido asignado al nuevo proyecto: {p8.name}'),
        ]
        
        db.session.add_all(notifications_data)
        db.session.commit()
        
        print("Sample data successfully created!")
