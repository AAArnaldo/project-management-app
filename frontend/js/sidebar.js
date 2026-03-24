function loadSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const userRole = localStorage.getItem('role') || 'User';
    const userName = localStorage.getItem('name') || 'Usuario';
    const currentPath = window.location.pathname;
    
    // Logo and Name
    let html = `
        <div class="sidebar-header border-bottom border-secondary d-flex align-items-center">
            <img src="logo.png" alt="RaMa Logo" style="width: 36px; height: 36px; object-fit: contain; border-radius: 8px;">
            <h5 class="mb-0 fw-bold ms-3" style="line-height:1.2;">RaMa<br><small class="text-secondary fw-normal" style="font-size:0.75rem;">Proyect Master</small></h5>
        </div>
        
        <div class="px-3 py-3 border-bottom border-secondary">
            <a href="profile.html" class="text-decoration-none d-flex align-items-center sidebar-profile-link px-2 py-1 rounded">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px; font-weight: bold;">
                    ${userName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h6 class="mb-0 text-white">${userName}</h6>
                    <small class="text-secondary">${userRole}</small>
                </div>
            </a>
        </div>

        <ul class="list-unstyled components mt-3">
            <li class="${currentPath.includes('dashboard') ? 'active' : ''}">
                <a href="dashboard.html"><i class="fa-solid fa-chart-line me-3"></i> Panel Principal</a>
            </li>
            <li class="${currentPath.includes('kanban') ? 'active' : ''}">
                <a href="kanban.html"><i class="fa-solid fa-columns me-3"></i> Kanban</a>
            </li>
            <li class="${currentPath.includes('project') ? 'active' : ''}">
                <a href="projects.html"><i class="fa-solid fa-folder-open me-3"></i> Proyectos</a>
            </li>
    `;

    // Admin only links
    if (userRole === 'Admin') {
        html += `
            <li class="${currentPath.includes('users') ? 'active' : ''}">
                <a href="users.html"><i class="fa-solid fa-users me-3"></i> Usuarios</a>
            </li>
        `;
    }

    html += `
        </ul>
    `;
    
    sidebar.innerHTML = html;
}

function loadNavbar() {
    const navbar = document.getElementById('topNavbar');
    if (!navbar) return;
    
    navbar.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <button type="button" id="sidebarCollapse" class="btn btn-outline-secondary d-md-none me-2">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>
        <div class="d-flex ms-auto align-items-center gap-3">
            <div class="dropdown">
                <button class="btn btn-link text-secondary p-0 position-relative" type="button" id="notifDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-bell fs-5"></i>
                    <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle d-none" id="notifBadge">
                        <span class="visually-hidden">Nuevas alertas</span>
                    </span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="notifDropdown" id="notifMenu" style="width: 320px; max-height: 400px; overflow-y: auto;">
                    <li><div class="dropdown-item text-center text-secondary small py-2">Cargando...</div></li>
                </ul>
            </div>
            <button class="btn btn-link text-secondary p-0" id="btnDarkMode" title="Alternar Tema">
                <i class="fa-solid fa-moon fs-5" id="darkModeIcon"></i>
            </button>
            <button class="btn btn-outline-danger" id="btnLogout">
                <i class="fa-solid fa-right-from-bracket me-1"></i><span class="d-none d-sm-inline">Cerrar Sesión</span>
            </button>
        </div>
    `;

    // Setup logout listener
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            ApiClient.logout();
        });
    }

    // Setup dark mode listener
    const btnDarkMode = document.getElementById('btnDarkMode');
    const darkModeIcon = document.getElementById('darkModeIcon');
    
    if (btnDarkMode) {
        btnDarkMode.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            if (newTheme === 'dark') {
                darkModeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                darkModeIcon.classList.replace('fa-sun', 'fa-moon');
            }
        });
    }

    // Setup sidebar collapse toggle for mobile
    const sidebarBtn = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarBtn && sidebar) {
        // Create overlay element
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }
        
        sidebarBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Load Notifications
    loadNotificationsLogic();
}

async function loadNotificationsLogic() {
    try {
        const notifs = await ApiClient.getNotifications();
        const menu = document.getElementById('notifMenu');
        const badge = document.getElementById('notifBadge');
        
        const unread = notifs.filter(n => !n.is_read);
        if (unread.length > 0) {
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
        
        if (notifs.length === 0) {
            menu.innerHTML = '<li><div class="dropdown-item text-center text-secondary small py-4">No tienes notificaciones.</div></li>';
            return;
        }
        
        menu.innerHTML = notifs.map(n => `
            <li>
                <div class="dropdown-item py-2 border-bottom ${n.is_read ? 'text-secondary' : 'fw-bold bg-light'} d-flex justify-content-between align-items-start" style="white-space: normal; cursor: ${n.is_read ? 'default': 'pointer'}" data-id="${n.id}" data-unread="${!n.is_read}">
                    <div class="small">
                        <div class="d-flex align-items-center mb-1">
                            <i class="fa-solid fa-circle-info text-primary me-2"></i>
                            <span style="font-size: 0.75rem" class="text-muted">${new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        <div>${n.message}</div>
                    </div>
                </div>
            </li>
        `).join('') + `<li><div class="dropdown-item text-center text-primary small py-2 fw-medium" style="cursor:default;">Fin de notificaciones</div></li>`;
        
        // Add click listeners to mark as read
        menu.querySelectorAll('.dropdown-item[data-unread="true"]').forEach(el => {
            el.addEventListener('click', async (e) => {
                e.stopPropagation(); // Keep dropdown open
                const id = el.dataset.id;
                try {
                    await ApiClient.markNotificationRead(id);
                    el.classList.remove('fw-bold', 'bg-light');
                    el.classList.add('text-secondary');
                    el.dataset.unread = "false";
                    
                    // Update badge speculatively
                    const remainingUnread = Array.from(menu.querySelectorAll('.dropdown-item[data-unread="true"]')).length;
                    if (remainingUnread === 0) {
                        badge.classList.add('d-none');
                    }
                } catch(err) {
                    console.error("Failed to mark notification read", err);
                }
            });
        });
        
    } catch (e) {
        console.error("Error loading notifications", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial theme setup
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Check auth on protected pages
    if (!ApiClient.isAuthenticated() && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
        return;
    }

    loadSidebar();
    loadNavbar();

    // Update icon if navbar is loaded and theme is dark
    const darkModeIcon = document.getElementById('darkModeIcon');
    if (darkModeIcon && savedTheme === 'dark') {
        darkModeIcon.classList.replace('fa-moon', 'fa-sun');
    }
});
