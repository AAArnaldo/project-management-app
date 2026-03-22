document.addEventListener('DOMContentLoaded', async () => {
    Layout.init();
    
    // Redirect non-admins
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'Admin') {
        window.location.href = 'dashboard.html';
        return;
    }
    
    await loadUsers();

    const form = document.getElementById('userForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('btnSaveUser');
            const errorAlert = document.getElementById('userError');
            btn.disabled = true;
            errorAlert.classList.add('d-none');
            
            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;
            const role = document.getElementById('userRole').value;
            
            try {
                await ApiClient.post('/users', { name, email, password, role });
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
                modal.hide();
                form.reset();
                await loadUsers();
                
            } catch (error) {
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('d-none');
            } finally {
                btn.disabled = false;
            }
        });
    }
});

async function loadUsers() {
    try {
        const users = await ApiClient.get('/users');
        const tbody = document.getElementById('usersTable');
        
        tbody.innerHTML = users.map(u => `
            <tr>
                <td class="align-middle fw-medium">
                    <div class="d-flex align-items-center">
                        <div class="bg-secondary bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px">
                            <i class="fa-solid fa-user text-secondary"></i>
                        </div>
                        ${u.name}
                    </div>
                </td>
                <td class="align-middle text-secondary">${u.email}</td>
                <td class="align-middle">
                    <span class="badge ${u.role === 'Admin' ? 'bg-danger' : 'bg-primary'}">${u.role}</span>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        document.getElementById('usersTable').innerHTML = 
            `<tr><td colspan="3" class="text-danger text-center py-4">Error loading data.</td></tr>`;
    }
}
