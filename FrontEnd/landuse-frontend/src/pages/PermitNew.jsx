import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, apiFetchMultipart } from "../services/api.js";
import TopBar from "../components/TopBar.jsx";

const asDate = (v) => (v ? String(v).slice(0, 10) : "");
const ACCEPT = ".pdf,.jpg,.jpeg,.png";
const MAX_MB = 15;

function useFileField(initial = null) {
  const [file, setFile] = useState(initial);
  const [preview, setPreview] = useState(null); // object URL أو اسم
  const onChange = (f) => {
    if (!f) { setFile(null); setPreview(null); return; }
    setFile(f);
    const name = f.name?.toLowerCase() || "";
    if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(name); // PDF: نعرض الاسم فقط
    }
  };
  const clear = () => { if (preview?.startsWith?.("blob:")) URL.revokeObjectURL(preview); setFile(null); setPreview(null); };
  return { file, preview, onChange, clear };
}

function FileUploadField({ label, required, state }) {
  return (
    <div className="col-md-4">
      <label className="form-label">{label}{required && " *"}</label>
      {!state.file ? (
        <input
          className="form-control"
          type="file"
          accept={ACCEPT}
          onChange={(e) => state.onChange(e.target.files?.[0] || null)}
        />
      ) : (
        <div className="d-flex align-items-center gap-2">
          {typeof state.preview === "string" && state.preview.startsWith("blob:") ? (
            <img src={state.preview} alt="preview" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #334155" }}/>
          ) : (
            <span className="badge bg-secondary">{state.file.name}</span>
          )}
          <button type="button" className="btn btn-sm btn-outline-light" onClick={state.clear}>حذف/استبدال</button>
        </div>
      )}
      <div className="form-text">PDF/JPG/PNG — حد أقصى {MAX_MB}MB</div>
    </div>
  );
}

export default function PermitNew() {
  const { token } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState({
    applicantName: "",
    nationalIdOrCr: "",
    type: "BUILDING",
    purpose: "",
    requestedAreaSqm: 1,
    locationDetails: "",
    startDate: asDate(new Date()),
    endDate: asDate(new Date()),
    contactNumber: "",
    email: "",
  });

  // ثلاث حقول رفع منفصلة
  const ownership = useFileField(); // إلزامي
  const idCopy = useFileField();    // اختياري
  const siteMap = useFileField();   // اختياري

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (k) => (e) => {
    const v = e.target.value;
    setF((s) => ({ ...s, [k]: k === "requestedAreaSqm" ? Number(v) : v }));
  };

  function validateFiles() {
    if (!ownership.file) return "ملف صك الملكية إلزامي.";
    for (const ff of [ownership.file, idCopy.file, siteMap.file].filter(Boolean)) {
      const okExt = /\.(pdf|jpg|jpeg|png)$/i.test(ff.name || "");
      const okSize = ff.size <= MAX_MB * 1024 * 1024;
      if (!okExt) return `امتداد غير مسموح: ${ff.name}`;
      if (!okSize) return `حجم كبير: ${ff.name} يتجاوز ${MAX_MB}MB`;
    }
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");

    const fileErr = validateFiles();
    if (fileErr) { setErr(fileErr); setBusy(false); return; }

    try {
      // 1) إنشاء الطلب
      const created = await apiFetch("/api/user/permits", { method: "POST", token, body: f });

      // 2) رفع كل ملف على حدة بنوعه
      async function uploadOne(file, type) {
        if (!file) return;
        await apiFetchMultipart(`/api/user/permits/${created.id}/attachments`, {
          files: [file],
          token,
          attachmentType: type,
        });
      }
      await uploadOne(ownership.file, "OWNERSHIP_PROOF");
      await uploadOne(idCopy.file, "ID_COPY");
      await uploadOne(siteMap.file, "SITE_MAP");

      nav("/user/permits", { replace: true });
    } catch (e2) {
      setErr(e2?.details || e2?.message || "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <TopBar title="تصريح جديد" />
      <div className="container mt-3">
        <div className="cardx">
          <form onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">اسم المتقدم</label>
                <input className="inputx" value={f.applicantName} onChange={onChange("applicantName")} required maxLength={150}/>
              </div>
              <div className="col-md-6">
                <label className="form-label">الهوية/السجل التجاري</label>
                <input className="inputx" value={f.nationalIdOrCr} onChange={onChange("nationalIdOrCr")} required maxLength={30}/>
              </div>

              <div className="col-md-4">
                <label className="form-label">نوع التصريح</label>
                <select className="inputx" value={f.type} onChange={onChange("type")}>
                  <option value="BUILDING">Building</option>
                  <option value="AGRICULTURAL">Agricultural</option>
                  <option value="COMMERCIAL_EVENT">Commercial Event</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="col-md-8">
                <label className="form-label">الغرض</label>
                <input className="inputx" value={f.purpose} onChange={onChange("purpose")} required minLength={10} maxLength={2000}/>
              </div>

              <div className="col-md-4">
                <label className="form-label">المساحة (م²)</label>
                <input className="inputx" type="number" min={1} step="1" value={f.requestedAreaSqm} onChange={onChange("requestedAreaSqm")} required/>
              </div>

              <div className="col-md-8">
                <label className="form-label">تفاصيل الموقع</label>
                <input className="inputx" value={f.locationDetails} onChange={onChange("locationDetails")} required maxLength={500}/>
              </div>

              <div className="col-md-3">
                <label className="form-label">من</label>
                <input className="inputx" type="date" value={asDate(f.startDate)} onChange={onChange("startDate")} required/>
              </div>
              <div className="col-md-3">
                <label className="form-label">إلى</label>
                <input className="inputx" type="date" value={asDate(f.endDate)} onChange={onChange("endDate")} required/>
              </div>

              <div className="col-md-3">
                <label className="form-label">رقم التواصل</label>
                <input className="inputx" value={f.contactNumber} onChange={onChange("contactNumber")} required maxLength={30}/>
              </div>
              <div className="col-md-3">
                <label className="form-label">الإيميل</label>
                <input className="inputx" type="email" value={f.email} onChange={onChange("email")} required maxLength={254}/>
              </div>

              {/* حقول الرفع الثلاثة */}
              <FileUploadField label="صك الملكية (إلزامي)" required state={ownership}/>
              <FileUploadField label="صورة الهوية (اختياري)" state={idCopy}/>
              <FileUploadField label="خريطة/سكتش الموقع (اختياري)" state={siteMap}/>
            </div>

            {err && <div className="alert alert-danger mt-3">{err}</div>}

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" disabled={busy}>{busy ? "..." : "إرسال الطلب"}</button>
              <Link to="/user" className="btn btn-outline-light">إلغاء</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}