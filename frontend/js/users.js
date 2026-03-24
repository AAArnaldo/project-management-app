document.addEventListener('DOMContentLoaded', async () => {
    // Security check
    if (localStorage.getItem('role') !== 'Admin') {
        window.location.href = 'dashboard.html';
        return;
    }

    await loadUsersList();

    // Form logic
    const form = document.getElementById('userForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errDiv = document.getElementById('userError');
            errDiv.classList.add('d-none');
            
            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;
            const role = document.getElementById('userRole').value;
            
            try {
                const btn = document.getElementById('btnSaveUser');
                const prev = btn.innerHTML;
                btn.innerHTML = 'Creando...';
                btn.disabled = true;

                await ApiClient.createUser({ name, email, password, role });
                
                // Success
                const modalEl = document.getElementById('userModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                form.reset();
                await loadUsersList();

                btn.innerHTML = prev;
                btn.disabled = false;
            } catch (error) {
                errDiv.textContent = error.message || 'Error al crear el usuario.';
                errDiv.classList.remove('d-none');
                document.getElementById('btnSaveUser').disabled = false;
                document.getElementById('btnSaveUser').innerHTML = 'Crear Usuario';
            }
        });
    }
});

async function loadUsersList() {
    const tbody = document.getElementById('usersTable');
    try {
        const users = await ApiClient.getUsers();
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No hay usuarios.</td></tr>';
            return;
        }

        const roleTranslations = {'Admin': 'Administrador', 'User': 'Usuario'};

        tbody.innerHTML = users.map(u => `
            <tr>
                <td class="fw-medium">
                    <div class="d-flex align-items-center">
                        <div class="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 32px; height: 32px; font-size: 0.8rem;">
                            ${u.name.charAt(0).toUpperCase()}
                        </div>
                        ${u.name}
                    </div>
                </td>
                <td class="text-secondary">${u.email}</td>
                <td>
                    <span class="badge ${u.role === 'Admin' ? 'bg-primary' : 'bg-secondary'}">${roleTranslations[u.role] || u.role}</span>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-danger">Error al cargar listado.</td></tr>`;
    }
}
