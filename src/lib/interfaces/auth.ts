export interface AuthToken {
  userType: 'buyer' | 'seller' | null;
  token: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  userType: 'buyer' | 'seller' | null;
  token: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'buyer' | 'seller';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  userType?: 'buyer' | 'seller';
  error?: string;
}

