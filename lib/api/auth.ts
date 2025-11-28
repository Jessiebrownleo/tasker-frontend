import apiClient from './client';
import { LoginRequest, RegisterRequest, TokenResponse, User } from '@/types';

export const authApi = {
    // Register new user
    register: async (data: RegisterRequest): Promise<TokenResponse> => {
        const response = await apiClient.post<TokenResponse>('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (data: LoginRequest): Promise<TokenResponse> => {
        const response = await apiClient.post<TokenResponse>('/auth/login', data);
        return response.data;
    },

    // Get current user
    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/users/me');
        return response.data;
    },

    // Logout (client-side only)
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    // Update profile
    updateProfile: async (data: { fullName?: string; password?: string }): Promise<User> => {
        const response = await apiClient.patch<User>('/users/me', data);
        return response.data;
    },
};
