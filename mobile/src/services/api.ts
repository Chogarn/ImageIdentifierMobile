import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/constants';

const TOKEN_KEY = 'auth_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { headers: customHeaders, ...rest } = options;
  const token = await getToken();

  const headers: Record<string, string> = {
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(rest.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers,
  });

  if (response.status === 401) {
    await removeToken();
    throw new Error('Sesión expirada. Inicia sesión de nuevo.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }

  return data as T;
}
