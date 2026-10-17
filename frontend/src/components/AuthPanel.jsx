// Form đăng nhập / đăng ký / OTP. Dùng cho cả popup lẫn trang /user/login, /user/register.
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import ErrorBox from "./ErrorBox";

const EMPTY_REG = { full_name: "", email: "", phone: "", password: "", confirm_password: "", accept_terms: false };

export default function AuthPanel({ initialView = "login", onSuccess }) {
  const { login, verifyOtp } = useAuth();
  const [view, setView] = useState(initialView);        // choice | login | register | otp
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [reg, setReg] = useState(EMPTY_REG);
  const [otp, setOtp] = useState({ email: "", masked: "", hint: "", digits: Array(6).fill("") });

  const go = (v) => { setView(v); setError(""); setEmailExists(false); };

  const run = async (fn) => {
    setBusy(true); setError("");
    try { await fn(); } catch (e) { setError(e.message); return e; } finally { setBusy(false); }
  };

  const submitLogin = (e) => {
    e.preventDefault();
    run(async () => {
      try { onSuccess?.(await login(loginForm.email, loginForm.password)); }
      catch (err) {
        if (err.code === "NOT_VERIFIED") { setOtp({ email: loginForm.email, masked: loginForm.email, hint: err.data?.otp_hint || "", digits: Array(6).fill("") }); go("otp"); }
        else throw err;
      }
    });
  };

  const submitRegister = (e) => {
    e.preventDefault();
    run(async () => {
      try {
        const d = await authService.register(reg);
        setOtp({ email: d.email, masked: d.masked_email, hint: d.otp_hint || "", digits: Array(6).fill("") });
        go("otp");
      } catch (err) {
        if (err.code === "EMAIL_EXISTS") setEmailExists(true);
        throw err;
      }
    });
  };

  const submitOtp = (e) => {
    e.preventDefault();
    run(async () => onSuccess?.(await verifyOtp(otp.email, otp.digits.join(""))));
  };

  const setDigit = (i, v) => {
    const digits = [...otp.digits];
    digits[i] = v.replace(/\D/g, "").slice(-1);
    setOtp({ ...otp, digits });
    if (digits[i] && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  if (view === "choice")
    return (
      <div className="auth-panel">
        <h2>Đăng nhập Cinevo</h2>
        <p className="muted">Bạn đã chọn ghế xong. Đăng nhập để giữ ghế và tiếp tục thanh toán. Đơn đặt vé của bạn được giữ nguyên.</p>
        <p>Bạn chưa có tài khoản?</p>
        <button className="btn btn-red btn-block" onClick={() => go("register")}>Đăng ký tài khoản</button>
        <p>Đã có tài khoản?</p>
        <button className="btn btn-outline btn-block" onClick={() => go("login")}>Đăng nhập</button>
      </div>
    );

  if (view === "login")
    return (
      <form className="auth-panel" onSubmit={submitLogin}>
        <h2>Đăng nhập</h2>
        <ErrorBox message={error} />
        <label>Email<input type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} /></label>
        <label>Mật khẩu<input type="password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} /></label>
        <button className="btn btn-red btn-block" disabled={busy}>{busy ? "Đang đăng nhập..." : "Đăng nhập"}</button>
        <p className="muted center">Chưa có tài khoản? <button type="button" className="link" onClick={() => go("register")}>Đăng ký</button></p>
      </form>
    );

  if (view === "register")
    return (
      <form className="auth-panel" onSubmit={submitRegister}>
        <h2>Tạo tài khoản Cinevo</h2>
        <ErrorBox message={emailExists ? "" : error} />
        {emailExists && (
          <div className="alert">
            Email này đã được sử dụng. Bạn đã có tài khoản?{" "}
            <button type="button" className="link" onClick={() => { setLoginForm({ ...loginForm, email: reg.email }); go("login"); }}>Đăng nhập</button>
          </div>
        )}
        <label>Họ và tên<input required value={reg.full_name} onChange={(e) => setReg({ ...reg, full_name: e.target.value })} /></label>
        <label>Email<input type="email" required value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} /></label>
        <label>Số điện thoại<input type="tel" required placeholder="09xxxxxxxx" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} /></label>
        <label>Mật khẩu<input type="password" required minLength={6} value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} /></label>
        <label>Nhập lại mật khẩu<input type="password" required value={reg.confirm_password} onChange={(e) => setReg({ ...reg, confirm_password: e.target.value })} /></label>
        <label className="checkbox"><input type="checkbox" checked={reg.accept_terms} onChange={(e) => setReg({ ...reg, accept_terms: e.target.checked })} /> Tôi đồng ý với điều khoản sử dụng</label>
        <button className="btn btn-red btn-block" disabled={busy || !reg.accept_terms}>{busy ? "Đang tạo..." : "Đăng ký"}</button>
        <p className="muted center">Đã có tài khoản? <button type="button" className="link" onClick={() => go("login")}>Đăng nhập</button></p>
      </form>
    );

  return (
    <form className="auth-panel" onSubmit={submitOtp}>
      <h2>Xác thực tài khoản</h2>
      <p className="muted">Mã xác thực đã được gửi tới <b>{otp.masked}</b></p>
      <ErrorBox message={error} />
      <div className="otp-row">
        {otp.digits.map((d, i) => (
          <input key={i} id={`otp-${i}`} inputMode="numeric" aria-label={`Số thứ ${i + 1}`} value={d} onChange={(e) => setDigit(i, e.target.value)} />
        ))}
      </div>
      {otp.hint && <p className="hint">Bản demo: mã xác thực là <b>{otp.hint}</b> (chưa gửi email thật).</p>}
      <button className="btn btn-red btn-block" disabled={busy || otp.digits.join("").length < 6}>{busy ? "Đang xác nhận..." : "Xác nhận"}</button>
    </form>
  );
}
