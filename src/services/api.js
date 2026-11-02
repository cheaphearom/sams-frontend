import axios from 'axios';

// Backend API, set VITE_API_URL in .env to use another server (e.g. http://localhost:4000/api)
const API_URL = import.meta.env.VITE_API_URL || 'https://sams-backend-bice.vercel.app/api';

// Uploaded images are served from the backend root: <IMAGE_URL>/uploads/...
export const IMAGE_URL = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
});

// send the login token with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sams_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
