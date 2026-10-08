import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { useBooking } from "../../context/BookingContext";
import { movieService } from "../../services/movieService";

export default function CinemaListPage() {
  const { city } = useBooking();
  const [cinemas, setCinemas] = useState(null);

  useEffect(() => { setCinemas(null); movieService.cinemas(city).then(setCinemas).catch(() => setCinemas([])); }, [city]);

  return (
    <section>
      <h1 className="page-title">Hệ thống rạp{city && ` tại ${city}`}</h1>
      {!cinemas ? <Loading /> : cinemas.length ? (
        <div className="list">
          {cinemas.map((c) => (
            <article key={c.id} className="card">
              <h3>{c.name}</h3>
              <p className="muted">{c.address}</p>
              <p className="small">{c.city} · {c.phone}</p>
            </article>
          ))}
        </div>
      ) : <div className="state-box">Chưa có rạp tại khu vực này.</div>}
    </section>
  );
}
