import api from './client';

export interface TransactionCategory {
  _id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  _id: string;
  userId: string;
  description: string;
  value: number;
  type: 'income' | 'expense';
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
  type?: 'income' | 'expense';
  category?: string;
  isRecurrent?: boolean;
  isPaid?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface MonthlySummaryItem {
  year: number;
  month: number;
  expenses: number;
  income: number;
  balance: number;
}

export interface CreateTransactionData {
  description: string;
  value: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  isRecurrent?: boolean;
  billingDay?: number;
  isPaid?: boolean;
}

export interface UpdateTransactionData {
  description?: string;
  value?: number;
  type?: 'income' | 'expense';
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
  balance?: number;
}

export interface BankOption {
  key: string;
  label: string;
}

export interface ImportPreviewRow {
  rowIndex: number;
  description: string;
  value: number;
  valueCents: number;
  type: 'income' | 'expense';
  categoryId: string;
  categoryName: string;
  date: string;
  timestamp: string;
  isPaid: boolean;
}

export interface ImportPreviewResponse {
  rows: ImportPreviewRow[];
  errors: string[];
  headers: string[];
}

export interface ImportConfirmTransaction {
  description: string;
  value: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: string;
  isPaid: boolean;
}

export interface CustomMapping {
  columns: {
    date: string;
    value: string;
    description: string;
  };
  keywordTarget?: string;
  dateFormat?: string;
  valueSigned?: boolean;
  separator?: string;
}

export interface DashboardData {
  monthlyExpenses: number;
  monthlyIncome: number;
  monthlyBalance: number;
  expensesByCategory: { name: string; color: string; value: number }[];
  upcomingExpenses: Transaction[];
}

export interface BulkActionResult {
  message: string;
  deletedCount?: number;
  updatedCount?: number;
  balance: number;
}

export interface BulkUpdateData {
  description?: string;
  value?: number;
  type?: 'income' | 'expense';
  category?: string;
  date?: string;
  isPaid?: boolean;
  isRecurrent?: boolean;
  billingDay?: number;
}

export const transactionsApi = {
  getAll: async (filters?: TransactionFilters) => {
    const params: Record<string, string> = {};
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);
    if (filters?.type) params.type = filters.type;
    if (filters?.category) params.category = filters.category;
    if (filters?.isRecurrent !== undefined) params.isRecurrent = String(filters.isRecurrent);
    if (filters?.isPaid !== undefined) params.isPaid = String(filters.isPaid);
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const res = await api.get<TransactionsResponse>('/records', { params });
    return res.data;
  },

  getCalendar: async (startDate: string, endDate: string) => {
    const res = await api.get<{ data: Transaction[] }>('/records/calendar', {
      params: { startDate, endDate },
    });
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

  getDashboard: async () => {
    const res = await api.get<DashboardData>('/records/dashboard');
    return res.data;
  },

  getBankOptions: async () => {
    const res = await api.get<BankOption[]>('/records/import/banks');
    return res.data;
  },

  importPreview: async (file: File, bankKey: string, customMapping?: CustomMapping) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bankKey', bankKey);
    if (customMapping) {
      formData.append('customMapping', JSON.stringify(customMapping));
    }
    const res = await api.post<ImportPreviewResponse>('/records/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  importConfirm: async (transactions: ImportConfirmTransaction[]) => {
    const res = await api.post<ImportResult>('/records/import/confirm', { transactions });
    return res.data;
  },

  bulkDelete: async (ids: string[]) => {
    const res = await api.post<BulkActionResult>('/records/bulk-delete', { ids });
    return res.data;
  },

  bulkUpdate: async (ids: string[], updates: BulkUpdateData) => {
    const res = await api.post<BulkActionResult>('/records/bulk-update', { ids, updates });
    return res.data;
  },
};
