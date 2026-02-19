import { createSlice } from '@reduxjs/toolkit';
import type { AuthUser } from '../../api/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loaded: boolean;
}

const token = localStorage.getItem('token');
const initialState: AuthState = {
  user: null,
  token,
  loaded: !token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: { payload: { user: AuthUser; token: string } }) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loaded = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loaded = true;
      localStorage.removeItem('token');
    },
    setUserFromStorage: (state, action: { payload: AuthUser | null }) => {
      state.user = action.payload;
      state.loaded = true;
    },
  },
});

export const { setAuth, logout, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
