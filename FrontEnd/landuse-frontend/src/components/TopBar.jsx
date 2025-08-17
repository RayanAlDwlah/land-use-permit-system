import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function TopBar({ title, homePath }) {
  const [open, setOpen] = useState(false);
  const { me, logout } = useAuth();
  const nav = useNavigate();
  const ref = useRef(null);

  const resolvedHome = useMemo(() => {
    if (homePath) return homePath;
    if (me?.role === "ROLE_ADMIN") return "/admin";
    if (me) return "/user";
    return "/login";
  }, [homePath, me]);

  const onLogout = () => { logout(); nav("/login"); };

  // اغلاق القائمة بالضغط خارجها أو بالهروب
  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e){ if (e.key === "Escape") setOpen(false); }
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("click", onDoc); document.removeEventListener("keydown", onEsc); };
  }, []);

  return (
    <div className="topbar" dir="rtl">
      <Link to={resolvedHome} className="text-white text-decoration-none" style={{ fontWeight: 700 }}>
        {title}
      </Link>

      <div className="menu" ref={ref}>
        <button
          className="menu-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        >
          ☰ القائمة
        </button>

        {open && (
          <div className="menu-list" role="menu">
            {me?.role === "ROLE_ADMIN" ? (
              <>
                <Link className="menu-item" to="/admin" onClick={() => setOpen(false)}>التصاريح المعلّقة</Link>
                <Link className="menu-item" to="/admin/analytics" onClick={() => setOpen(false)}>لوحة الإحصائيات</Link>
              </>
            ) : (
              <>
                <Link className="menu-item" to="/user" onClick={() => setOpen(false)}>لوحة المستخدم</Link>
                <Link className="menu-item" to="/user/permits" onClick={() => setOpen(false)}>سجل تصاريحي</Link>
                <Link className="menu-item" to="/user/permits/new" onClick={() => setOpen(false)}>إضافة تصريح</Link>
              </>
            )}
            <button className="menu-item w-100 text-start" onClick={onLogout}>تسجيل خروج</button>
          </div>
        )}
      </div>
    </div>
  );
}