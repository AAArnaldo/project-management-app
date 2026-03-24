const API_BASE_URL = 'https://project-management-app-p7cb.onrender.com/api';

class ApiClient {
    static getToken() {
        return localStorage.getItem('token');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('id');
        window.location.href = 'index.html';
    }

    static async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401 && endpoint !== '/login') {
                this.logout();
                throw new Error('Sesión expirada');
            }

            const data = await response.json().catch(() => ({}));
            
            if (!response.ok) {
                throw new Error(data.message || data.msg || 'Error en la solicitud');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    static get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // --- Semantic Methods required by UI ---

    static async login(email, password) {
        return this.post('/login', { email, password });
    }

    static async getProjects() {
        return this.get('/projects');
    }

    static async getProject(id) {
        return this.get(`/projects/${id}`);
    }

    static async createProject(data) {
        return this.post('/projects', data);
    }

    static async updateProjectStatus(id, status) {
        return this.put(`/projects/${id}/status`, { status });
    }
    
    static async updateProject(id, data) {
        return this.put(`/projects/${id}`, data);
    }

    static async deleteProject(id) {
        return this.delete(`/projects/${id}`);
    }

    static async getUsers() {
        return this.get('/users');
    }

    static async createUser(data) {
        return this.post('/users', data);
    }

    static async updateProfile(data) {
        return this.put('/users/me', data);
    }
    
    static async getNotifications() {
        return this.get('/users/me/notifications');
    }
    
    static async markNotificationRead(id) {
        return this.put(`/notifications/${id}/read`, {});
    }

    static async getProjectTasks(id) { return this.get(`/projects/${id}/tasks`); }
    static async createProjectTask(id, data) { return this.post(`/projects/${id}/tasks`, data); }
    static async updateTask(taskId, data) { return this.put(`/tasks/${taskId}`, data); }
    static async deleteTask(taskId) { return this.delete(`/tasks/${taskId}`); }
    
    static async getProjectComments(id) { return this.get(`/projects/${id}/comments`); }
    static async createProjectComment(id, data) { return this.post(`/projects/${id}/comments`, data); }
}
