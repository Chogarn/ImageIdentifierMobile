import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  ApiError,
  apiClient,
  getToken,
  setToken,
  removeToken,
} from '../services/api';
import type { User, RegisterData, LoginResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  // hay token guardado pero el servidor no respondió: no se cierra la sesión, se ofrece reintentar.
  connectionError: boolean;
}

type AuthAction =
  | { type: 'SET_AUTH'; payload: { user: User; token: string } }
  | { type: 'CONNECTION_ERROR'; payload: { token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  retryConnection: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        connectionError: false,
      };
    case 'CONNECTION_ERROR':
      return {
        user: null,
        token: action.payload.token,
        loading: false,
        connectionError: true,
      };
    case 'LOGOUT':
      return { user: null, token: null, loading: false, connectionError: false };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        connectionError: action.payload ? false : state.connectionError,
      };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    loading: true,
    connectionError: false,
  });

  const fetchProfile = useCallback(async (jwt: string) => {
    try {
      const data = await apiClient<User>('/auth/profile', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      dispatch({ type: 'SET_AUTH', payload: { user: data, token: jwt } });
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        // sin conexión: el token sigue siendo válido, no hay que borrarlo.
        dispatch({ type: 'CONNECTION_ERROR', payload: { token: jwt } });
        return;
      }
      await removeToken();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  useEffect(() => {
    getToken().then((stored) => {
      if (stored) {
        fetchProfile(stored);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });
  }, [fetchProfile]);

  const retryConnection = () => {
    if (!state.token) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    fetchProfile(state.token);
  };

  const login = async (email: string, password: string) => {
    const data = await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setToken(data.access_token);
    dispatch({
      type: 'SET_AUTH',
      payload: { user: data.user, token: data.access_token },
    });
  };

  const register = async (regData: RegisterData) => {
    await apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(regData),
    });
  };

  const logout = async () => {
    await removeToken();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.user,
        login,
        register,
        logout,
        retryConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
