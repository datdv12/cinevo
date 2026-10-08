// Vé điện tử dạng "ticket stub": phần thông tin + đường đục lỗ + QR.
import { QRCodeSVG } from "qrcode.react";
import { formatDate, formatTime } from "../utils/format";

export default function TicketCard({ ticket }) {
  return (
    <div className="stub">
      <div className="stub-main">
        <div className="stub-brand">CINEVO</div>
        <h3>{ticket.movie.title}</h3>
        <p>{formatDate(ticket.start_time)} - {formatTime(ticket.start_time)}</p>
        <p>{ticket.cinema}</p>
        <p>{ticket.room} · Ghế {ticket.seats.join(", ")}</p>
        {ticket.foods.length > 0 && <p className="muted small">{ticket.foods.map((f) => `${f.name} ×${f.quantity}`).join(", ")}</p>}
      </div>
      <div className="stub-qr">
        <div className="qr-box"><QRCodeSVG value={ticket.qr_payload} size={132} /></div>
        <p>Mã vé</p><b>{ticket.code}</b>
      </div>
    </div>
  );
}
