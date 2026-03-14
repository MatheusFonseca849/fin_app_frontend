import api from './client';
import type { User, UserPreferences } from './auth';

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  preferences?: Partial<UserPreferences>;
}

export const usersApi = {
  getMe: async () => {
    const res = await api.get<User>('/users/me');
    return res.data;
  },

  update: async (userId: string, data: UpdateUserData) => {
    const res = await api.put<User>(`/users/${userId}`, data);
    return res.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.put<{ avatarUrl: string }>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getBalance: async () => {
    const res = await api.get<{ balance: number }>('/users/balance');
    return res.data;
  },

  setBalance: async (balanceInCents: number) => {
    const res = await api.put<{ balance: number }>('/users/balance', { balance: balanceInCents });
    return res.data;
  },

  delete: async (userId: string) => {
    const res = await api.delete<{ message: string }>(`/users/${userId}`);
    return res.data;
  },
};
