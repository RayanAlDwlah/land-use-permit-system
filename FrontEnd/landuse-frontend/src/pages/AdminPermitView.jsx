// pages/AdminPermitView.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../services/api.js";
import TopBar from "../components/TopBar.jsx";
import AttachmentListWithPreview from "../components/AttachmentListWithPreview.jsx";

export default function AdminPermitView(){
  const { id } = useParams();
  const { token } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [atts, setAtts] = useState([]);
  const [action, setAction] = useState("APPROVE");
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const data = await apiFetch(`/api/admin/permits/${id}`, { token });
      setP(data);
      const list = await apiFetch(`/api/admin/permits/${id}/attachments`, { token }); // ✅
      setAtts(list);
    } catch (e) { setErr(e?.details || e?.message || "Error"); }
  };

  useEffect(() => { load(); }, [id, token]); // ✅

  const act = async () => {
    setErr("");
    if ((action === "REJECT" || action === "EDIT_REQUESTED") && !comment.trim()) {
      setErr("التعليق إلزامي لهذه العملية"); 
      return;
    }
    try {
   // داخل الدالة act() فقط غيّر الاستدعاءات:
if (action === "APPROVE") {
    await apiFetch(`/api/admin/permits/${id}/approve`, { method: "PUT", token, body: { comment } });
  } else if (action === "REJECT") {
    await apiFetch(`/api/admin/permits/${id}/reject`, { method: "PUT", token, body: { comment } });
  } else if (action === "EDIT_REQUESTED") {
    await apiFetch(`/api/admin/permits/${id}/request-edit`, { method: "PUT", token, body: { comment } });
  }
      nav("/admin", { replace: true });
    } catch (e) { setErr(e?.details || e?.message || "Error"); }
  };

  if (!p) return <div className="center"><div className="cardx">Loading…</div></div>;
// ... أعلى الملف نفس الاستيرادات
// داخل المكوّن
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
  
  // ... داخل عرض المرفقات استبدل <a href=...> بـ:
  <button className="btn btn-sm btn-outline-light" onClick={() => downloadAttachment(a)}>تحميل</button>
  return (
    <div>
      <TopBar title={`تصريح #${p.id}`} />
      <div className="container mt-3">
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
            {p.adminComment && <div className="col-12"><b>تعليق سابق:</b> {p.adminComment}</div>}
          </div>

          <hr/>
<div className="h1">المرفقات</div>
<AttachmentListWithPreview
  items={atts}
  token={token}
/>
          <ul className="p">
            {atts.map(a => (
              <li key={a.id} className="d-flex justify-content-between align-items-center">
                <span>{a.fileName} — {Math.round((a.fileSize||0)/1024)} KB</span>
                <a className="btn btn-sm btn-outline-light" href={a.downloadUrl} target="_blank" rel="noreferrer">تحميل</a>
              </li>
            ))}
            {atts.length === 0 && <li style={{ color: "#9fb4d1" }}>لا توجد مرفقات.</li>}
          </ul>

          <hr/>
          <div className="h1">قرار الأدمن</div>
          <div className="row g-2">
            <div className="col-md-4">
              <select className="inputx" value={action} onChange={e=>setAction(e.target.value)}>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
                <option value="EDIT_REQUESTED">Request Edit</option>
              </select>
            </div>
            <div className="col-md-8">
              <input className="inputx" placeholder="تعليق (إلزامي للرفض/طلب التعديل)"
                     value={comment} onChange={e=>setComment(e.target.value)} />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary" onClick={act}>تنفيذ</button>
          </div>
        </div>
      </div>
    </div>
  );
}