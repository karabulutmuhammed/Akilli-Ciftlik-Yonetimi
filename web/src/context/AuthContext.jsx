import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const { data } = await client.get("/auth/me");
        setUser(data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setReady(true);
      }
    }
    bootstrap();
  }, [token]);

  const value = useMemo(() => ({
    user,
    ready,
    async login(email, password) {
      const { data } = await client.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
    },
    async register(fullName, email, password) {
      const { data } = await client.post("/auth/register", { fullName, email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
    },
    logout() {
      localStorage.removeItem("token");
      setUser(null);
    }
  }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
