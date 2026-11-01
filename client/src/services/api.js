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

// Project Milestones
export const addProjectMilestone = (id, data) => api.post(`/projects/${id}/milestones`, data);
export const toggleProjectMilestone = (id, milestoneId) => api.put(`/projects/${id}/milestones/${milestoneId}/toggle`);
export const deleteProjectMilestone = (id, milestoneId) => api.delete(`/projects/${id}/milestones/${milestoneId}`);

// Project Comments (Q&A)
export const getProjectComments = (id) => api.get(`/projects/${id}/comments`);
export const addProjectComment = (id, data) => api.post(`/projects/${id}/comments`, data);
export const deleteProjectComment = (id, commentId) => api.delete(`/projects/${id}/comments/${commentId}`);

// ===== APPLICATIONS (COLLABORATION) =====
export const applyToProject = (projectId, data) => api.post(`/applications/apply/${projectId}`, data);
export const getProjectApplications = (projectId) => api.get(`/applications/project/${projectId}`);
export const updateApplicationStatus = (id, data) => api.put(`/applications/${id}/status`, data);
export const getMyApplications = () => api.get('/applications/my');

// ===== NOTIFICATIONS =====
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

// ===== AI =====
export const aiArchitectIdea = (data) => api.post('/ai/architect-idea', data);
export const aiGenerateDescription = (data) => api.post('/ai/generate-description', data);
export const aiGenerateBio = (data) => api.post('/ai/generate-bio', data);
export const aiSuggestTags = (data) => api.post('/ai/suggest-tags', data);
export const aiSkillInsights = (data) => api.post('/ai/skill-insights', data);

export default api;
