// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.67:8000/', // Update with your back-end URL
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`; // Adjust based on your back-end authentication
    }
    return config;
  },
  error => Promise.reject(error),
);

export default api;
