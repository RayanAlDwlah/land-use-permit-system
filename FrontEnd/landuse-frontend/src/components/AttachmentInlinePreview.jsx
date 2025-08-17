import { useEffect, useState } from "react";

/**
 * يعرض معاينة لمرفق واحد داخل الصفحة (صورة/PDF) مع زر تحميل.
 * props:
 *  - attachment: { id, fileName }
 *  - token: string
 *  - height?: number (افتراضي 520)
 */
export default function AttachmentInlinePreview({ attachment, token, height = 520 }) {
  const [st, setSt] = useState({ url: "", ct: "", loading: false, error: "" });

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!attachment) { setSt({ url: "", ct: "", loading: false, error: "" }); return; }
      setSt(prev => ({ ...prev, loading: true, error: "", url: "", ct: "" }));
      try {
        const res = await fetch(`/api/attachments/${attachment.id}/download`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get("Content-Type") || "";
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (alive) setSt({ url, ct, loading: false, error: "" });
      } catch (e) {
        if (alive) setSt({ url: "", ct: "", loading: false, error: e.message || "فشل جلب الملف" });
      }
    }
    load();
    return () => {
      alive = false;
      if (st.url) URL.revokeObjectURL(st.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment?.id, token]);

  if (!attachment) return <div className="p" style={{opacity:.7}}>اختر مرفقًا لمعاينته.</div>;
  if (st.loading) return <div className="p">جاري التحميل…</div>;
  if (st.error) return <div className="alert alert-danger">{st.error}</div>;

  const isImage = st.ct.startsWith("image/");
  const isPdf = st.ct === "application/pdf";

  return (
    <div className="ai-preview">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="fw-bold">{attachment.fileName}</div>
        {st.url && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              const a = document.createElement("a");
              a.href = st.url;
              a.download = attachment.fileName || "file";
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
          >
            تحميل
          </button>
        )}
      </div>

      {isImage && <img src={st.url} alt="preview" style={{ width: "100%", height, objectFit: "contain", background:"#0b1220", borderRadius:8 }} />}
      {isPdf && <iframe title="pdf" src={st.url} style={{ width: "100%", height, border:0, background:"#0b1220", borderRadius:8 }} />}
      {!isImage && !isPdf && <div className="p">هذا النوع لا يُعايَن داخل المتصفح.</div>}
    </div>
  );
}