import React, { createContext, useContext } from "react";
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
  const { user, token, setAuth, clearAuth } = useGlobalStore((state) => ({
    user: state.user,
    token: state.token,
    setAuth: state.setAuth,
    clearAuth: state.clearAuth,
  }));

  const login = (newToken: string, newUser: User) => {
    setAuth(newToken, newUser);
    navigate("/home");
  };

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token }}
    >
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
