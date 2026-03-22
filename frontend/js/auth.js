document.addEventListener('DOMContentLoaded', () => {
    // If we're already logged in, redirect to dashboard
    if (localStorage.getItem('token') && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'dashboard.html';
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorAlert = document.getElementById('loginError');
            const submitBtn = document.getElementById('loginBtn');
            
            try {
                errorAlert.classList.add('d-none');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
                
                const response = await ApiClient.post('/login', { email, password });
                
                // Store token and user data
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Redirect
                window.location.href = 'dashboard.html';
            } catch (error) {
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('d-none');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Sign In';
            }
        });
    }
});
