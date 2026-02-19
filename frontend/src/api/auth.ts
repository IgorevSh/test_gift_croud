import api from './client';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  register: (email: string, password: string, displayName?: string) =>
    api.post<AuthResult>('/auth/register', { email, password, displayName }),

  login: (email: string, password: string) =>
    api.post<AuthResult>('/auth/login', { email, password }),
};
