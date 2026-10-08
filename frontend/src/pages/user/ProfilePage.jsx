import { useState } from "react";
import ErrorBox from "../../components/ErrorBox";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ full_name: user.full_name, phone: user.phone || "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const save = async (e) => {
    e.preventDefault(); setMsg(""); setError("");
    try { const d = await authService.updateMe(form); setUser(d.user); setMsg("Đã lưu thay đổi."); }
    catch (err) { setError(err.message); }
  };

  return (
    <section className="narrow">
      <h1 className="page-title">Hồ sơ cá nhân</h1>
      <form className="auth-panel plain" onSubmit={save}>
        <ErrorBox message={error} />
        {msg && <div className="success">{msg}</div>}
        <label>Email<input value={user.email} disabled /></label>
        <label>Họ và tên<input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
        <label>Số điện thoại<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <p className="muted small">Vai trò: {user.role} · Trạng thái: {user.status}</p>
        <button className="btn btn-red">Lưu thay đổi</button>
      </form>
    </section>
  );
}
