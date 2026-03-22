document.addEventListener('DOMContentLoaded', async () => {
    Layout.init();
    
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (!projectId) {
        window.location.href = 'projects.html';
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'Admin';
    
    if (isAdmin) {
        const btnDelete = document.getElementById('btnDeleteProject');
        btnDelete.classList.remove('d-none');
        btnDelete.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
                try {
                    btnDelete.disabled = true;
                    btnDelete.innerHTML = 'Deleting...';
                    await ApiClient.delete(`/projects/${projectId}`);
                    window.location.href = 'projects.html';
                } catch (error) {
                    alert(error.message);
                    btnDelete.disabled = false;
                }
            }
        });
    }

    await loadProjectDetails(projectId);
    
    document.getElementById('updateStatusForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newStatus = document.getElementById('newStatus').value;
        const btn = document.getElementById('btnUpdateStatus');
        
        try {
            btn.disabled = true;
            await ApiClient.put(`/projects/${projectId}`, { status: newStatus });
            
            // Show success message briefly
            const msg = document.getElementById('statusUpdateMsg');
            msg.classList.remove('d-none');
            setTimeout(() => msg.classList.add('d-none'), 3000);
            
            // Reload details to reflect new status
            await loadProjectDetails(projectId);
        } catch (error) {
            alert('Failed to update status: ' + error.message);
        } finally {
            btn.disabled = false;
        }
    });
});

async function loadProjectDetails(id) {
    try {
        const project = await ApiClient.get(`/projects/${id}`);
        
        document.getElementById('detailTitle').textContent = project.name;
        document.getElementById('detailDescription').textContent = project.description || 'No description provided.';
        document.getElementById('detailCreator').textContent = project.creator_name || 'Unknown';
        
        const statusSpan = document.getElementById('detailStatus');
        statusSpan.textContent = project.status;
        statusSpan.className = `status-badge status-${project.status.replace(/\s+/g, '')}`;
        
        document.getElementById('newStatus').value = project.status;
        
        const teamList = document.getElementById('detailTeam');
        if (project.assigned_users && project.assigned_users.length > 0) {
            teamList.innerHTML = project.assigned_users.map(u => `
                <li class="mb-2 d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 28px; height: 28px; font-size: 0.8rem">
                        ${u.name.charAt(0).toUpperCase()}
                    </div>
                    <span>${u.name} <small class="text-secondary ms-1">(${u.role})</small></span>
                </li>
            `).join('');
        } else {
            teamList.innerHTML = '<li class="text-secondary small fst-italic">No team members assigned</li>';
        }
        
    } catch (e) {
        console.error(e);
        document.getElementById('detailTitle').textContent = 'Project Not Found or Access Denied';
    }
}
