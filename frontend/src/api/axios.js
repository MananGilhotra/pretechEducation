import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token and handle FormData
API.interceptors.request.use((config) => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('pretech_user') || 'null');
    } catch (e) {
        localStorage.removeItem('pretech_user');
    }
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    // Let the browser set Content-Type with boundary for FormData
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

// Response interceptor for error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const path = window.location.pathname;
            // Don't redirect if already on auth pages (prevents refresh loop on bad credentials)
            if (path !== '/login' && path !== '/register') {
                localStorage.removeItem('pretech_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
