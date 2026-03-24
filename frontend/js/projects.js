const statusTranslations = {
    'Pending': 'Pendiente',
    'In Progress': 'En Progreso',
    'Completed': 'Completado'
};

let globalProjects = [];

document.addEventListener('DOMContentLoaded', async () => {
    const role = localStorage.getItem('role');
    const isEditing = role === 'Admin';
    
    // UI elements
    const btnCreate = document.getElementById('btnCreateProject');
    if (isEditing) {
        btnCreate.style.display = 'block';
        loadUsersForDropdown();
    }
    
    await loadTable();

    // Filters and Export listeners
    const searchInput = document.getElementById('searchProject');
    const filterStatus = document.getElementById('filterStatus');
    const btnExport = document.getElementById('btnExportCSV');

    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }
    if (filterStatus) {
        filterStatus.addEventListener('change', renderTable);
    }
    if (btnExport) {
        btnExport.addEventListener('click', exportToCSV);
    }

    // Form logic
    const form = document.getElementById('projectForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errDiv = document.getElementById('projectError');
            errDiv.classList.add('d-none');
            
            const name = document.getElementById('projectName').value;
            const description = document.getElementById('projectDescription').value;
            const status = document.getElementById('projectStatus').value;
            
            // Get selected user IDs
            const selectEl = document.getElementById('projectUsers');
            const assigned_users = Array.from(selectEl.selectedOptions).map(opt => parseInt(opt.value));
            
            try {
                const btn = document.getElementById('btnSaveProject');
                const prev = btn.innerHTML;
                btn.innerHTML = 'Guardando...';
                btn.disabled = true;

                await ApiClient.createProject({ name, description, status, assigned_users });
                
                // Success: hide modal, reload table
                const modalEl = document.getElementById('projectModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                form.reset();
                await loadTable();

                btn.innerHTML = prev;
                btn.disabled = false;
            } catch (error) {
                errDiv.textContent = error.message || 'Error al crear el proyecto.';
                errDiv.classList.remove('d-none');
                document.getElementById('btnSaveProject').disabled = false;
                document.getElementById('btnSaveProject').innerHTML = 'Crear Proyecto';
            }
        });
    }
});

async function loadTable() {
    const tbody = document.getElementById('projectsTable');
    try {
        globalProjects = await ApiClient.getProjects();
        renderTable();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Error al cargar proyectos.</td></tr>`;
    }
}

function renderTable() {
    const tbody = document.getElementById('projectsTable');
    if (!tbody || !globalProjects) return;

    const searchTerm = (document.getElementById('searchProject')?.value || '').toLowerCase();
    const statusTerm = document.getElementById('filterStatus')?.value || 'All';

    const filtered = globalProjects.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm);
        const matchStatus = statusTerm === 'All' || p.status === statusTerm;
        return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-secondary">No se encontraron proyectos con los filtros aplicados.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const displayStatus = statusTranslations[p.status] || p.status;
        return `
        <tr>
            <td class="fw-medium">${p.name}</td>
            <td><span class="status-badge status-${p.status.replace(' ', '-')}">${displayStatus}</span></td>
            <td class="text-secondary">${p.creator_name || 'Desconocido'}</td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fa-solid fa-users text-secondary me-2"></i>
                    ${p.assigned_users ? p.assigned_users.length : 0}
                </div>
            </td>
            <td class="text-end">
                <a href="project_detail.html?id=${p.id}" class="btn btn-sm btn-light border">
                    <i class="fa-solid fa-eye me-1"></i>Ver
                </a>
            </td>
        </tr>
    `}).join('');
}

function exportToCSV() {
    const searchTerm = (document.getElementById('searchProject')?.value || '').toLowerCase();
    const statusTerm = document.getElementById('filterStatus')?.value || 'All';

    const filtered = globalProjects.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm);
        const matchStatus = statusTerm === 'All' || p.status === statusTerm;
        return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const headers = ["ID", "Nombre", "Descripción", "Estado", "Creador", "Fecha Creación"];
    const rows = filtered.map(p => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        statusTranslations[p.status] || p.status,
        `"${p.creator_name || ''}"`,
        p.created_at || ''
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "proyectos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


async function loadUsersForDropdown() {
    try {
        const users = await ApiClient.getUsers();
        const select = document.getElementById('projectUsers');
        select.innerHTML = users.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('');
    } catch (error) {
        document.getElementById('projectUsers').innerHTML = '<option disabled>Error cargando usuarios</option>';
    }
}
