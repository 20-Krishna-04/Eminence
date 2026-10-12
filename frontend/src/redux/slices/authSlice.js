import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('eminence_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
};

const storedUser = getStoredUser();

const initialState = {
  user: storedUser, // { id, name, email, phone, isEmailVerified, isPhoneVerified, isProfileComplete, role }
  isAuthenticated: Boolean(storedUser),
  loading: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthInitialized: (state) => {
      state.isLoading = false;
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload; // Usually from GoogleLogin or Login API
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('eminence_user', JSON.stringify(action.payload));
        }
      } catch (_e) {}
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('eminence_user');
        }
      } catch (_e) {}
    },
    updateProfileSuccess: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('eminence_user', JSON.stringify(state.user));
          }
        } catch (_e) {}
      }
    }
  },
});

export const { setAuthInitialized, loginStart, loginSuccess, loginFailure, logout, updateProfileSuccess } = authSlice.actions;

export default authSlice.reducer;
