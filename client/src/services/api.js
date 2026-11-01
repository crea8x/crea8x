import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('crea8x_user'));
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// ===== AUTH =====
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// ===== USERS =====
export const getUsers = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const getRecommendations = (id) => api.get(`/users/${id}/recommendations`);

// ===== PROJECTS =====
export const getProjects = (params) => api.get('/projects', { params });
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const toggleLike = (id) => api.post(`/projects/${id}/like`);

// ===== AI =====
export const aiGenerateDescription = (data) => api.post('/ai/generate-description', data);
export const aiGenerateBio = (data) => api.post('/ai/generate-bio', data);
export const aiSuggestTags = (data) => api.post('/ai/suggest-tags', data);
export const aiSkillInsights = (data) => api.post('/ai/skill-insights', data);

export default api;
