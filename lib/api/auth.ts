import api, { setAccessToken } from './client';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  pendingEmail?: string | null;
  avatarUrl: string | null;
  role: 'user' | 'admin';
  isVerified: boolean;
  balance: number;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  type: 'credito' | 'debito';
  color: string;
  keywords: string[];
}

export interface UserPreferences {
  darkMode: boolean;
  language: 'pt-BR' | 'en-US' | 'es-MX';
  currency: 'BRL' | 'USD' | 'MXN';
  allowForeignCurrency: boolean;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const res = await api.post<{ message: string }>('/users/register', data);
    return res.data;
  },

  login: async (data: LoginData) => {
    const res = await api.post<LoginResponse>('/users/login', data);
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  logout: async () => {
    const res = await api.post<{ message: string }>('/users/logout');
    setAccessToken(null);
    return res.data;
  },

  refresh: async () => {
    const res = await api.post<{ accessToken: string }>('/users/refresh');
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  verifyEmail: async (token: string, email: string) => {
    const res = await api.post<{ message: string }>('/users/verify-email', { token, email });
    return res.data;
  },

  resendVerification: async (email: string) => {
    const res = await api.post<{ message: string }>('/users/resend-verification', { email });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post<{ message: string }>('/users/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const res = await api.post<{ message: string }>('/users/reset-password', data);
    return res.data;
  },

  verifyEmailChange: async (token: string, email: string) => {
    const res = await api.post<{ message: string }>('/users/verify-email-change', { token, email });
    return res.data;
  },
};
