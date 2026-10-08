// XÁC NHẬN ĐẶT VÉ: hiển thị lại đúng đơn khách vừa chọn (đã được giữ nguyên sau khi đăng nhập/đăng ký).
import { Link, Navigate, useNavigate } from "react-router-dom";
import BookingSummary from "../../components/BookingSummary";
import StepProgress from "../../components/StepProgress";
import { useBooking } from "../../context/BookingContext";

export default function CheckoutPage() {
  const { booking, totals } = useBooking();
  const navigate = useNavigate();
  if (!booking.showtime || !booking.seats.length) return <Navigate to="/user/movies" replace />;

  return (
    <section className="narrow">
      <StepProgress current={1} />
      <h1 className="page-title">Xác nhận đặt vé</h1>
      <BookingSummary booking={booking} totals={totals} />
      <div className="actions">
        <Link className="btn btn-ghost" to={`/user/seats/${booking.showtime.id}`}>Đổi ghế</Link>
        <button className="btn btn-red" onClick={() => navigate("/user/food")}>Tiếp tục</button>
      </div>
    </section>
  );
}
