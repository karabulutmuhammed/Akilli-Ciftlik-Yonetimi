import React from "react";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const { user, ready } = useAuth();

  if (!ready) return <div className="auth-shell"><div className="muted">Yükleniyor...</div></div>;
  return user ? <DashboardPage /> : <AuthPage />;
}
