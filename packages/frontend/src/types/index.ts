export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
