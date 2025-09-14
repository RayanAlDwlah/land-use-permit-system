import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
/** Theme */
const C = {
  bg: "#0b1424",
  card: "#0f1b32",
  border: "#1f2a44",
  text: "#e6eefc",
  sub: "#9fb4d9",
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  indigo: "#6366f1",
  shadow: "0 10px 24px rgba(0,0,0,0.25)"
};

const API_SUMMARY = "/api/admin/reports/summary";
const API_PERMITS_PAGE = "/api/admin/permits/page";
const ROUTE_LIST = "/admin/permits";

const fmt = new Intl.NumberFormat("en-US");

const STATUS_META = [
  { key: "PENDING", label: "Pending", color: C.amber },
  { key: "APPROVED", label: "Approved", color: C.green },
  { key: "REJECTED", label: "Rejected", color: C.red },
  { key: "EDIT_REQUESTED", label: "Edit Requested", color: C.indigo },
];

function useAuthFetch() {
  return useCallback(async (url, init = {}) => {
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      ...init,
      headers: {
        "Accept": "application/json",
        ...(init.headers || {}),
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res;
  }, []);
}

/** Summary with fallback to /page counts */
function useSummary(fetcher) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    (async () => {
      try {
        let json = {};
        try {
          const r = await fetcher(API_SUMMARY);
          json = await r.json();
        } catch (_) { json = {}; }

        const keys = ["PENDING","APPROVED","REJECTED","EDIT_REQUESTED"];
        const needFallback = !json || (keys.every(k => !Number(json[k] || 0)) && !Number(json.TOTAL || 0));

        if (needFallback) {
          const counts = {};
          for (const k of keys) {
            const url = new URL(API_PERMITS_PAGE, window.location.origin);
            url.searchParams.set("status", k);
            url.searchParams.set("page", "0");
            url.searchParams.set("size", "1");
            const r = await fetcher(url.toString());
            const j = await r.json();
            const total = (typeof j.totalElements === "number")
              ? j.totalElements
              : (Array.isArray(j) ? j.length : (j.content?.length || 0));
            counts[k] = total;
          }
          counts.TOTAL = Object.values(counts).reduce((s, v) => s + Number(v || 0), 0);
          setState({ loading: false, error: null, data: counts });
        } else {
          setState({ loading: false, error: null, data: json });
        }
      } catch (e) {
        setState({ loading: false, error: e.message || String(e), data: null });
      }
    })();
  }, [fetcher]);

  return state;
}

function usePermits(fetcher, { status, size = 8 }) {
  const [state, setState] = useState({ loading: true, error: null, items: [] });
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(API_PERMITS_PAGE, window.location.origin);
        if (status) url.searchParams.set("status", status);
        url.searchParams.set("page", "0");
        url.searchParams.set("size", String(size));
        const r = await fetcher(url.toString());
        const j = await r.json();
        const items = Array.isArray(j) ? j : (j.content || []);
        setState({ loading: false, error: null, items });
      } catch (e) {
        setState({ loading: false, error: e.message || String(e), items: [] });
      }
    })();
  }, [fetcher, status, size]);
  return state;
}

/** UI bits */
function Card({ title, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        borderRadius: 16,
        padding: 16,
        background: C.card,
        boxShadow: C.shadow,
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "transform .15s ease",
        color: C.text,
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
      aria-label={`${title} ${value}`}
    >
      <div style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 800 }}>{fmt.format(value)}</div>
      <div style={{ marginTop: 6, height: 4, borderRadius: 999, background: "#0b1222", overflow: "hidden" }}>
        <div style={{ width: "100%", height: "100%", background: color, opacity: 0.5 }} />
      </div>
    </button>
  );
}

function Legend({ items, onPick }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onPick?.(it.key)}
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text, background: "transparent", border: 0, cursor: "pointer" }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 2, background: it.color }} />
          {it.label}
        </button>
      ))}
    </div>
  );
}

