document.addEventListener('DOMContentLoaded', () => {
    // If we're on index.html and already logged in, redirect to dashboard
    if (ApiClient.isAuthenticated() && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'dashboard.html';
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            const btn = document.getElementById('loginBtn');
            
            try {
                // UI state
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Iniciando sesión...';
                errorDiv.classList.add('d-none');
                
                const response = await ApiClient.login(email, password);
                
                // Save auth info
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.user.role);
                localStorage.setItem('name', response.user.name);
                localStorage.setItem('id', response.user.id);
                
                // Redirect
                window.location.href = 'dashboard.html';
                
            } catch (error) {
                errorDiv.textContent = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
                errorDiv.classList.remove('d-none');
                btn.disabled = false;
                btn.textContent = 'Ingresar';
            }
        });
    }
});
