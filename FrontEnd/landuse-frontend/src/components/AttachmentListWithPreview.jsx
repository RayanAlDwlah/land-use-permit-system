import { useState, useEffect } from "react";
import AttachmentInlinePreview from "./AttachmentInlinePreview.jsx";

/**
 * قائمة + معاينة مدمجة.
 * props:
 *  - items: attachments array
 *  - token: string
 *  - canDelete?: boolean
 *  - onDelete?: (id) => void
 *  - height?: number
 */
export default function AttachmentListWithPreview({ items, token, canDelete=false, onDelete, height=520 }) {
  const [sel, setSel] = useState(null);

  useEffect(() => {
    if (!sel || !items?.length) { setSel(items?.[0] || null); return; }
    // إذا المرفق المحدد انحذف بدّل على أول عنصر
    if (!items.find(x => x.id === sel.id)) setSel(items[0] || null);
  }, [items]);

  return (
    <div className="ai-wrapper">
      <div className="ai-left cardx">
        <div className="h1">المرفقات</div>
        <ul className="p ai-list">
          {items.map(a => (
            <li key={a.id} className={`ai-row ${sel?.id===a.id ? "active":""}`}>
              <button className="ai-row-btn" onClick={()=>setSel(a)} title="معاينة">{a.fileName}</button>
              <div className="d-flex gap-2">
                {canDelete && (
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete?.(a.id)}>حذف</button>
                )}
              </div>
            </li>
          ))}
          {(!items || items.length===0) && <li style={{color:"#9fb4d1"}}>لا توجد مرفقات.</li>}
        </ul>
      </div>

      <div className="ai-right cardx">
        <AttachmentInlinePreview attachment={sel} token={token} height={height}/>
      </div>
    </div>
  );
}