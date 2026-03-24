const statusTranslations = {
    'Pending': 'Pendiente',
    'In Progress': 'En Progreso',
    'Completed': 'Completado'
};

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    if (!projectId) {
        window.location.href = 'projects.html';
        return;
    }

    const role = localStorage.getItem('role');
    const isEditing = role === 'Admin';
    if (isEditing) {
        document.getElementById('btnDeleteProject').classList.remove('d-none');
        document.getElementById('updateStatusForm').style.display = 'block';
    } else {
        document.getElementById('updateStatusForm').style.display = 'block';
    }

    await loadProjectDetails(projectId);
    await Promise.all([loadTasks(projectId), loadComments(projectId)]);

    // Update Status
    const statusForm = document.getElementById('updateStatusForm');
    if (statusForm) {
        statusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newStatus = document.getElementById('newStatus').value;
            const btn = document.getElementById('btnUpdateStatus');
            const msg = document.getElementById('statusUpdateMsg');
            
            try {
                btn.disabled = true;
                btn.innerHTML = 'Guardando...';
                
                await ApiClient.updateProjectStatus(projectId, newStatus);
                
                msg.classList.remove('d-none');
                setTimeout(() => msg.classList.add('d-none'), 3000);
                
                await loadProjectDetails(projectId);
                
            } catch (error) {
                alert('Error al actualizar el estado del proyecto.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Guardar Estado';
            }
        });
    }

    // Delete
    const btnDelete = document.getElementById('btnDeleteProject');
    if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.')) {
                try {
                    btnDelete.disabled = true;
                    btnDelete.innerHTML = 'Eliminando...';
                    await ApiClient.deleteProject(projectId);
                    window.location.href = 'projects.html';
                } catch (error) {
                    alert('Error al eliminar el proyecto.');
                    btnDelete.disabled = false;
                    btnDelete.innerHTML = '<i class="fa-solid fa-trash me-1"></i> Eliminar';
                }
            }
        });
    }

    // Task Form
    const taskForm = document.getElementById('taskForm');
    if(taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('newTaskTitle').value;
            await ApiClient.createProjectTask(projectId, { title });
            document.getElementById('newTaskTitle').value = '';
            await loadTasks(projectId);
        });
    }

    // Comment Form
    const commentForm = document.getElementById('commentForm');
    if(commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('newComment').value;
            await ApiClient.createProjectComment(projectId, { content });
            document.getElementById('newComment').value = '';
            await loadComments(projectId);
        });
    }
});

async function loadProjectDetails(id) {
    try {
        const project = await ApiClient.getProject(id);
        
        document.getElementById('detailTitle').textContent = project.name;
        document.getElementById('detailDescription').textContent = project.description || 'Sin descripción';
        
        const displayStatus = statusTranslations[project.status] || project.status;
        const statusBadge = document.getElementById('detailStatus');
        statusBadge.className = `status-badge status-${project.status.replace(' ', '-')}`;
        statusBadge.textContent = displayStatus;
        
        document.getElementById('newStatus').value = project.status;
        
        document.getElementById('detailCreator').textContent = project.creator_name || 'Desconocido';
        
        const teamList = document.getElementById('detailTeam');
        if (project.assigned_users && project.assigned_users.length > 0) {
            teamList.innerHTML = project.assigned_users.map(u => `
                <li class="mb-2 d-flex align-items-center">
                    <div class="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 28px; height: 28px; font-size: 0.75rem;">
                        ${u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="text-dark small">${u.name}</div>
                        <div class="text-secondary" style="font-size: 0.7rem;">${u.email}</div>
                    </div>
                </li>
            `).join('');
        } else {
            teamList.innerHTML = '<li class="text-secondary small">Sin equipo asignado</li>';
        }

    } catch (error) {
        document.getElementById('detailTitle').textContent = 'Proyecto no encontrado';
        document.getElementById('detailDescription').textContent = '';
        setTimeout(() => window.location.href = 'projects.html', 2000);
    }
}

async function loadTasks(id) {
    const list = document.getElementById('tasksList');
    try {
        const tasks = await ApiClient.getProjectTasks(id);
        if (tasks.length === 0) {
            list.innerHTML = '<li class="list-group-item text-center text-secondary small py-4">No hay tareas aún.</li>';
            return;
        }
        list.innerHTML = tasks.map(t => {
            const isCompleted = t.is_completed;
            return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div class="form-check m-0">
                    <input class="form-check-input task-checkbox" type="checkbox" data-id="${t.id}" ${isCompleted ? 'checked' : ''}>
                    <label class="form-check-label ${isCompleted ? 'text-decoration-line-through text-secondary' : ''}">
                        ${t.title}
                    </label>
                </div>
                <button class="btn btn-link text-danger p-0 btn-delete-task" data-id="${t.id}" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
            </li>
            `;
        }).join('');
        
        document.querySelectorAll('.task-checkbox').forEach(chk => {
            chk.addEventListener('change', async (e) => {
                await ApiClient.updateTask(e.target.dataset.id, { is_completed: e.target.checked });
                await loadTasks(id);
            });
        });
        document.querySelectorAll('.btn-delete-task').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("¿Eliminar tarea?")) {
                    await ApiClient.deleteTask(e.currentTarget.dataset.id);
                    await loadTasks(id);
                }
            });
        });
    } catch(err) {
        list.innerHTML = '<li class="list-group-item text-danger">Error cargando tareas</li>';
    }
}

async function loadComments(id) {
    const list = document.getElementById('commentsList');
    try {
        const comments = await ApiClient.getProjectComments(id);
        const currentUserId = parseInt(localStorage.getItem('id'));
        
        if (comments.length === 0) {
            list.innerHTML = '<div class="text-center text-secondary small py-4">Sin comentarios. ¡Sé el primero en comentar!</div>';
            return;
        }
        
        list.innerHTML = comments.map(c => {
            const isMe = c.user_id === currentUserId;
            // Provide data-theme override classes safely by using bg-primary for me and bg-light for them. 
            // The border class behaves well in dark mode.
            return `
            <div class="d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}">
                <div class="small text-secondary mb-1 px-1">${isMe ? 'Tú' : c.user_name} • ${new Date(c.created_at).toLocaleDateString()}</div>
                <div class="p-2 rounded ${isMe ? 'bg-primary text-white' : 'bg-light border text-dark'}" style="max-width: 80%;">
                    ${c.content}
                </div>
            </div>
            `;
        }).join('');
        list.scrollTop = list.scrollHeight;
    } catch(err) {
        list.innerHTML = '<div class="text-danger">Error cargando comentarios</div>';
    }
}

