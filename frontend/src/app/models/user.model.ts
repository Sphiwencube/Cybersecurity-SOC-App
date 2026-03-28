export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: 'VIEWER' | 'ANALYST';
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  firstName: string;
  lastName: string;
}