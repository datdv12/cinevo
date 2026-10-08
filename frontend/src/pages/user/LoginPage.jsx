import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthPanel from "../../components/AuthPanel";
import { useBooking } from "../../context/BookingContext";

// Sau khi đăng nhập: ADMIN -> /admin, MANAGER -> /manager, USER -> trang trước đó hoặc /user.
export const redirectByRole = (user, from) =>
  user.role === "ADMIN" ? "/admin" : user.role === "MANAGER" ? "/manager" : from || "/user";

export default function LoginPage() {
  const navigate = useNavigate();
  const { booking } = useBooking();
  // Nếu đang có đơn đặt vé dở thì quay lại bước Xác nhận, không bắt chọn lại từ đầu.
  const from = useLocation().state?.from || (booking.seats.length ? "/user/checkout" : undefined);
  return (
    <section className="narrow">
      <AuthPanel initialView="login" onSuccess={(u) => navigate(redirectByRole(u, from), { replace: true })} />
      <p className="muted center small">Khách chưa cần đăng nhập để xem phim. <Link className="link" to="/user">Về trang chủ</Link></p>
    </section>
  );
}