function DonutChart({ data, size = 240, strokeW = 26, onClickSegment }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const centered = size / 2;

  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={centered} cy={centered} r={radius} fill="none" stroke={C.border} strokeWidth={strokeW} />
      {data.map((d) => {
        const seg = (d.value / total) * circumference;
        const dash = `${seg} ${circumference - seg}`;
        const el = (
          <circle
            key={d.key}
            cx={centered}
            cy={centered}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={strokeW}
            strokeDasharray={dash}
            strokeDashoffset={-(acc)}
            strokeLinecap="butt"
            style={{ transition: "stroke-dashoffset .4s ease, stroke-dasharray .4s ease", cursor: "pointer" }}
            onClick={() => onClickSegment?.(d.key)}
          />
        );
        acc += seg;
        return el;
      })}
      <g transform={`translate(${centered}, ${centered})`} textAnchor="middle" pointerEvents="none">
        <text y="-4" style={{ fontSize: 28, fontWeight: 800, fill: C.text }}>{fmt.format(total)}</text>
        <text y="16" style={{ fontSize: 12, fill: C.sub }}>Total Permits</text>
      </g>
    </svg>
  );
}

function BarChart({ data, height = 240, onClickBar }) {
  const max = Math.max(1, ...data.map(d => d.value));
  const barW = 56;
  const gap = 20;
  const width = data.length * barW + (data.length - 1) * gap + 40;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <line x1="20" y1={height - 24} x2={width - 20} y2={height - 24} stroke={C.border} strokeWidth="1" />
      {data.map((d, i) => {
        const h = Math.round(((d.value / max) * (height - 56)));
        const x = 20 + i * (barW + gap);
        const y = (height - 24) - h;
        return (
          <g key={d.key} style={{ cursor: "pointer" }} onClick={() => onClickBar?.(d.key)}>
            <rect x={x} y={y} width={barW} height={h} rx="10" ry="10" fill={d.color} opacity="0.95" />
            <text x={x + barW / 2} y={height - 8} textAnchor="middle" style={{ fontSize: 11, fill: C.sub }}>
              {d.label.length > 10 ? d.label.slice(0, 10) + "…" : d.label}
            </text>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" style={{ fontSize: 12, fill: C.text, fontWeight: 700 }}>
              {fmt.format(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TablePanel({ title, rows, loading, error, onClickRow }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: C.shadow, padding: 16 }}>
      <div style={{ fontWeight: 800, color: C.text, marginBottom: 10 }}>{title}</div>
      {loading ? (
        <div style={{ fontSize: 13, color: C.sub }}>Loading…</div>
      ) : error ? (
        <div style={{ fontSize: 13, color: C.red }}>Failed: {error}</div>
      ) : rows.length === 0 ? (
        <div style={{ fontSize: 13, color: C.sub }}>No items.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: "#0b1527", color: C.sub, textAlign: "left" }}>
                <th style={{ padding: "10px 12px", fontSize: 12 }}>Created</th>
                <th style={{ padding: "10px 12px", fontSize: 12 }}>Status</th>
                <th style={{ padding: "10px 12px", fontSize: 12 }}>Type</th>
                <th style={{ padding: "10px 12px", fontSize: 12 }}>Applicant</th>
                <th style={{ padding: "10px 12px", fontSize: 12 }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, idx) => (
                <tr
                  key={p.id ?? idx}
                  onClick={() => onClickRow?.(p)}
                  style={{
                    background: idx % 2 ? "#0b1323" : "#0e1a2f",
                    cursor: "pointer",
                    borderBottom: `1px solid ${C.border}`,
                    color: C.text
                  }}
                >
                  <td style={{ padding: "10px 12px", fontSize: 12, color: C.sub }}>
                    {formatDate(p.createdAt)}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#0b1424",
                      background: badgeColor(p.status),
                      padding: "4px 8px",
                      borderRadius: 999
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{p.type ?? "-"}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{p.applicantName ?? "-"}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{p.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function badgeColor(status) {
  switch (status) {
    case "APPROVED": return C.green;
    case "REJECTED": return C.red;
    case "EDIT_REQUESTED": return C.indigo;
    case "PENDING": default: return C.amber;
  }
}
function formatDate(s) {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d.getTime())) return String(s);
  return d.toLocaleString();
}

export default function Analytics() {
  useEffect(() => { document.title = "Admin Analytics"; }, []);
  const navigate = useNavigate();
  const fetcher = useAuthFetch();
  const { loading, error, data } = useSummary(fetcher);

  const normalized = useMemo(() => {
    const raw = data || {};
    const items = STATUS_META.map(m => ({
      key: m.key,
      label: m.label,
      color: m.color,
      value: Number(raw[m.key] || 0),
    }));
    const total = Number(raw.TOTAL || items.reduce((s, d) => s + d.value, 0));
    return { items, total };
  }, [data]);

  const pending = usePermits(fetcher, { status: "PENDING", size: 8 });
  const approved = usePermits(fetcher, { status: "APPROVED", size: 8 });

  const gotoList = (status) => {
    const url = new URL(ROUTE_LIST, window.location.origin);
    if (status) url.searchParams.set("status", status);
    navigate(url.pathname + url.search);
  };

  /** Route by row.status */
  const routeByStatus = (row) => {
    if (!row) return;
    const id = row.id;
    const s = row.status;
    if (s === "PENDING" || s === "EDIT_REQUESTED") {
      navigate(`/admin/permits/${id}`);        // actions page
    } else {
      navigate(`/admin/permits/${id}/view`);   // read-only page
    }
  };

  const now = useMemo(() => new Date().toLocaleString(), []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* القائمة/الهيدر الموحد */}
      <TopBar title="" />
  
      {/* جسم الصفحة */}
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: C.text }}>Admin Analytics</h1>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>Innovation Team- By Rayan</div>
          </div>
          <div style={{ fontSize: 12, color: C.sub }}>Last updated: {now}</div>
        </div>
  
        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 16, marginBottom: 18 }}>
          {STATUS_META.map(meta => {
            const v = normalized.items.find(i => i.key === meta.key)?.value || 0;
            return (
              <Card key={meta.key} title={meta.label} value={v} color={meta.color} onClick={() => gotoList(meta.key)} />
            );
          })}
          <Card title="Total" value={normalized.total} color={C.blue} onClick={() => gotoList(undefined)} />
        </div>
  
        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 18 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: C.shadow, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, color: C.text, fontWeight: 800 }}>
              <div>Status Breakdown</div>
              <Legend items={STATUS_META} onPick={(k) => gotoList(k)} />
            </div>
            <div style={{ overflowX: "auto" }}>
              <BarChart data={normalized.items} onClickBar={(k) => gotoList(k)} />
            </div>
          </div>
  
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: C.shadow, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontWeight: 800, color: C.text, marginBottom: 8 }}>Total Distribution</div>
            <DonutChart data={normalized.items} onClickSegment={(k) => gotoList(k)} />
          </div>
        </div>
  
        {/* Tables */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <TablePanel
            title="Recently Approved"
            rows={approved.items}
            loading={approved.loading}
            error={approved.error}
            onClickRow={routeByStatus}
          />
          <TablePanel
            title="Pending Review"
            rows={pending.items}
            loading={pending.loading}
            error={pending.error}
            onClickRow={routeByStatus}
          />
        </div>
      </div>
  
      {/* overlays */}
      {loading && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(11,20,36,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: C.sub, fontWeight: 700, pointerEvents: "none"
        }}>
          Loading analytics…
        </div>
      )}
      {!!error && (
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          background: "#3a0d0d", color: "#ffd7d7",
          border: "1px solid #732a2a", borderRadius: 10, padding: "10px 14px",
          boxShadow: C.shadow
        }}>
          Failed to load summary: {error}
        </div>
      )}
    </div>
  );}