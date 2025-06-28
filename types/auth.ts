export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string; // Optional for security - not always returned
  phone_number?: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

export interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  isAuthenticated: boolean;
} 