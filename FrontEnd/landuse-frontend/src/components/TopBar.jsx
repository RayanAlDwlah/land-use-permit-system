import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const S = {
  wrap: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "#0b1424",
    borderBottom: "1px solid #1f2a44",
    width: "100%",
  },
  // ✅ خلّيناها بعرض كامل بدون maxWidth/margin auto
  inner: {
    width: "100%",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // العنوان يمين، زر المنيو يسار (مع RTL)
    gap: 12,
  },
  title: {
    color: "#e6eefc",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 16,
    whiteSpace: "nowrap",
  },
  // حاوية الزر
  menu: { position: "relative", display: "inline-block" },
  btn: {
    background: "#0f1b32",
    color: "#e6eefc",
    border: "1px solid #1f2a44",
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
  },
  list: {
    position: "absolute",
    top: "calc(100% + 6px)",
    // ✅ افتح بالعكس (للداخل): ثبّت على اليسار بدل اليمين
    left: 0,
    right: "auto",
    minWidth: 220,
    maxWidth: "calc(100vw - 16px)", // ما يطلع برّا الشاشة
    background: "#0f1b32",
    border: "1px solid #1f2a44",
    borderRadius: 10,
    padding: 8,
    boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
    zIndex: 1001,
  },
  item: {
    display: "block",
    width: "100%",
    textAlign: "right",
    color: "#e6eefc",
    textDecoration: "none",
    borderRadius: 8,
    padding: "8px 10px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  itemHoverBg: "#14213a",
};

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

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e){ if (e.key === "Escape") setOpen(false); }
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const hoverProps = (extra = {}) => ({
    style: { ...S.item, ...extra },
    onMouseEnter: (e) => { e.currentTarget.style.background = S.itemHoverBg; },
    onMouseLeave: (e) => { e.currentTarget.style.background = "transparent"; },
  });

  return (
    <div style={S.wrap} dir="rtl">
      <div style={S.inner}>
        {/* العنوان يبقى يمين */}
        <Link to={resolvedHome} style={S.title}>{title}</Link>

        {/* زر المنيو مثبت يسار الحافة لأن الحاوية بعرض كامل */}
        <div style={S.menu} ref={ref}>
          <button
            style={S.btn}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
          >
            ☰ القائمة
          </button>

          {open && (
            <div style={S.list} role="menu" onClick={(e) => e.stopPropagation()}>
              {me?.role === "ROLE_ADMIN" ? (
                <>
                  <Link to="/admin" {...hoverProps()} onClick={() => setOpen(false)}>
                    التصاريح المعلّقة
                  </Link>
                  <Link to="/admin/analytics" {...hoverProps()} onClick={() => setOpen(false)}>
                    لوحة الإحصائيات
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/user" {...hoverProps()} onClick={() => setOpen(false)}>
                    لوحة المستخدم
                  </Link>
                  <Link to="/user/permits" {...hoverProps()} onClick={() => setOpen(false)}>
                    سجل تصاريحي
                  </Link>
                  <Link to="/user/permits/new" {...hoverProps()} onClick={() => setOpen(false)}>
                    إضافة تصريح
                  </Link>
                </>
              )}
              <button {...hoverProps({ textAlign: "right" })} onClick={onLogout}>
                تسجيل خروج
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}