export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
