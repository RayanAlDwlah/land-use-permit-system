import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allow }) {
  const { token, me, loading } = useAuth();
  if (!token && !loading) return <Navigate to="/login" replace />;
  if (loading) return <div className="center"><div className="cardx">Loading…</div></div>;
  if (allow && me && !allow.includes(me.role)) return <Navigate to="/login" replace />;
  return children;
}