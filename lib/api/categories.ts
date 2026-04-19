import api from './client';
import type { Category } from './auth';

export interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  keywords?: string[];
}

export interface UpdateCategoryData {
  name?: string;
  type?: 'income' | 'expense';
  color?: string;
  keywords?: string[];
}

export const categoriesApi = {
  getAll: async () => {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },

  create: async (data: CreateCategoryData) => {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  },

  update: async (id: string, data: UpdateCategoryData) => {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/categories/${id}`);
    return res.data;
  },
};
