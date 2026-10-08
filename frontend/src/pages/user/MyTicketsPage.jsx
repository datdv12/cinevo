// Vé của tôi: nhóm "Sắp tới" (có nút Xem QR) và "Đã xem".
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorBox from "../../components/ErrorBox";
import Loading from "../../components/Loading";
import TicketCard from "../../components/TicketCard";
import { bookingService } from "../../services/bookingService";
import { formatDate, formatTime } from "../../utils/format";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => { bookingService.mine().then(setTickets).catch((e) => setError(e.message)); }, []);
  if (error) return <ErrorBox message={error} />;
  if (!tickets) return <Loading />;

  const upcoming = tickets.filter((t) => t.is_upcoming);
  const past = tickets.filter((t) => !t.is_upcoming);

  const Row = ({ t, canQr }) => (
    <article className="card ticket-row">
      <div>
        <h3>{t.movie.title}</h3>
        <p className="muted small">{formatDate(t.start_time)} - {formatTime(t.start_time)} · {t.cinema}</p>
        <p className="small">Ghế {t.seats.join(", ")} · Mã vé {t.code}</p>
      </div>
      {canQr && <button className="btn btn-outline btn-sm" onClick={() => setOpen(t)}>Xem QR</button>}
    </article>
  );

  return (
    <section>
      <h1 className="page-title">Vé của tôi</h1>
      <h2 className="section-title">Sắp tới</h2>
      {upcoming.length ? upcoming.map((t) => <Row key={t.code} t={t} canQr />) : (
        <div className="state-box">Bạn chưa có vé sắp tới. <Link className="link" to="/user/movies">Đặt vé ngay</Link></div>
      )}
      <h2 className="section-title">Đã xem</h2>
      {past.length ? past.map((t) => <Row key={t.code} t={t} />) : <div className="state-box">Chưa có vé đã xem.</div>}

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(null)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpen(null)} aria-label="Đóng">×</button>
            <TicketCard ticket={open} />
          </div>
        </div>
      )}
    </section>
  );
}
