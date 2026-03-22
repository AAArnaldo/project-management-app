document.addEventListener('DOMContentLoaded', async () => {
    Layout.init();
    
    try {
        const projects = await ApiClient.get('/projects');
        
        // Update stats
        document.getElementById('totalProjects').textContent = projects.length;
        document.getElementById('inProgressProjects').textContent = projects.filter(p => p.status === 'In Progress').length;
        document.getElementById('completedProjects').textContent = projects.filter(p => p.status === 'Completed').length;
        
        // Populate recent projects table (limit to 5)
        const recentProjects = projects.slice(-5).reverse();
        const tbody = document.getElementById('recentProjectsTable');
        
        if (recentProjects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No projects found. Create one to get started!</td></tr>';
            return;
        }
        
        tbody.innerHTML = recentProjects.map(p => `
            <tr>
                <td class="align-middle fw-medium">${p.name}</td>
                <td class="align-middle">
                    <span class="status-badge status-${p.status.replace(/\s+/g, '')}">
                        ${p.status}
                    </span>
                </td>
                <td class="align-middle text-secondary">${p.creator_name || 'Unknown'}</td>
                <td class="align-middle text-end">
                    <a href="project_detail.html?id=${p.id}" class="btn btn-sm btn-light border shadow-sm">
                        <i class="fa-solid fa-eye text-primary"></i> View
                    </a>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        document.getElementById('recentProjectsTable').innerHTML = 
            `<tr><td colspan="4" class="text-danger text-center py-4">Error loading data. Please try again later.</td></tr>`;
    }
});
