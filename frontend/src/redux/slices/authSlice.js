import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // { id, name, email, phone, isEmailVerified, isPhoneVerified, isProfileComplete, role }
  isAuthenticated: false,
  loading: false,
  isLoading: true,
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
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateProfileSuccess: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
});

export const { setAuthInitialized, loginStart, loginSuccess, loginFailure, logout, updateProfileSuccess } = authSlice.actions;

export default authSlice.reducer;
