document.addEventListener('DOMContentLoaded', async () => {
    Layout.init();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'Admin';
    
    // Show create button if admin
    if (isAdmin) {
        document.getElementById('btnCreateProject').style.display = 'inline-block';
        loadUsersForSelect();
    }
    
    await loadProjects();

    const form = document.getElementById('projectForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('btnSaveProject');
            const errorAlert = document.getElementById('projectError');
            btn.disabled = true;
            errorAlert.classList.add('d-none');
            
            const name = document.getElementById('projectName').value;
            const description = document.getElementById('projectDescription').value;
            const status = document.getElementById('projectStatus').value;
            
            // Get selected user IDs
            const selectEl = document.getElementById('projectUsers');
            const assigned_users = Array.from(selectEl.selectedOptions).map(opt => parseInt(opt.value));
            
            try {
                await ApiClient.post('/projects', { name, description, status, assigned_users });
                
                // Hide modal and refresh table
                const modal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
                modal.hide();
                form.reset();
                await loadProjects();
                
            } catch (error) {
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('d-none');
            } finally {
                btn.disabled = false;
            }
        });
    }
});

async function loadProjects() {
    try {
        const projects = await ApiClient.get('/projects');
        const tbody = document.getElementById('projectsTable');
        
        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No projects found.</td></tr>';
            return;
        }
        
        tbody.innerHTML = projects.map(p => `
            <tr>
                <td class="align-middle fw-medium">${p.name}</td>
                <td class="align-middle">
                    <span class="status-badge status-${p.status.replace(/\s+/g, '')}">
                        ${p.status}
                    </span>
                </td>
                <td class="align-middle text-secondary">${p.creator_name || 'Unknown'}</td>
                <td class="align-middle">
                    <span class="badge bg-secondary rounded-pill">${p.assigned_users.length}</span>
                </td>
                <td class="align-middle text-end">
                    <a href="project_detail.html?id=${p.id}" class="btn btn-sm btn-light border shadow-sm">
                        <i class="fa-solid fa-eye text-primary"></i> View
                    </a>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        document.getElementById('projectsTable').innerHTML = 
            `<tr><td colspan="5" class="text-danger text-center py-4">Error loading data.</td></tr>`;
    }
}

async function loadUsersForSelect() {
    try {
        const users = await ApiClient.get('/users');
        const select = document.getElementById('projectUsers');
        select.innerHTML = users.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('');
    } catch (e) {
        console.error('Failed to load users', e);
    }
}
