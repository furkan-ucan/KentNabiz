import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { JwtPayload, AuthResponseData } from '@KentNabiz/shared';
import {
  loginUser,
  registerUser,
  getCurrentUserThunk,
  logoutUser,
} from '../thunks/authThunks';

interface AuthState {
  user: JwtPayload | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined; // createAsyncThunk'tan gelen error undefined olabilir
}

const initialState: AuthState = {
  user: null,
  token:
    typeof window !== 'undefined'
      ? localStorage.getItem('kentNabizToken')
      : null,
  isAuthenticated:
    typeof window !== 'undefined'
      ? !!localStorage.getItem('kentNabizToken')
      : false,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Kullanıcı bilgilerini ve token'ı set eden action (login/register sonrası)
    setCredentials: (state, action: PayloadAction<AuthResponseData>) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('kentNabizToken', accessToken);
      }
      state.status = 'succeeded';
      state.error = null;
    },
    // Logout action'ı
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kentNabizToken');
      }
      state.status = 'idle';
      state.error = null;
      console.log('[AuthSlice] User logged out, token removed.');
    },
    // Hata durumunu temizlemek için bir action (opsiyonel)
    clearAuthError: state => {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      // Login User Thunk
      .addCase(loginUser.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, state => {
        // setCredentials zaten thunk içinde dispatch edildiği için burada sadece status'u güncelleyelim
        state.status = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kentNabizToken');
        }
      })
      // Register User Thunk
      .addCase(registerUser.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, state => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kentNabizToken');
        }
      })
      // Get Current User Thunk
      .addCase(getCurrentUserThunk.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getCurrentUserThunk.fulfilled, state => {
        state.status = 'succeeded';
      })
      .addCase(getCurrentUserThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
        // getCurrentUser hatası genellikle token'ın geçersiz olduğunu gösterir
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kentNabizToken');
        }
      })
      // Logout User Thunk
      .addCase(logoutUser.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kentNabizToken');
        }
        state.status = 'idle';
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Logout hatası olsa bile kullanıcıyı çıkış yapalım
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kentNabizToken');
        }
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setCredentials, logout, clearAuthError } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthStatus = (state: { auth: AuthState }) =>
  state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
