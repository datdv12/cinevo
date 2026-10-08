import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CitySelector from "./CitySelector";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/user" className="logo">CINE<span>VO</span></Link>
        <nav className="nav-links">
          <NavLink to="/user/movies">Phim</NavLink>
          <NavLink to="/user/cinemas">Rạp</NavLink>
          {user && <NavLink to="/user/my-tickets">Vé của tôi</NavLink>}
        </nav>
        <div className="nav-right">
          <CitySelector />
          {user ? (
            <>
              {user.role === "ADMIN" && <Link className="btn btn-ghost btn-sm" to="/admin">Quản trị</Link>}
              {user.role === "MANAGER" && <Link className="btn btn-ghost btn-sm" to="/manager">Quản lý rạp</Link>}
              <Link className="nav-user" to="/user/profile">{user.full_name}</Link>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/user"); }}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm" to="/user/login">Đăng nhập</Link>
              <Link className="btn btn-red btn-sm" to="/user/register">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
