import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalStore, type AuthUser } from "../store/globalStore";

export type User = AuthUser;

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = useGlobalStore((s) => s.user);
  const token = useGlobalStore((s) => s.token);
  const setAuth = useGlobalStore((s) => s.setAuth);
  const clearAuth = useGlobalStore((s) => s.clearAuth);

  const login = useCallback(
    (newToken: string, newUser: User) => {
      setAuth(newToken, newUser);
      navigate("/home");
    },
    [setAuth, navigate]
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate("/login");
  }, [clearAuth, navigate]);

  const value = useMemo(
    () => ({ user, token, login, logout, isAuthenticated: !!token }),
    [user, token, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
