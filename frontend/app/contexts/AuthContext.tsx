"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  telefono?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: "SET_AUTH"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  nombre: string;
  apellido: string;
  telefono?: string;
  nombreUsuario: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_AUTH":
      return { user: action.payload.user, token: action.payload.token, loading: false };
    case "LOGOUT":
      return { user: null, token: null, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    loading: true,
  });
  const router = useRouter();

  const fetchProfile = useCallback(async (jwt: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      dispatch({ type: "SET_AUTH", payload: { user: data, token: jwt } });
    } catch {
      localStorage.removeItem("token");
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      fetchProfile(stored);
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Credenciales inválidas");
    }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    dispatch({ type: "SET_AUTH", payload: { user: data.user, token: data.access_token } });
    router.push("/dashboard");
  };

  const register = async (regData: RegisterData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al registrar");
    }
    router.push("/login");
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
