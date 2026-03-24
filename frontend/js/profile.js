document.addEventListener('DOMContentLoaded', () => {
    const currentName = localStorage.getItem('name');
    document.getElementById('profileName').value = currentName || '';
    
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('profileName').value;
        const password = document.getElementById('profilePassword').value;
        const btn = document.getElementById('btnUpdateProfile');
        const msg = document.getElementById('profileMsg');
        
        const payload = {};
        if (name) payload.name = name;
        if (password) payload.password = password;
        
        try {
            btn.disabled = true;
            btn.textContent = 'Guardando...';
            
            const res = await ApiClient.updateProfile(payload);
            localStorage.setItem('name', res.user.name);
            
            msg.classList.remove('d-none', 'text-danger');
            msg.classList.add('text-success');
            msg.textContent = 'Perfil actualizado exitosamente.';
            
            document.getElementById('profilePassword').value = '';
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            msg.classList.remove('d-none', 'text-success');
            msg.classList.add('text-danger');
            msg.textContent = error.message || 'Error al actualizar';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Guardar Cambios';
        }
    });
});
