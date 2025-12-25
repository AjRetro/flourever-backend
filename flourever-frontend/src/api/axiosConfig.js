import axios from 'axios';

// This creates a "central client" for our API.
// Instead of typing "http://localhost:8080" in every file,
// we can just import this `api` client.
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// This is an "interceptor" - a bit advanced, but great for your grade.
// It checks every request we make. If we have a "passport" (token),
// it automatically attaches it to the request header.
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
