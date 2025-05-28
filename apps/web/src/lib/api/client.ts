import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API Temel URL'ini environment değişkeninden al
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Temel Axios instance'ını oluştur
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 saniye timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// --- Request Interceptor ---
// Her istek gönderilmeden önce çalışacak olan interceptor.
// Temel görevi, eğer varsa, localStorage'dan JWT token'ı alıp
// isteğin Authorization header'ına 'Bearer token_value' formatında eklemektir.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // localStorage'dan token'ı al
    const token = localStorage.getItem('kentNabizToken'); // Token'ı sakladığınız key

    if (token) {
      // Eğer token varsa, Authorization header'ına ekle
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Client] Token added to request headers.'); // Geliştirme için log
    } else {
      console.log('[API Client] No token found in localStorage.'); // Geliştirme için log
    }
    return config;
  },
  error => {
    // İstek hatası durumunda bir şeyler yap
    console.error('[API Client] Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor (Şimdilik Basit Hata Loglama) ---
// API'den gelen yanıtları işlemek için interceptor.
// Bu aşamada sadece genel hata loglaması yapabiliriz.
// Token yenileme gibi daha karmaşık mantıklar daha sonra eklenecek.
apiClient.interceptors.response.use(
  response => {
    // Başarılı yanıtlar için bir şey yapmaya gerek yok, doğrudan döndür
    return response;
  },
  error => {
    // Yanıt hatası durumunda bir şeyler yap
    console.error(
      '[API Client] Response Interceptor Error:',
      error.response?.data || error.message
    );

    // Örnek: Eğer 401 Unauthorized hatası gelirse ve token yenileme mekanizması yoksa
    // kullanıcıyı logout yapıp login sayfasına yönlendirebiliriz.
    // Bu mantık daha sonra authSlice veya özel bir hook içinde daha iyi yönetilebilir.
    if (error.response?.status === 401) {
      console.warn(
        '[API Client] Received 401 Unauthorized. Token might be invalid or expired.'
      );
      // localStorage.removeItem('kentNabizToken');
      // window.location.href = '/login'; // Doğrudan yönlendirme yerine Redux action'ı tercih edilir.
    }
    return Promise.reject(error);
  }
);

export default apiClient;
