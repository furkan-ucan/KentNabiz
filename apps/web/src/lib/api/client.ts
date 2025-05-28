import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (Token eklemek için)
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: Error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (Hata yönetimi için)
apiClient.interceptors.response.use(
  response => response,
  (error: { response?: { status?: number } }) => {
    if (error.response?.status === 401) {
      // Token geçersiz, kullanıcıyı logout yap
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(JSON.stringify(error)));
  }
);
