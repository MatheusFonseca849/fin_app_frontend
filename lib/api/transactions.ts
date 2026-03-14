import api from './client';

export interface TransactionCategory {
  _id: string;
  name: string;
  color: string;
  type: 'credito' | 'debito';
}

export interface Transaction {
  _id: string;
  userId: string;
  description: string;
  value: number;
  type: 'credito' | 'debito';
  category: TransactionCategory;
  isRecurrent: boolean;
  billingDay?: number;
  isActive: boolean;
  isPaid: boolean;
  lastApplied?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'credito' | 'debito';
  isRecurrent?: boolean;
  isPaid?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface MonthlySummaryItem {
  year: number;
  month: number;
  despesas: number;
  receitas: number;
  saldo: number;
}

export interface CreateTransactionData {
  description: string;
  value: number;
  type: 'credito' | 'debito';
  category: string;
  date?: string;
  isRecurrent?: boolean;
  billingDay?: number;
  isPaid?: boolean;
}

export interface UpdateTransactionData {
  description?: string;
  value?: number;
  type?: 'credito' | 'debito';
  category?: string;
  date?: string;
  isRecurrent?: boolean;
  billingDay?: number;
  isActive?: boolean;
  isPaid?: boolean;
}

export interface ImportResult {
  message: string;
  createdCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
}

export const transactionsApi = {
  getAll: async (filters?: TransactionFilters) => {
    const params: Record<string, string> = {};
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);
    if (filters?.type) params.type = filters.type;
    if (filters?.isRecurrent !== undefined) params.isRecurrent = String(filters.isRecurrent);
    if (filters?.isPaid !== undefined) params.isPaid = String(filters.isPaid);
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const res = await api.get<TransactionsResponse>('/records', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<Transaction>(`/records/${id}`);
    return res.data;
  },

  create: async (data: CreateTransactionData) => {
    const res = await api.post<{ transaction: Transaction; balance: number }>('/records', data);
    return res.data;
  },

  update: async (id: string, data: UpdateTransactionData) => {
    const res = await api.put<{ transaction: Transaction; balance: number }>(`/records/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string; balance: number }>(`/records/${id}`);
    return res.data;
  },

  getMonthlySummary: async (months?: number) => {
    const params: Record<string, string> = {};
    if (months) params.months = String(months);
    const res = await api.get<{ data: MonthlySummaryItem[] }>('/records/monthly-summary', { params });
    return res.data;
  },

  importCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ImportResult>('/records/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
