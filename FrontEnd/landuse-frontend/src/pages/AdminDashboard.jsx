// pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import { apiFetch } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [pending, setPending] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/admin/permits?status=PENDING", { token });
        setPending(data);
      } catch (e) { setErr(e?.details || e?.message || "Error"); }
    })();
  }, [token]); // ✅

  return (
    <div>
      <TopBar title="لوحة الأدمن" />
      <div className="container mt-3">
        <div className="cardx">
          {err && <div className="alert alert-danger">{err}</div>}
          <div className="h1">طلبات معلّقة</div>
          <div className="table-responsive">
            <table className="table table-dark table-striped">
              <thead><tr><th>#</th><th>Email</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.id}>
                    <td><Link to={`/admin/permits/${p.id}`}>{p.id}</Link></td>
                    <td>{p.email}</td>
                    <td>{p.type}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
                {pending.length === 0 && <tr><td colSpan={4} style={{ color: "#9fb4d1" }}>لا توجد طلبات معلّقة.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}