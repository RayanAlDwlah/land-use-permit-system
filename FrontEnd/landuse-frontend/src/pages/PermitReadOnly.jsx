// pages/PermitReadOnly.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../services/api.js";
import TopBar from "../components/TopBar.jsx";
import AttachmentListWithPreview from "../components/AttachmentListWithPreview.jsx";

export default function PermitReadOnly() {
  const { id } = useParams();
  const { token } = useAuth();

  const [p, setP] = useState(null);
  const [atts, setAtts] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const data = await apiFetch(`/api/admin/permits/${id}`, { token });
      setP(data);
      const list = await apiFetch(`/api/admin/permits/${id}/attachments`, { token });
      setAtts(list);
    } catch (e) {
      setErr(e?.details || e?.message || "Error");
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, token]);

  const downloadAttachment = async (a) => {
    try {
      const res = await fetch(`/api/attachments/${a.id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = a.fileName || "file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) { setErr(e.message || "فشل تنزيل الملف"); }
  };

  if (!p) return <div className="center"><div className="cardx">Loading…</div></div>;

  return (
    <div>
      <TopBar title={`تصريح #${p.id} — عرض فقط`} />
      <div className="container mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Link to="/admin/permits" className="btn btn-sm btn-outline-light">← رجوع للقائمة</Link>
          <span className="badge bg-secondary" style={{fontSize:12}}>{p.status}</span>
        </div>

        <div className="cardx">
          {err && <div className="alert alert-danger">{err}</div>}

          <div className="h1">بيانات الطلب</div>
          <div className="row">
            <div className="col-md-6"><b>المتقدم:</b> {p.applicantName} — {p.nationalIdOrCr}</div>
            <div className="col-md-6"><b>الحالة:</b> {p.status}</div>

            <div className="col-12"><b>النوع:</b> {p.type}</div>
            <div className="col-12"><b>الغرض:</b> {p.purpose}</div>
            <div className="col-12"><b>الموقع:</b> {p.locationDetails}</div>

            <div className="col-md-6"><b>من:</b> {p.startDate}</div>
            <div className="col-md-6"><b>إلى:</b> {p.endDate}</div>

            <div className="col-md-6"><b>تواصل:</b> {p.contactNumber}</div>
            <div className="col-md-6"><b>إيميل:</b> {p.email}</div>

            {p.adminComment && <div className="col-12"><b>تعليق الإدمن:</b> {p.adminComment}</div>}
          </div>

          <hr/>
          <div className="h1">المرفقات</div>

          {/* لو تستخدم كومبوننت المعاينة */}
          <AttachmentListWithPreview items={atts} token={token} />

          {/* أو قائمة بسيطة مع زر تنزيل يحترم التوكن */}
          <ul className="p mt-2">
            {atts.map(a => (
              <li key={a.id} className="d-flex justify-content-between align-items-center">
                <span>{a.fileName} — {Math.round((a.fileSize||a.sizeBytes||0)/1024)} KB</span>
                <button className="btn btn-sm btn-outline-light" onClick={() => downloadAttachment(a)}>تحميل</button>
              </li>
            ))}
            {atts.length === 0 && <li style={{ color: "#9fb4d1" }}>لا توجد مرفقات.</li>}
          </ul>

          {/* لا يوجد “قرار الإدمن” هنا إطلاقًا */}
        </div>
      </div>
    </div>
  );
}