const BASE = "";

function makeError(j, res) {
  const msg = (j && (j.details || j.message || j.error)) || `HTTP ${res.status}`;
  const err = new Error(msg);
  if (j && typeof j === "object") err.details = j.details ?? j.error ?? j.message;
  err.status = res.status;
  return err;
}
async function handle(res) {
  if (res.ok) return res;
  try { const j = await res.json(); throw makeError(j, res); }
  catch { throw new Error(`HTTP ${res.status}`); }
}

export async function apiFetch(url, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  await handle(res);
  if (res.status === 204) return null;
  const ct = res.headers.get("Content-Type") || "";
  return ct.includes("application/json") ? res.json() : null;
}

export async function apiFetchMultipart(url, { files, token, attachmentType } = {}) {
  const fd = new FormData();
  for (const f of files || []) fd.append("files", f);
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const finalUrl = attachmentType ? `${url}?attachmentType=${encodeURIComponent(attachmentType)}` : url;
  const res = await fetch(`${BASE}${finalUrl}`, { method: "POST", headers, body: fd });
  await handle(res);
  if (res.status === 204) return null;
  const ct = res.headers.get("Content-Type") || "";
  return ct.includes("application/json") ? res.json() : null;
}

export { BASE };