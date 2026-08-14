import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('lornoir_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';

    if (status === 401) {
      window.localStorage.removeItem('lornoir_token');
    }

    // Let calling code decide whether to surface a toast for expected
    // 4xx validation errors (e.g. login forms); only auto-toast on
    // unexpected server/network failures.
    if (!status || status >= 500) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
