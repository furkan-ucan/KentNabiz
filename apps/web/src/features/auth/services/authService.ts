import { AxiosError } from 'axios';
import apiClient from '../../../lib/api/client'; // apiClient'ın doğru yolunu belirt
import {
  AuthResponseData,
  LoginRequest,
  RegisterRequest,
} from '@KentNabiz/shared'; // Tipleri shared paketten al

const AUTH_BASE_URL = '/auth';

// Axios hata objesi için tip tanımı
interface ApiErrorResponse {
  message?: string;
}

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AxiosError && error.response?.data) {
    const apiError = error.response.data as ApiErrorResponse;
    return apiError.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

export const login = async (
  credentials: LoginRequest
): Promise<AuthResponseData> => {
  try {
    const response = await apiClient.post<AuthResponseData>(
      `${AUTH_BASE_URL}/login`,
      credentials
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(
      error,
      'Giriş sırasında bir hata oluştu.'
    );
    throw new Error(errorMessage);
  }
};

export const register = async (
  userData: RegisterRequest
): Promise<AuthResponseData> => {
  try {
    const response = await apiClient.post<AuthResponseData>(
      `${AUTH_BASE_URL}/register`,
      userData
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(
      error,
      'Kayıt sırasında bir hata oluştu.'
    );
    throw new Error(errorMessage);
  }
};

// Opsiyonel: Eğer varsa token yenileme servisi
// export const refreshToken = async (refreshTokenValue: string): Promise<{ accessToken: string }> => { ... }

// Opsiyonel: Kullanıcı profili getirme servisi
export const getCurrentUser = async (): Promise<AuthResponseData> => {
  try {
    const response = await apiClient.get<AuthResponseData>(
      `${AUTH_BASE_URL}/me`
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(
      error,
      'Kullanıcı bilgileri alınırken hata oluştu.'
    );
    throw new Error(errorMessage);
  }
};

// Opsiyonel: Logout servisi (eğer server-side logout varsa)
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post(`${AUTH_BASE_URL}/logout`);
  } catch (error: unknown) {
    // Logout hatası genellikle kritik değildir, ama log'layabiliriz
    const errorMessage =
      error instanceof Error ? error.message : 'Logout error';
    console.warn('[AuthService] Logout error:', errorMessage);
  }
};
