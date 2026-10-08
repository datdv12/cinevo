// Lớp gọi API dùng chung: tự gắn JWT, tự ném lỗi có message tiếng Việt từ backend.
const BASE = import.meta.env.VITE_API_URL || "/api";
export const TOKEN_KEY = "cinevo_token";

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw Object.assign(new Error("Không kết nối được máy chủ. Hãy kiểm tra backend đang chạy."), { code: "NETWORK" });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.message || "Có lỗi xảy ra."), { status: res.status, code: data.code, data });
  }
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body }),
  put: (p, body) => request(p, { method: "PUT", body }),
};
