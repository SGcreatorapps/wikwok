import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

export const videoAPI = {
  upload: (formData) => api.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getFeed: (cursor, limit = 5) => api.get('/videos/feed', { params: { cursor, limit } }),
  getVideo: (id) => api.get(`/videos/${id}`),
  like: (id) => api.post(`/videos/${id}/like`),
  checkLike: (id) => api.get(`/videos/${id}/like-status`),
  addComment: (id, text) => api.post(`/videos/${id}/comments`, { text }),
  getComments: (id, cursor) => api.get(`/videos/${id}/comments`, { params: { cursor } })
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  getUser: (username) => api.get(`/users/${username}`),
  follow: (id) => api.post(`/users/${id}/follow`),
  updateProfile: (formData) => api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;
