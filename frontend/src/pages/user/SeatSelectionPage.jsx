// Chọn ghế (có AI gợi ý). Khi bấm Tiếp tục: nếu CHƯA đăng nhập mới hiện popup đăng nhập/đăng ký.
// Sau khi đăng nhập xong, đơn đặt vé được giữ nguyên và đi thẳng tới trang Xác nhận.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorBox from "../../components/ErrorBox";
import Loading from "../../components/Loading";
import SeatMap from "../../components/SeatMap";
import StepProgress from "../../components/StepProgress";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";
import { aiService } from "../../services/aiService";
import { movieService } from "../../services/movieService";
import { formatDate, formatTime, formatVND } from "../../utils/format";

const MAX_SEATS = 8;

export default function SeatSelectionPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { requireLogin } = useAuth();
  const { booking, saveSeatSelection } = useBooking();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState([]);       // mảng seat object
  const [suggested, setSuggested] = useState([]);
  const [aiMsg, setAiMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    movieService.seatMap(showtimeId).then((d) => {
      setData(d);
      // Quay lại đúng suất chiếu đã chọn trước đó thì khôi phục ghế (loại ghế vừa bị người khác đặt).
      if (booking.showtime?.id === d.showtime.id)
        setSelected(booking.seats.filter((s) => d.seats.some((x) => x.id === s.id && !x.booked)));
    }).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showtimeId]);

  const toggle = (seat) => {
    setError("");
    setSelected((cur) => {
      if (cur.some((s) => s.id === seat.id)) return cur.filter((s) => s.id !== seat.id);
      if (cur.length >= MAX_SEATS) { setError(`Chọn tối đa ${MAX_SEATS} ghế.`); return cur; }
      return [...cur, seat];
    });
  };

  const askAi = async (count) => {
    setAiMsg("Đang tìm ghế đẹp...");
    try {
      const r = await aiService.recommendSeats(showtimeId, count);
      setAiMsg(r.message);
      setSuggested(r.seat_ids);
      if (r.seat_ids.length) setSelected(data.seats.filter((s) => r.seat_ids.includes(s.id)));
    } catch (e) { setAiMsg(e.message); }
  };

  const proceed = () => {
    if (!selected.length) return setError("Vui lòng chọn ít nhất 1 ghế.");
    saveSeatSelection(data.showtime, selected.map((s) => ({ id: s.id, label: s.label, type: s.type, price: s.price })));
    // CHỈ Ở ĐÂY mới yêu cầu đăng nhập: chưa đăng nhập -> popup; xong -> sang trang Xác nhận.
    requireLogin(() => navigate("/user/checkout"));
  };

  if (error && !data) return <ErrorBox message={error} />;
  if (!data) return <Loading />;
  const st = data.showtime;
  const total = selected.reduce((s, x) => s + x.price, 0);

  return (
    <section>
      <StepProgress current={0} />
      <h1 className="page-title">{st.movie.title}</h1>
      <p className="muted">{st.cinema.name} · {st.room.name} · {formatDate(st.start_time)} · {formatTime(st.start_time)}</p>

      <div className="ai-box">
        <b>Gợi ý ghế bằng AI</b>
        <button className="btn btn-outline btn-sm" onClick={() => askAi(1)}>1 người</button>
        <button className="btn btn-outline btn-sm" onClick={() => askAi(2)}>2 người</button>
        {aiMsg && <span className="muted small">{aiMsg}</span>}
      </div>

      <SeatMap seats={data.seats} selectedIds={selected.map((s) => s.id)} suggestedIds={suggested} onToggle={toggle} />
      <ErrorBox message={error} />

      <div className="sticky-bar">
        <div>
          <b>{selected.length ? selected.map((s) => s.label).join(", ") : "Chưa chọn ghế"}</b>
          <div className="muted small">Tạm tính: {formatVND(total)}</div>
        </div>
        <button className="btn btn-red" onClick={proceed}>Tiếp tục</button>
      </div>
    </section>
  );
}
