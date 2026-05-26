import React, { createContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { AuthContextType } from "../../types/auth/AuthContext";
import type { AuthUser } from "../../types/auth/AuthUser";
import type { JwtTokenClaims } from "../../types/auth/JwtTokenClaims";

const defaultContext: AuthContextType = {
  user: {},
  token: "",
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: false
};

const AuthContext = createContext<AuthContextType>(defaultContext);
const KEY = "authToken";

const decode = (token: string): JwtTokenClaims | {} => {
  try {
    const d = jwtDecode<JwtTokenClaims>(token);
    return d?.id ? d : {};
  } catch {
    return {};
  }
};

const expired = (token: string): boolean => {
  try {
    const d = jwtDecode<{ exp?: number }>(token);
    return !d?.exp || d.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

const getInitialAuth = () => {
  const saved = localStorage.getItem(KEY);

  if (saved && !expired(saved)) {
    const claims = decode(saved);
    if (claims && "id" in claims) {
      return {
        token: saved,
        user: { id: claims.id, username: claims.username, role: claims.role, } as AuthUser,
      };
    }
  }

  if (saved) localStorage.removeItem(KEY);

  return { token: "", user: {} };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = getInitialAuth();

  const [token, setToken] = useState<string>(initial.token || "");
  const [user, setUser] = useState<AuthUser | {}>(initial.user || {});
  const [isLoading] = useState(false);

  const login = (t: string) => {
    const claims = decode(t);
    if (!claims || !("id" in claims) || expired(t)) return;

    setToken(t);
    setUser({ id: claims.id, username: claims.username, role: claims.role });
    localStorage.setItem(KEY, t);
  };

  const logout = () => {
    setToken("");
    setUser({});
    localStorage.removeItem(KEY);
  };

  return (
    <AuthContext.Provider value={{ user: user as AuthUser, token, login, logout, isAuthenticated: !!user && "id" in user && !!token, isLoading}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;