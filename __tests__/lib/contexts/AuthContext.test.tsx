import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, ApiError } from '@/lib/contexts/AuthContext';
import { authApi, usersApi } from '@/lib/api';
import { setAccessToken } from '@/lib/api/client';
import type { User } from '@/lib/api';

// ── Mocks ──────────────────────────────────────────────

jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  },
  usersApi: {
    getMe: jest.fn(),
    update: jest.fn(),
    uploadAvatar: jest.fn(),
  },
}));

jest.mock('@/lib/api/client', () => ({
  setAccessToken: jest.fn(),
  getAccessToken: jest.fn(),
}));

const mockAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;
const mockSetAccessToken = setAccessToken as jest.Mock;

// ── Helpers ────────────────────────────────────────────

const mockUser: User = {
  _id: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  pendingEmail: null,
  avatarUrl: null,
  role: 'user',
  isVerified: true,
  balance: 0,
  preferences: { darkMode: false, language: 'pt-BR', currency: 'BRL', allowForeignCurrency: false },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// ── Tests ──────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: silent refresh fails (no session)
    mockAuthApi.refresh.mockRejectedValue(new Error('No session'));
  });

  describe('initialization', () => {
    it('should start with isLoading=true, user=null', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should restore session on mount if refresh succeeds', async () => {
      mockAuthApi.refresh.mockResolvedValue({ accessToken: 'tok-123' });
      mockUsersApi.getMe.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear state when refresh fails on mount', async () => {
      mockAuthApi.refresh.mockRejectedValue(new Error('expired'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.user).toBeNull();
      expect(mockSetAccessToken).toHaveBeenCalledWith(null);
    });
  });

  describe('login', () => {
    it('should set user on successful login', async () => {
      mockAuthApi.refresh.mockRejectedValue(new Error('none'));
      mockAuthApi.login.mockResolvedValue({ accessToken: 'tok', user: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'Test@1234' });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set error and throw ApiError on failed login', async () => {
      mockAuthApi.refresh.mockRejectedValue(new Error('none'));
      mockAuthApi.login.mockRejectedValue({
        response: { status: 401, data: { error: { message: 'Credenciais inválidas' } } },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let thrownError: unknown;
      await act(async () => {
        try {
          await result.current.login({ email: 'bad@example.com', password: 'wrong' });
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBeInstanceOf(ApiError);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Credenciais inválidas');
    });
  });

  describe('register', () => {
    it('should return message on successful registration', async () => {
      mockAuthApi.refresh.mockRejectedValue(new Error('none'));
      mockAuthApi.register.mockResolvedValue({ message: 'Verifique seu email' });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let response: { message: string } | undefined;
      await act(async () => {
        response = await result.current.register({
          firstName: 'Test',
          lastName: 'User',
          email: 'new@example.com',
          password: 'Test@1234',
        });
      });

      expect(response?.message).toBe('Verifique seu email');
      // User should NOT be set (needs email verification)
      expect(result.current.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear user and token on logout', async () => {
      mockAuthApi.refresh.mockResolvedValue({ accessToken: 'tok' });
      mockUsersApi.getMe.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.user).toEqual(mockUser));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockSetAccessToken).toHaveBeenCalledWith(null);
    });

    it('should clear state even if API logout fails', async () => {
      mockAuthApi.refresh.mockResolvedValue({ accessToken: 'tok' });
      mockUsersApi.getMe.mockResolvedValue(mockUser);
      mockAuthApi.logout.mockRejectedValue(new Error('network'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.user).toEqual(mockUser));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update local user state on success', async () => {
      mockAuthApi.refresh.mockResolvedValue({ accessToken: 'tok' });
      mockUsersApi.getMe.mockResolvedValue(mockUser);
      mockUsersApi.update.mockResolvedValue({ ...mockUser, firstName: 'Updated' });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.user).toEqual(mockUser));

      await act(async () => {
        await result.current.updateUser({ firstName: 'Updated' });
      });

      expect(result.current.user?.firstName).toBe('Updated');
    });
  });

  describe('patchUser', () => {
    it('should optimistically update user fields', async () => {
      mockAuthApi.refresh.mockResolvedValue({ accessToken: 'tok' });
      mockUsersApi.getMe.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.user).toEqual(mockUser));

      act(() => {
        result.current.patchUser({ balance: 50000 });
      });

      expect(result.current.user?.balance).toBe(50000);
    });
  });

  describe('clearError', () => {
    it('should clear the error state', async () => {
      mockAuthApi.refresh.mockRejectedValue(new Error('none'));
      mockAuthApi.login.mockRejectedValue({
        response: { status: 401, data: { error: { message: 'Erro' } } },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        try {
          await result.current.login({ email: 'a@b.com', password: 'x' });
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Erro');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
