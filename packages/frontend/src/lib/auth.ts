import { apiClient } from './api-client';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  register: async (email: string, username: string, password: string) => {
    return apiClient.post<AuthResponse>('/auth/register', {
      email,
      username,
      password,
      confirmPassword: password,
    });
  },

  login: async (email: string, password: string) => {
    return apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
  },

  getMe: async () => {
    return apiClient.get<User>('/auth/me');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },
};
