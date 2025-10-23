import axiosInstance from './axios';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth.types';

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await axiosInstance.post<User>('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },
};
