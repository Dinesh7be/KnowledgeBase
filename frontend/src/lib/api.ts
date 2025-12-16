import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const auth = {
    register: (email: string, password: string) =>
        api.post('/api/auth/register', { email, password }),
    initiateRegister: (email: string, password: string) =>
        api.post('/api/auth/register/initiate', { email, password }),
    verifyOTP: (email: string, otp: string) =>
        api.post('/api/auth/register/verify', { email, otp }),
    resendOTP: (email: string, type: 'register' | 'login') =>
        api.post('/api/auth/resend-otp', { email, type }),
    login: (email: string, password: string) =>
        api.post('/api/auth/login', { email, password }),
    googleAuth: (googleId: string, email: string) =>
        api.post('/api/auth/google', { googleId, email }),
    me: () => api.get('/api/auth/me'),
    forgotPassword: (email: string) =>
        api.post('/api/auth/forgot-password', { email }),
    resetPassword: (email: string, otp: string, newPassword: string) =>
        api.post('/api/auth/reset-password', { email, otp, newPassword }),
};

// Documents
export const documents = {
    list: () => api.get('/api/documents'),
    get: (id: string) => api.get(`/api/documents/${id}`),
    delete: (id: string) => api.delete(`/api/documents/${id}`),
    stats: () => api.get('/api/documents/stats'),
    upload: (file: File, category?: string, version?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (category) formData.append('category', category);
        if (version) formData.append('version', version);
        return api.post('/api/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Chat
export const chat = {
    send: (question: string, sessionId?: string) =>
        api.post('/api/chat', { question, sessionId }),
    createSession: () =>
        api.post('/api/chat/sessions'),
    getSessions: () =>
        api.get('/api/chat/sessions'),
    getSession: (id: string) =>
        api.get(`/api/chat/sessions/${id}`),
};

// Logs
export const logs = {
    list: (page?: number, limit?: number) =>
        api.get('/api/logs', { params: { page, limit } }),
    get: (id: string) => api.get(`/api/logs/${id}`),
    delete: (id: string) => api.delete(`/api/logs/${id}`),
    clear: () => api.delete('/api/logs'),
};

// Settings
export const settings = {
    get: () => api.get('/api/settings'),
    update: (data: Record<string, any>) => api.put('/api/settings', data),
    clearVectors: () => api.post('/api/settings/clear-vectors'),
};

// Health
export const health = {
    check: () => api.get('/api/health'),
};

export default api;
