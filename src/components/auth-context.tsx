"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({
  children,
  initialAuth = false,
  initialUsername = null,
}: {
  children: React.ReactNode;
  initialAuth?: boolean;
  initialUsername?: string | null;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuth);
  const [username, setUsername] = useState<string | null>(initialUsername);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(Boolean(data.isAuthenticated));
        setUsername(data.username || null);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUsername(null);
    }
  }, []);

  const login = async (user: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setUsername(data.username || user);
        return { success: true };
      }
      return { success: false, error: data.error || "Ongeldige gebruikersnaam of wachtwoord" };
    } catch {
      return { success: false, error: "Inloggen mislukt. Probeer opnieuw." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsAuthenticated(false);
      setUsername(null);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
