import { useEffect, useState } from "react";

/**
 * props:
 * - open: boolean
 * - onClose: () => void
 * - attachment: { id, fileName }
 * - token: string
 */
export default function AttachmentViewer({ open, onClose, attachment, token }) {
  const [state, setState] = useState({ loading: false, error: "", url: "", ct: "" });

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!open || !attachment) return;
      setState({ loading: true, error: "", url: "", ct: "" });
      try {
        const res = await fetch(`/api/attachments/${attachment.id}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get("Content-Type") || "";
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (alive) setState({ loading: false, error: "", url, ct });
      } catch (e) {
        if (alive) setState({ loading: false, error: e.message || "فشل جلب الملف", url: "", ct: "" });
      }
    }
    load();
    return () => {
      alive = false;
      if (state.url) URL.revokeObjectURL(state.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, attachment?.id, token]);

  if (!open) return null;

  const isImage = state.ct.startsWith("image/");
  const isPdf = state.ct === "application/pdf";

  return (
    <div className="av-overlay" onClick={onClose}>
      <div className="av-modal" onClick={(e) => e.stopPropagation()}>
        <div className="av-header">
          <div className="av-title">{attachment?.fileName || "مرفق"}</div>
          <button className="btn btn-sm btn-outline-light" onClick={onClose}>إغلاق</button>
        </div>

        {state.loading && <div className="av-body">جاري التحميل…</div>}
        {state.error && <div className="av-body"><div className="alert alert-danger">{state.error}</div></div>}

        {!state.loading && !state.error && (
          <div className="av-body">
            {isImage && <img src={state.url} alt="preview" className="av-media" />}
            {isPdf && <iframe title="pdf" src={state.url} className="av-media" />}
            {!isImage && !isPdf && <div className="p">لا يمكن معاينة هذا النوع داخل المتصفح.</div>}
          </div>
        )}

        <div className="av-footer">
          {state.url && (
            <button
              className="btn btn-primary"
              onClick={() => {
                const a = document.createElement("a");
                a.href = state.url;
                a.download = attachment?.fileName || "file";
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
            >
              تحميل
            </button>
          )}
        </div>
      </div>
    </div>
  );
}