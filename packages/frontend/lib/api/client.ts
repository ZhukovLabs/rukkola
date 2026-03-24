type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipAuth?: boolean;
  skipRedirect?: boolean;
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean | null> | null = null;

async function refreshAccessToken(): Promise<boolean | null> {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  
  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal, skipAuth = false, skipRedirect = false } = options;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`/api${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    signal,
    credentials: 'include',
  });

  if (response.status === 401) {
    if (!skipAuth && endpoint !== '/auth/login' && endpoint !== '/auth/refresh' && endpoint !== '/auth/me') {
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        return request<T>(endpoint, options);
      }
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 'Необходима авторизация';

    const isAuthRequest = endpoint === '/auth/login' || endpoint === '/auth/refresh' || endpoint === '/auth/me';
    if (!isAuthRequest && !skipRedirect && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    throw new ApiError(401, errorMessage);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || errorData.error || `Ошибка сервера (${response.status})`,
    );
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.startsWith('image/')) {
    return response as unknown as T;
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, signal?: AbortSignal, skipRedirect = false) =>
    request<T>(endpoint, { signal, skipRedirect }),

  post: <T>(endpoint: string, body?: unknown, skipRedirect = false) =>
    request<T>(endpoint, { method: 'POST', body, skipRedirect }),

  patch: <T>(endpoint: string, body?: unknown, skipRedirect = false) =>
    request<T>(endpoint, { method: 'PATCH', body, skipRedirect }),

  delete: <T>(endpoint: string, skipRedirect = false) =>
    request<T>(endpoint, { method: 'DELETE', skipRedirect }),

  upload: <T>(endpoint: string, formData: FormData, skipRedirect = false) =>
    request<T>(endpoint, { method: 'POST', body: formData, skipRedirect }),
};

export { ApiError };
