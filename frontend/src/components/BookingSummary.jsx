import { formatDate, formatTime, formatVND } from "../utils/format";

// Khối tóm tắt đơn đặt vé: dùng ở Xác nhận, Đồ ăn, Thanh toán.
export default function BookingSummary({ booking, totals, showFood = false }) {
  const st = booking.showtime;
  return (
    <div className="ticket-card">
      <h3>{st.movie.title}</h3>
      <dl className="kv">
        <dt>Rạp</dt><dd>{st.cinema.name}</dd>
        <dt>Phòng</dt><dd>{st.room.name} ({st.room.room_type})</dd>
        <dt>Ngày</dt><dd>{formatDate(st.start_time)}</dd>
        <dt>Giờ</dt><dd>{formatTime(st.start_time)}</dd>
        <dt>Ghế</dt><dd>{booking.seats.map((s) => s.label).join(", ")}</dd>
      </dl>
      <div className="totals">
        <div><span>Tiền vé</span><b>{formatVND(totals.seatAmount)}</b></div>
        {showFood && (
          <>
            {booking.foods.map((f) => (
              <div key={f.id} className="muted"><span>{f.name} × {f.quantity}</span><span>{formatVND(f.price * f.quantity)}</span></div>
            ))}
            <div><span>Combo</span><b>{formatVND(totals.foodAmount)}</b></div>
            <div className="grand"><span>Tổng</span><b>{formatVND(totals.total)}</b></div>
          </>
        )}
      </div>
    </div>
  );
}
