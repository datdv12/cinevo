// Khung dùng chung cho Manager/Admin: thanh bên + nội dung.
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PanelLayout({ title, base, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="panel">
      <aside className="sidebar">
        <Link to="/user" className="logo">CINE<span>VO</span></Link>
        <p className="muted small">{title}</p>
        <nav>
          {links.map(([path, label]) => (
            <NavLink key={path} to={`${base}${path}`} end={path === ""}>{label}</NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p className="small">{user?.full_name}<br /><span className="muted">{user?.role}</span></p>
          <Link className="btn btn-ghost btn-sm" to="/user">Về trang khách</Link>
          <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/user/login"); }}>Đăng xuất</button>
        </div>
      </aside>
      <div className="panel-main"><Outlet /></div>
    </div>
  );
}
