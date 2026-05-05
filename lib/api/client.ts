import axios, { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

let onAuthFailure: (() => void) | null = null;

export const setOnAuthFailure = (cb: () => void) => {
  onAuthFailure = cb;
};


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Backend unreachable (network error, no response at all) — clear auth state
    // so protected routes redirect to login. Skip for refresh/login endpoints
    // which handle their own errors in AuthContext.initAuth.
    if (!error.response) {
      const url = originalRequest?.url ?? '';
      if (!url.includes('/users/refresh') && !url.includes('/users/login')) {
        setAccessToken(null);
        onAuthFailure?.();
      }
      return Promise.reject(error);
    }

    if (error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/users/refresh') || originalRequest.url?.includes('/users/login')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post('/users/refresh');
      setAccessToken(data.accessToken);
      processQueue(null, data.accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessToken(null);
      onAuthFailure?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
