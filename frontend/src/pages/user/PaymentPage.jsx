// Thanh toán GIẢ LẬP: backend tạo Booking + Payment (PAID) và trả về mã vé.
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import BookingSummary from "../../components/BookingSummary";
import ErrorBox from "../../components/ErrorBox";
import StepProgress from "../../components/StepProgress";
import { useBooking } from "../../context/BookingContext";
import { bookingService } from "../../services/bookingService";
import { formatVND } from "../../utils/format";

const METHODS = [["QR", "Quét mã QR"], ["EWALLET", "Ví điện tử"], ["BANK", "Ngân hàng"]];

export default function PaymentPage() {
  const { booking, totals, setPaymentMethod, resetBooking } = useBooking();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [seatTaken, setSeatTaken] = useState(false);

  if (!booking.showtime || !booking.seats.length) return <Navigate to="/user/movies" replace />;

  const pay = async () => {
    setBusy(true); setError("");
    try {
      const b = await bookingService.create({
        showtime_id: booking.showtime.id,
        seat_ids: booking.seats.map((s) => s.id),
        foods: booking.foods.map((f) => ({ food_id: f.id, quantity: f.quantity })),
        payment_method: booking.paymentMethod,
      });
      resetBooking();
      navigate(`/user/booking-success/${b.code}`, { replace: true });
    } catch (e) {
      setError(e.message);
      setSeatTaken(e.code === "SEAT_TAKEN");
    } finally { setBusy(false); }
  };

  return (
    <section className="narrow">
      <StepProgress current={3} />
      <h1 className="page-title">Thanh toán</h1>
      <BookingSummary booking={booking} totals={totals} showFood />
      <h3>Phương thức</h3>
      <div className="list">
        {METHODS.map(([v, label]) => (
          <label key={v} className={`card radio ${booking.paymentMethod === v ? "active" : ""}`}>
            <input type="radio" name="pm" checked={booking.paymentMethod === v} onChange={() => setPaymentMethod(v)} /> {label}
          </label>
        ))}
      </div>
      <ErrorBox message={error} />
      {seatTaken && <button className="btn btn-outline" onClick={() => navigate(`/user/seats/${booking.showtime.id}`)}>Chọn lại ghế</button>}
      <p className="hint">Bản demo: thanh toán giả lập, không trừ tiền thật.</p>
      <button className="btn btn-red btn-block" disabled={busy} onClick={pay}>
        {busy ? "Đang xử lý..." : `Thanh toán ${formatVND(totals.total)}`}
      </button>
    </section>
  );
}
