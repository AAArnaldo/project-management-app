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
        if (statusCounts[p.status] !== undefined) statusCounts[p.status]++;
        const creator = p.creator_name || 'Desconocido';
        creatorCounts[creator] = (creatorCounts[creator] || 0) + 1;
    });

    // Detect dark mode
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#374151';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const cardBg = isDark ? '#1e293b' : '#ffffff';

    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        new Chart(statusCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Pendiente', 'En Progreso', 'Completado'],
                datasets: [{
                    data: [statusCounts['Pending'], statusCounts['In Progress'], statusCounts['Completed']],
                    backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                    hoverBackgroundColor: ['#d97706', '#2563eb', '#059669'],
                    borderColor: cardBg,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 16,
                            font: { size: 13 }
                        }
                    }
                },
                layout: { padding: 8 }
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
                    backgroundColor: isDark ? '#6366f1' : '#3b82f6',
                    hoverBackgroundColor: isDark ? '#818cf8' : '#2563eb',
                    borderRadius: 6,
                    maxBarThickness: 70
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        ticks: { color: textColor, font: { size: 12 } },
                        grid: { color: gridColor }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: textColor, font: { size: 12 } },
                        grid: { color: gridColor }
                    }
                },
                layout: { padding: { top: 8, bottom: 8 } }
            }
        });
    }
}
