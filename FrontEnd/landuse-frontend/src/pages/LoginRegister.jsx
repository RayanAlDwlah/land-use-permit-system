import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function LoginRegister() {
  const { token, me, setToken, setMe } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [f, setF] = useState({ username: "", password: "", email: "", nationalId: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (token && me) nav(me.role === "ROLE_ADMIN" ? "/admin" : "/user", { replace: true });
  }, [token, me]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      if (mode === "register") {
        await apiFetch("/api/auth/register", { method: "POST", body: f });
      }
      const j = await apiFetch("/api/auth/login", { method: "POST", body: { username: f.username, password: f.password } });
      localStorage.setItem("token", j.token);
      setToken(j.token);
      const meRes = await apiFetch("/api/auth/me", { token: j.token });
      setMe(meRes);
    } catch (e2) {
      setErr(e2.details || e2.message || "Error");
    } finally { setBusy(false); }
  };

  return (
    <div className="center">
      <div className="cardx" style={{ width: 440 }}>
        <div className="h1 text-center">نظام تصاريح استخدام الأراضي</div>

        {/* السويتش */}
        <div className="mb-4 d-flex justify-content-center">
          <button
            type="button"
            role="switch"
            aria-checked={mode === "login"}
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="auth-switch"
            aria-label="التبديل بين تسجيل الدخول وإنشاء حساب"
          >
            <span className={`auth-switch-knob ${mode === "login" ? "" : "move"}`} />
            <span className="auth-switch-label left">دخول</span>
            <span className="auth-switch-label right">إنشاء حساب</span>
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="mb-2">
            <label className="form-label">اسم المستخدم</label>
            <input className="inputx" value={f.username} onChange={e => setF({ ...f, username: e.target.value })} required minLength={3}/>
          </div>

          {mode === "register" && (
            <>
              <div className="mb-2">
                <label className="form-label">الإيميل</label>
                <input className="inputx" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
              </div>
              <div className="mb-2">
                <label className="form-label">الهوية/السجل التجاري</label>
                <input className="inputx" value={f.nationalId} onChange={e => setF({ ...f, nationalId: e.target.value })} required />
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label">كلمة المرور</label>
            <input className="inputx" type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required minLength={6}/>
          </div>

          {err && <div className="alert alert-danger py-2">{err}</div>}
          <button disabled={busy} className="btn btn-primary w-100">
            {busy ? "..." : mode === "login" ? "تسجيل دخول" : "إنشاء حساب"}
          </button>
        </form>
      </div>
    </div>
  );
}