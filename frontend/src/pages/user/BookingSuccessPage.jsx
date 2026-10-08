// Vé điện tử sau khi thanh toán: có mã vé + QR.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorBox from "../../components/ErrorBox";
import Loading from "../../components/Loading";
import TicketCard from "../../components/TicketCard";
import { bookingService } from "../../services/bookingService";

export default function BookingSuccessPage() {
  const { code } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { bookingService.detail(code).then(setTicket).catch((e) => setError(e.message)); }, [code]);

  if (error) return <ErrorBox message={error} />;
  if (!ticket) return <Loading />;
  return (
    <section className="narrow center">
      <h1 className="page-title">Đặt vé thành công</h1>
      <TicketCard ticket={ticket} />
      <div className="actions center-actions">
        <Link className="btn btn-outline" to="/user/my-tickets">Vé của tôi</Link>
        <Link className="btn btn-red" to="/user">Về trang chủ</Link>
      </div>
    </section>
  );
}
