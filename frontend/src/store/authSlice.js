import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, logoutUser, getProfile, registerUser } from '../api/authApi';
import { setTokens, clearTokens } from '../utils/tokenStorage';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await loginUser(credentials);
      setTokens(data.access, data.refresh);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Login failed' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await registerUser(userData);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Registration failed' });
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getProfile();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutUser();
  } finally {
    clearTokens();
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    profile: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.profile = null;
        state.user = null;
        state.isAuthenticated = false;
        clearTokens();
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
