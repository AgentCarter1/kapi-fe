import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import type { Workspace } from '../../api/endpoints/workspaces';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  currentWorkspace: Workspace | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  currentWorkspace: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string; user?: User }>
    ) => {
      const { accessToken, refreshToken, user } = action.payload;
      
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      
      if (user) {
        state.user = user;
      }
      
      // Persist to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    
    setCurrentWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.currentWorkspace = action.payload;
    },
    
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.currentWorkspace = null;
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, setUser, setCurrentWorkspace, logout } = authSlice.actions;
export default authSlice.reducer;

