// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`; // Adjust 'Token' if your back-end uses 'Bearer'
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
