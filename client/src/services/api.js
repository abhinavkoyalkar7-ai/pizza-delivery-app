import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach JWT token to requests automatically
API.interceptors.request.use((req) => {
  const user = localStorage.getItem('pizza_user');
  if (user) {
    const token = JSON.parse(user).token;
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;