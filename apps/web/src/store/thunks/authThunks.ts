import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../features/auth/services/authService';
import {
  AuthResponseData,
  LoginRequest,
  RegisterRequest,
} from '@KentNabiz/shared';
import { setCredentials } from '../slices/authSlice';

export const loginUser = createAsyncThunk<
  AuthResponseData, // Başarılı durumda dönecek tip
  LoginRequest, // Thunk'a geçilecek argüman tipi
  { rejectValue: string } // Hata durumunda reject ile dönecek tip
>('auth/loginUser', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const data = await authService.login(credentials);
    dispatch(setCredentials(data)); // Başarılı olunca state'i güncelle
    return data; // Thunk'ın fulfilled payload'ı
  } catch (error: unknown) {
    return rejectWithValue((error as Error).message);
  }
});

export const registerUser = createAsyncThunk<
  AuthResponseData,
  RegisterRequest,
  { rejectValue: string }
>('auth/registerUser', async (userData, { dispatch, rejectWithValue }) => {
  try {
    const data = await authService.register(userData);
    dispatch(setCredentials(data)); // Başarılı olunca state'i güncelle
    return data;
  } catch (error: unknown) {
    return rejectWithValue((error as Error).message);
  }
});

export const getCurrentUserThunk = createAsyncThunk<
  AuthResponseData,
  void,
  { rejectValue: string }
>('auth/getCurrentUser', async (_, { dispatch, rejectWithValue }) => {
  try {
    const data = await authService.getCurrentUser();
    dispatch(setCredentials(data));
    return data;
  } catch (error: unknown) {
    return rejectWithValue((error as Error).message);
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);
