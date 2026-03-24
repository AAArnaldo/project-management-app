document.addEventListener('DOMContentLoaded', async () => {
    await loadKanban();
    setupDragAndDrop();
});

let projectsData = [];

async function loadKanban() {
    try {
        projectsData = await ApiClient.getProjects();
        renderKanban();
    } catch (error) {
        console.error("Error loading projects for Kanban", error);
    }
}

function renderKanban() {
    const cols = {
        'Pending': document.getElementById('cards-Pending'),
        'In Progress': document.getElementById('cards-InProgress'),
        'Completed': document.getElementById('cards-Completed')
    };
    
    Object.values(cols).forEach(c => c.innerHTML = '');
    
    const counts = { 'Pending': 0, 'In Progress': 0, 'Completed': 0 };

    projectsData.forEach(p => {
        let colKey = p.status;
        if (!cols[colKey]) colKey = 'Pending';
        counts[colKey]++;
        
        const card = document.createElement('div');
        card.className = `kanban-card border-${colKey.replace(' ', '')}`;
        card.draggable = true;
        card.dataset.id = p.id;
        card.dataset.status = colKey;
        
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="fw-bold mb-0">${p.name}</h6>
                <a href="project_detail.html?id=${p.id}" class="text-secondary" title="Ver Detalles"><i class="fa-solid fa-eye"></i></a>
            </div>
            <p class="text-secondary small mb-2">${p.description ? p.description.substring(0, 50) + '...' : 'Sin descripción'}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">
                <small class="text-muted"><i class="fa-solid fa-user me-1"></i>${p.creator_name || 'Alguien'}</small>
                <div class="badge bg-light text-dark border">
                    <i class="fa-solid fa-users me-1"></i>${p.assigned_users ? p.assigned_users.length : 0}
                </div>
            </div>
        `;
        
        cols[colKey].appendChild(card);
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    document.getElementById('count-Pending').innerText = counts['Pending'];
    document.getElementById('count-InProgress').innerText = counts['In Progress'];
    document.getElementById('count-Completed').innerText = counts['Completed'];
}

let draggedCard = null;

function handleDragStart(e) {
    draggedCard = this;
    setTimeout(() => this.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedCard = null;
    document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-over'));
}

function setupDragAndDrop() {
    const columns = document.querySelectorAll('.kanban-column');
    
    columns.forEach(col => {
        col.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            col.classList.add('drag-over');
        });
        
        col.addEventListener('dragleave', e => {
            col.classList.remove('drag-over');
        });
        
        col.addEventListener('drop', async e => {
            e.preventDefault();
            col.classList.remove('drag-over');
            
            if (!draggedCard) return;
            
            const newStatus = col.dataset.status;
            const projectId = draggedCard.dataset.id;
            const oldStatus = draggedCard.dataset.status;
            
            if (newStatus !== oldStatus) {
                const cardsContainer = col.querySelector('.kanban-cards');
                cardsContainer.appendChild(draggedCard);
                draggedCard.dataset.status = newStatus;
                draggedCard.className = `kanban-card border-${newStatus.replace(' ', '')}`;
                
                try {
                    await ApiClient.updateProject(projectId, { status: newStatus });
                    await loadKanban(); 
                } catch (error) {
                    alert("Error al actualizar el estado: " + error.message);
                    await loadKanban(); 
                }
            }
        });
    });
}
