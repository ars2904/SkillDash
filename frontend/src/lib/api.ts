import { useUserStore } from '@/store/useUserStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (!skipAuth) {
    const token = useUserStore.getState().token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...rest,
  });

  if (res.status === 401) {
    // Token expired or invalid — force logout
    const store = useUserStore.getState();
    if (store.token) {
      store.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}
