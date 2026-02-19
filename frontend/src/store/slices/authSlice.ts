import { createSlice } from '@reduxjs/toolkit';
import type { AuthUser } from '../../api/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loaded: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loaded: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: { payload: { user: AuthUser } }) => {
      state.user = action.payload.user;
      state.token = 'cookie';
      state.loaded = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loaded = true;
    },
    setUserFromStorage: (state, action: { payload: AuthUser | null }) => {
      state.user = action.payload;
      state.token = action.payload ? 'cookie' : null;
      state.loaded = true;
    },
  },
});

export const { setAuth, logout, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
