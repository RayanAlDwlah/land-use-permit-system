import { useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import { apiFetch } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

function StatusBadge({ s }) {
  const map = {
    PENDING: "badge bg-warning",
    APPROVED: "badge bg-success",
    REJECTED: "badge bg-danger",
    EDIT_REQUESTED: "badge bg-info",
  };
  return <span className={map[s] ?? "badge bg-secondary"}>{s}</span>;
}

export default function MyPermits() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/user/permits", { token });
        setRows(data);
      } catch (e) { setErr(e?.details || e?.message || "Error"); }
    })();
  }, [token]);

  return (
    <div>
      <TopBar title="تصاريحي" homePath="/user" />
      <div className="container mt-3">
        <div className="cardx">
          {err && <div className="alert alert-danger">{err}</div>}
          <div className="d-flex justify-content-between align-items-center">
            <div className="h1">قائمة الطلبات</div>
            <Link className="btn btn-primary" to="/user/permits/new">إضافة تصريح</Link>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th>#</th><th>النوع</th><th>الحالة</th><th>الإيميل</th><th>تاريخ الإنشاء</th><th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.type}</td>
                    <td><StatusBadge s={p.status} /></td>
                    <td>{p.email}</td>
                    <td>{p.createdAt?.slice?.(0,10) ?? "-"}</td>
                    <td>
                      {p.status === "EDIT_REQUESTED" ? (
                        <Link className="btn btn-sm btn-outline-light" to={`/user/permits/${p.id}/upload`}>تعديل</Link>
                      ) : (
                        <span style={{opacity:.6}}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={6} style={{ color: "#9fb4d1" }}>لا توجد طلبات.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}