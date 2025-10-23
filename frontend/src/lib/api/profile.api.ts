import axiosInstance from './axios';
import { UserProfile, UserProfileCreate, UserProfileUpdate } from '@/types/profile.types';

export const profileApi = {
  // Get current user's profile
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get<UserProfile>('/profile/me');
    return response.data;
  },

  // Create/Update profile (POST)
  createProfile: async (data: UserProfileCreate): Promise<UserProfile> => {
    const response = await axiosInstance.post<UserProfile>('/profile/me', data);
    return response.data;
  },

  // Update profile (PUT)
  updateProfile: async (data: UserProfileUpdate): Promise<UserProfile> => {
    const response = await axiosInstance.put<UserProfile>('/profile/me', data);
    return response.data;
  },

  // Partial update profile (PATCH)
  partialUpdateProfile: async (data: UserProfileUpdate): Promise<UserProfile> => {
    const response = await axiosInstance.patch<UserProfile>('/profile/me', data);
    return response.data;
  },
};
