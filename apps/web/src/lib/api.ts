import axios from 'axios';

// .env dosyasından API URL'sini alacağız, yoksa localhost'u kullanacak.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Önemli: API isteklerine otomatik olarak token eklemek için
// bir "interceptor" (araya girici) ekliyoruz.
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken'); // Token'ı localStorage'dan al
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(new Error(error?.message || 'Request failed'))
);

// Response interceptor - token süresi biterse otomatik refresh veya logout
api.interceptors.response.use(
  response => response,
  async error => {
    console.log('API Error intercepted:', error); // Debug için

    if (error.response?.status === 401) {
      console.log('401 error detected, clearing tokens'); // Debug için
      // Token geçersiz, logout yap
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Eğer şu anda login veya register sayfasında değilsek, login'e yönlendir
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        console.log('Redirecting to login page due to 401'); // Debug için
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(error?.message || 'API request failed'));
  }
);

// API Types - Backend DTO'larıyla uyumlu
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

// Departman ve kategori tipleri
export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  departmentId: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data: T;
}

// TokenResponse'ı ApiResponse ile sarmalıyoruz
export type TokenResponseWrapped = ApiResponse<TokenResponse>;

// API Methods
export const authAPI = {
  login: (data: LoginDto): Promise<{ data: TokenResponse }> => {
    console.log('Login API called with:', data); // Debug için
    return api.post('/auth/login', data);
  },

  register: (data: RegisterDto): Promise<{ data: TokenResponse }> => {
    console.log('Register API called with:', data); // Debug için
    return api.post('/auth/register', data);
  },

  getProfile: (): Promise<{ data: UserProfile }> => api.get('/auth/profile'),

  logout: (): Promise<void> => {
    console.log('Logout called'); // Debug için
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return Promise.resolve();
  },
};

// Departman ve kategori API servisleri
export const departmentService = {
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get<{ data: Department[] }>(
      '/reports/departments'
    );
    return response.data.data;
  },

  getCategoriesByDepartment: async (
    departmentCode: string
  ): Promise<Category[]> => {
    if (!departmentCode) return [];
    const response = await api.get<{ data: Category[] }>(
      `/report-categories?departmentCode=${departmentCode}`
    );
    return response.data.data;
  },
};

// Report type definitions for API
export interface CreateReportRequest {
  title: string;
  description: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  departmentCode: string;
  categoryId: number; // API expects number
  reportMedias?: Array<{
    url: string;
    type: string;
  }>;
}

// Report API servisleri
export const reportService = {
  createReport: async (
    reportData: CreateReportRequest
  ): Promise<{ data: { id: number } }> => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },
};
