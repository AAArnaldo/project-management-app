const statusTranslations = {
    'Pending': 'Pendiente',
    'In Progress': 'En Progreso',
    'Completed': 'Completado'
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const projects = await ApiClient.getProjects();
        
        // Update Stats
        document.getElementById('totalProjects').textContent = projects.length;
        document.getElementById('inProgressProjects').textContent = projects.filter(p => p.status === 'In Progress').length;
        document.getElementById('completedProjects').textContent = projects.filter(p => p.status === 'Completed').length;
        
        // Load Recent Table
        const tbody = document.getElementById('recentProjectsTable');
        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-secondary">No se encontraron proyectos. ¡Crea uno para empezar!</td></tr>';
            return;
        }

        // Sort by id desc to get newest first, take top 5
        const recent = projects.sort((a,b) => b.id - a.id).slice(0, 5);
        
        tbody.innerHTML = recent.map(p => `
            <tr>
                <td class="fw-medium">${p.name}</td>
                <td><span class="status-badge status-${p.status.replace(' ', '-')}">${statusTranslations[p.status] || p.status}</span></td>
                <td class="text-secondary">${p.creator_name || 'Desconocido'}</td>
                <td class="text-end">
                    <a href="project_detail.html?id=${p.id}" class="btn btn-sm btn-light border">
                        Ver Detalles
                    </a>
                </td>
            </tr>
        `).join('');
        
        // Render Charts
        if (typeof Chart !== 'undefined') {
            renderCharts(projects);
        }
        
    } catch (error) {
        console.error("Dashboard error:", error);
        if (error.message.includes("401")) {
            ApiClient.logout();
        } else {
            const tbody = document.getElementById('recentProjectsTable');
            if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">Error al cargar los datos. Por favor intenta de nuevo.</td></tr>`;
        }
    }
});

function renderCharts(projects) {
    const statusCounts = {
        'Pending': 0,
        'In Progress': 0,
        'Completed': 0
    };
    const creatorCounts = {};

    projects.forEach(p => {
        if(statusCounts[p.status] !== undefined) statusCounts[p.status]++;
        const creator = p.creator_name || 'Desconocido';
        creatorCounts[creator] = (creatorCounts[creator] || 0) + 1;
    });

    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        new Chart(statusCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Pendiente', 'En Progreso', 'Completado'],
                datasets: [{
                    data: [statusCounts['Pending'], statusCounts['In Progress'], statusCounts['Completed']],
                    backgroundColor: ['#ffc107', '#0d6efd', '#198754'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    const creatorCtx = document.getElementById('creatorChart');
    if (creatorCtx) {
        new Chart(creatorCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(creatorCounts),
                datasets: [{
                    label: 'Proyectos',
                    data: Object.values(creatorCounts),
                    backgroundColor: '#6c757d',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
}
