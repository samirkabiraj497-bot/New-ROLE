import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchProducts = (query) => api.get(`/products/search?q=${query}`);
export const getProduct = (id) => api.get(`/products/${id}`);
export const getComparison = (id) => api.get(`/comparisons/${id}/compare`);
export const getQualityAnalysis = (id) => api.get(`/comparisons/${id}/quality`);
export const getRecommendations = (data) => api.post(`/comparisons/recommendations`, data);

export const login = (credentials) => api.post(`/auth/login`, credentials);
export const register = (userData) => api.post(`/auth/register`, userData);

export default api;
