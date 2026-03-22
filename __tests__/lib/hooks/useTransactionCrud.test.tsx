import { renderHook, act } from '@testing-library/react';
import { useTransactionCrud } from '@/lib/hooks/useTransactionCrud';
import { transactionsApi } from '@/lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCategories } from '@/lib/contexts/CategoriesContext';
import type { Transaction, TransactionCategory } from '@/lib/api/transactions';

// ── Mocks ──────────────────────────────────────────────

jest.mock('@/lib/api', () => ({
  transactionsApi: {
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/contexts/CategoriesContext', () => ({
  useCategories: jest.fn(),
}));

// Mock window.dispatchEvent to prevent jsdom errors
const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);

const mockTransactionsApi = transactionsApi as jest.Mocked<typeof transactionsApi>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseCategories = useCategories as jest.Mock;

// ── Helpers ────────────────────────────────────────────

const mockCategory: TransactionCategory = {
  _id: 'cat-1',
  name: 'Alimentação',
  color: '#FF6B6B',
  type: 'debito',
};

const mockCreditCategory: TransactionCategory = {
  _id: 'cat-2',
  name: 'Salário',
  color: '#82E0AA',
  type: 'credito',
};

const mockTransaction: Transaction = {
  _id: 'tx-1',
  userId: 'user-1',
  description: 'Almoço',
  value: 2500,
  type: 'debito',
  category: mockCategory,
  isRecurrent: false,
  isActive: true,
  isPaid: false,
  timestamp: '2024-06-15T12:00:00.000Z',
  createdAt: '2024-06-15T12:00:00.000Z',
  updatedAt: '2024-06-15T12:00:00.000Z',
};

const patchUser = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  dispatchEventSpy.mockClear();
  mockUseAuth.mockReturnValue({ patchUser });
  mockUseCategories.mockReturnValue({
    categories: [mockCategory, mockCreditCategory],
  });
});

// ── Tests ──────────────────────────────────────────────
// The hook returns a nested API: { edit, del, payment }

describe('useTransactionCrud', () => {
  describe('edit flow', () => {
    it('should open edit modal with transaction data', () => {
      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.edit.open(mockTransaction);
      });

      expect(result.current.edit.isOpen).toBe(true);
      expect(result.current.edit.transaction).toEqual(mockTransaction);
      expect(result.current.edit.form.description).toBe('Almoço');
      expect(result.current.edit.form.value).toBe('25.00');
    });

    it('should close edit modal', () => {
      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.edit.open(mockTransaction);
      });
      act(() => {
        result.current.edit.close();
      });

      expect(result.current.edit.isOpen).toBe(false);
      expect(result.current.edit.transaction).toBeNull();
    });

    it('should save edit and update balance', async () => {
      const updatedTx = { ...mockTransaction, description: 'Jantar', isPaid: true };
      mockTransactionsApi.update.mockResolvedValue({
        transaction: updatedTx,
        balance: -2500,
      });

      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.edit.open(mockTransaction);
      });

      await act(async () => {
        await result.current.edit.save();
      });

      expect(mockTransactionsApi.update).toHaveBeenCalledWith(
        'tx-1',
        expect.any(Object)
      );
      expect(patchUser).toHaveBeenCalledWith({ balance: -2500 });
      expect(result.current.edit.isOpen).toBe(false);
    });
  });

  describe('delete flow', () => {
    it('should open delete dialog', () => {
      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.del.open(mockTransaction);
      });

      expect(result.current.del.isOpen).toBe(true);
      expect(result.current.del.transaction).toEqual(mockTransaction);
    });

    it('should close delete dialog', () => {
      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.del.open(mockTransaction);
      });
      act(() => {
        result.current.del.close();
      });

      expect(result.current.del.isOpen).toBe(false);
    });

    it('should delete and adjust balance', async () => {
      mockTransactionsApi.delete.mockResolvedValue({
        message: 'Deleted',
        balance: 0,
      });

      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.del.open({ ...mockTransaction, isPaid: true });
      });

      await act(async () => {
        await result.current.del.confirm();
      });

      expect(mockTransactionsApi.delete).toHaveBeenCalledWith('tx-1');
      expect(patchUser).toHaveBeenCalledWith({ balance: 0 });
      expect(result.current.del.isOpen).toBe(false);
    });
  });

  describe('payment flow', () => {
    it('should open payment dialog for unpaid transactions', () => {
      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.payment.open(mockTransaction);
      });

      expect(result.current.payment.isOpen).toBe(true);
      expect(result.current.payment.transaction).toEqual(mockTransaction);
    });

    it('should mark transaction as paid and adjust balance', async () => {
      mockTransactionsApi.update.mockResolvedValue({
        transaction: { ...mockTransaction, isPaid: true },
        balance: -2500,
      });

      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.payment.open(mockTransaction);
      });

      await act(async () => {
        await result.current.payment.confirm();
      });

      expect(mockTransactionsApi.update).toHaveBeenCalledWith('tx-1', { isPaid: true });
      expect(patchUser).toHaveBeenCalledWith({ balance: -2500 });
      expect(result.current.payment.isOpen).toBe(false);
    });
  });

  describe('edit.categories', () => {
    it('should filter categories by transaction type', () => {
      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.edit.open(mockTransaction);
      });

      // mockTransaction is type 'debito', so only debit categories should appear
      const catNames = result.current.edit.categories.map(c => c.name);
      expect(catNames).toContain('Alimentação');
      expect(catNames).not.toContain('Salário');
    });
  });

  describe('transaction-change event', () => {
    it('should dispatch transaction-change event on save', async () => {
      mockTransactionsApi.update.mockResolvedValue({
        transaction: mockTransaction,
        balance: 0,
      });

      const { result } = renderHook(() => useTransactionCrud());

      act(() => {
        result.current.edit.open(mockTransaction);
      });

      await act(async () => {
        await result.current.edit.save();
      });

      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    });
  });
});
