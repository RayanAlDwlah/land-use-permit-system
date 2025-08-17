import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    let cancelled = false;
    if (!token) { setLoading(false); setMe(null); return; }
    (async () => {
      try {
        const j = await apiFetch("/api/auth/me", { token });
        if (!cancelled) setMe(j);
      } catch {
        if (!cancelled) { setMe(null); localStorage.removeItem("token"); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setMe(null);
  };

  const value = useMemo(() => ({ token, setToken, me, setMe, loading, logout }), [token, me, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}