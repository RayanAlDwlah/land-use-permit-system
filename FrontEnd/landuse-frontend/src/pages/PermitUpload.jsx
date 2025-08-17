import { useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import { apiFetch, apiFetchMultipart } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useParams } from "react-router-dom";
import AttachmentListWithPreview from "../components/AttachmentListWithPreview.jsx";

export default function PermitUpload() {
  const { token } = useAuth();
  const { id } = useParams();

  // رفع/قائمة المرفقات
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [list, setList] = useState([]);

  // بيانات التصريح
  const [permit, setPermit] = useState(null);
  const [locked, setLocked] = useState(true);

  // نوع المرفق، حالة انتظار، أخطاء
  const [attType, setAttType] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // تعديل الحقول + إعادة الإرسال
  const [editOpen, setEditOpen] = useState(false);
  const [editF, setEditF] = useState(null);

  const load = async () => {
    setErr("");
    try {
      const p = await apiFetch(`/api/user/permits/${id}`, { token });
      setPermit(p);
      setLocked(p.status !== "EDIT_REQUESTED");

      setEditF({
        applicantName: p.applicantName || "",
        nationalIdOrCr: p.nationalIdOrCr || "",
        type: p.type || "BUILDING",
        purpose: p.purpose || "",
        requestedAreaSqm: p.requestedAreaSqm || 1,
        locationDetails: p.locationDetails || "",
        startDate: p.startDate || "",
        endDate: p.endDate || "",
        contactNumber: p.contactNumber || "",
        email: p.email || "",
      });

      const data = await apiFetch(`/api/user/permits/${id}/attachments`, { token });
      setList(data);
    } catch (e) { setErr(e?.details || e?.message || "Error"); }
  };

  useEffect(() => { load(); }, [id, token]);

  const onFiles = (e) => {
    const arr = Array.from(e.target.files || []);
    setFiles(arr);
    setPreviews(arr.map(f => ({ name: f.name, size: f.size })));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!files.length || locked) return;
    setBusy(true); setErr("");
    try {
      await apiFetchMultipart(`/api/user/permits/${id}/attachments`, {
        files, token, attachmentType: attType || undefined
      });
      setFiles([]); setPreviews([]);
      await load();
    } catch (e2) { setErr(e2?.details || e2?.message || "Error"); }
    finally { setBusy(false); }
  };

  const deleteExisting = async (attId) => {
    if (locked) return;
    if (!confirm("تأكيد حذف المرفق؟")) return;
    setBusy(true);
    try {
      await apiFetch(`/api/user/attachments/${attId}`, { method: "DELETE", token });
      await load();
    } catch (e2) { setErr(e2?.details || e2?.message || "Error"); }
    finally { setBusy(false); }
  };

  const buildUpdateBody = () => {
    if (!permit || !editF) return {};
    const body = {};
    for (const k of Object.keys(editF)) {
      const v = editF[k];
      const orig = permit[k];
      if (v !== orig && v !== "" && v !== null && v !== undefined) body[k] = v;
    }
    return body;
  };

  const onResubmit = async () => {
    if (locked) return;
    setBusy(true); setErr("");
    try {
      const body = buildUpdateBody(); // حتى لو {} يكفي لإرجاع الحالة PENDING
      await apiFetch(`/api/user/permits/${id}`, { method: "PUT", token, body });
      await load();
      alert("تمت إعادة الإرسال. الحالة الآن PENDING.");
      setEditOpen(false);
    } catch (e) { setErr(e?.details || e?.message || "Error"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <TopBar title={`مرفقات التصريح #${id}`} />
      <div className="container mt-3">
        <div className="cardx">
          {err && <div className="alert alert-danger">{err}</div>}

          {permit && locked && (
            <div className="alert alert-warning">
              لا يمكنك التعديل حالياً. حالة الطلب: <b>{permit.status}</b>.
              {permit.adminComment && <> — ملاحظة الإداري: <b>{permit.adminComment}</b></>}
              <div className="mt-1" style={{opacity:.8}}>يمكنك التعديل فقط عند EDIT_REQUESTED.</div>
            </div>
          )}

          {permit && !locked && (
            <>
              {permit.adminComment && (
                <div className="alert alert-info">
                  طلب تعديل: <b>{permit.adminComment}</b>
                </div>
              )}

              <div className="d-flex gap-2 mb-2">
                <button className="btn btn-outline-light" type="button" onClick={() => setEditOpen(v=>!v)}>
                  {editOpen ? "إخفاء تعديل البيانات" : "تعديل بيانات الطلب"}
                </button>
                <button className="btn btn-primary" type="button" onClick={onResubmit} disabled={busy}>
                  {busy ? "..." : "إعادة الإرسال للأدمن"}
                </button>
              </div>

              {editOpen && editF && (
                <div className="cardx mb-3">
                  <div className="h1">تعديل بيانات الطلب</div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">اسم المتقدم</label>
                      <input className="inputx" value={editF.applicantName}
                             onChange={(e)=>setEditF(s=>({...s, applicantName:e.target.value}))}/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">الهوية/السجل التجاري</label>
                      <input className="inputx" value={editF.nationalIdOrCr}
                             onChange={(e)=>setEditF(s=>({...s, nationalIdOrCr:e.target.value}))}/>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">نوع التصريح</label>
                      <select className="inputx" value={editF.type}
                              onChange={(e)=>setEditF(s=>({...s, type:e.target.value}))}>
                        <option value="BUILDING">Building</option>
                        <option value="AGRICULTURAL">Agricultural</option>
                        <option value="COMMERCIAL_EVENT">Commercial Event</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">الغرض</label>
                      <input className="inputx" value={editF.purpose}
                             onChange={(e)=>setEditF(s=>({...s, purpose:e.target.value}))}/>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">المساحة (م²)</label>
                      <input className="inputx" type="number" min={1} step="1" value={editF.requestedAreaSqm}
                             onChange={(e)=>setEditF(s=>({...s, requestedAreaSqm:Number(e.target.value)}))}/>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">تفاصيل الموقع</label>
                      <input className="inputx" value={editF.locationDetails}
                             onChange={(e)=>setEditF(s=>({...s, locationDetails:e.target.value}))}/>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">من</label>
                      <input className="inputx" type="date" value={editF.startDate}
                             onChange={(e)=>setEditF(s=>({...s, startDate:e.target.value}))}/>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">إلى</label>
                      <input className="inputx" type="date" value={editF.endDate}
                             onChange={(e)=>setEditF(s=>({...s, endDate:e.target.value}))}/>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">رقم التواصل</label>
                      <input className="inputx" value={editF.contactNumber}
                             onChange={(e)=>setEditF(s=>({...s, contactNumber:e.target.value}))}/>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">الإيميل</label>
                      <input className="inputx" type="email" value={editF.email}
                             onChange={(e)=>setEditF(s=>({...s, email:e.target.value}))}/>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* فورم الرفع */}
          <form onSubmit={submit}>
            <div className="mb-2">
              <label className="form-label">رفع مرفقات (PDF/JPG/PNG)</label>
              <input className="form-control" type="file" multiple onChange={onFiles} disabled={locked}/>
            </div>
            <div className="mb-2">
              <label className="form-label">نوع المرفقات (اختياري)</label>
              <select className="inputx" value={attType} onChange={e=>setAttType(e.target.value)} disabled={locked}>
                <option value="">— بدون تحديد —</option>
                <option value="OWNERSHIP_PROOF">Ownership Proof</option>
                <option value="SITE_MAP">Site Map</option>
                <option value="ID_COPY">ID Copy</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            {previews.length > 0 && (
              <ul className="p">
                {previews.map((p, i) => <li key={i}>{p.name} — {Math.round(p.size/1024)} KB</li>)}
              </ul>
            )}
            <button className="btn btn-primary" disabled={busy || files.length===0 || locked}>
              {busy ? "..." : "رفع"}
            </button>
          </form>

          <hr/>
          {/* قائمة + معاينة مدمجة */}
          <AttachmentListWithPreview
            items={list}
            token={token}
            canDelete={!locked}
            onDelete={deleteExisting}
            height={520}
          />
        </div>
      </div>
    </div>
  );
}