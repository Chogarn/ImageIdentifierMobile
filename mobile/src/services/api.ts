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

// error de la API con el código HTTP; status 0 significa que no hubo respuesta (sin red, servidor apagado).
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
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

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...rest,
      headers,
    });
  } catch {
    // fetch solo lanza si no hubo respuesta (sin red, servidor apagado).
    throw new ApiError(
      'No pudimos conectar con el servidor. Revisá tu conexión y reintentá.',
      0,
    );
  }

  // un 401 con token enviado significa sesión vencida. Sin token (ej: login con
  // contraseña mal) es un error normal y se muestra el mensaje del backend.
  if (response.status === 401 && token) {
    await removeToken();
    throw new ApiError('Sesión expirada. Inicia sesión de nuevo.', 401);
  }

  // el DELETE responde 204 sin cuerpo, y un error de proxy/servidor puede no ser JSON.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Nest devuelve `message` como array cuando falla una validación.
    const message = Array.isArray(data?.message)
      ? data.message.join('. ')
      : data?.message;
    throw new ApiError(message || 'Error en la solicitud', response.status);
  }

  return data as T;
}
