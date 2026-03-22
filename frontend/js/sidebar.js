class Layout {
    static init() {
        // Enforce auth
        if (!ApiClient.getToken()) {
            window.location.href = 'index.html';
            return;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.renderSidebar(user);
        this.renderNavbar(user);
        
        // Setup logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            ApiClient.logout();
        });
    }

    static renderSidebar(user) {
        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
        const isAdmin = user.role === 'Admin';
        
        const sidebarHtml = `
            <div class="sidebar-header border-bottom border-secondary">
                <i class="fa-solid fa-layer-group text-primary fs-3"></i>
                <h4>ProjectMaster</h4>
            </div>
            <ul class="list-unstyled components">
                <li class="${currentPath === 'dashboard.html' ? 'active' : ''}">
                    <a href="dashboard.html"><span class="sidebar-icon"><i class="fa-solid fa-house"></i></span> Dashboard</a>
                </li>
                <li class="${currentPath === 'projects.html' || currentPath.includes('project_detail') ? 'active' : ''}">
                    <a href="projects.html"><span class="sidebar-icon"><i class="fa-solid fa-folder-open"></i></span> Projects</a>
                </li>
                ${isAdmin ? `
                <li class="${currentPath === 'users.html' ? 'active' : ''}">
                    <a href="users.html"><span class="sidebar-icon"><i class="fa-solid fa-users"></i></span> Users</a>
                </li>
                ` : ''}
            </ul>
        `;
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.innerHTML = sidebarHtml;
    }

    static renderNavbar(user) {
        const navbarHtml = `
            <div class="d-flex align-items-center gap-3">
                <span class="text-secondary d-none d-md-inline">Welcome, <strong>${user.name}</strong></span>
                <span class="badge ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'}">${user.role}</span>
            </div>
            <div>
                <button id="logoutBtn" class="btn btn-outline-secondary btn-sm">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            </div>
        `;
        
        const navbar = document.getElementById('topNavbar');
        if (navbar) navbar.innerHTML = navbarHtml;
    }
}
