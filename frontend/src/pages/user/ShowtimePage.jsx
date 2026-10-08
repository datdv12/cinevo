// Chọn ngày → rạp → suất chiếu của một phim.
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorBox from "../../components/ErrorBox";
import Loading from "../../components/Loading";
import CitySelector from "../../components/CitySelector";
import { useBooking } from "../../context/BookingContext";
import { movieService } from "../../services/movieService";
import { WEEKDAYS, formatTime, nextDays, toISODate } from "../../utils/format";

export default function ShowtimePage() {
  const { movieId } = useParams();
  const { city } = useBooking();
  const days = useMemo(() => nextDays(5), []);
  const [date, setDate] = useState(toISODate(days[0]));
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { movieService.movie(movieId).then(setMovie).catch((e) => setError(e.message)); }, [movieId]);
  useEffect(() => {
    setShowtimes(null);
    movieService.showtimes({ movie_id: movieId, date, city }).then(setShowtimes).catch((e) => setError(e.message));
  }, [movieId, date, city]);

  const byCinema = (showtimes || []).reduce((acc, s) => ((acc[s.cinema.id] ||= { cinema: s.cinema, items: [] }).items.push(s), acc), {});

  return (
    <section>
      <h1 className="page-title">{movie ? `Suất chiếu: ${movie.title}` : "Suất chiếu"}</h1>
      <div className="toolbar"><span className="small">Khu vực:</span><CitySelector /></div>
      <div className="date-tabs" role="tablist">
        {days.map((d) => {
          const iso = toISODate(d);
          return (
            <button key={iso} role="tab" aria-selected={iso === date} className={`date-tab ${iso === date ? "active" : ""}`} onClick={() => setDate(iso)}>
              <small>{WEEKDAYS[d.getDay()]}</small><b>{d.getDate()}/{d.getMonth() + 1}</b>
            </button>
          );
        })}
      </div>
      <ErrorBox message={error} />
      {!showtimes && !error ? <Loading /> : Object.values(byCinema).length ? (
        Object.values(byCinema).map(({ cinema, items }) => (
          <article key={cinema.id} className="card">
            <h3>{cinema.name}</h3>
            <p className="muted small">{cinema.address}</p>
            <div className="time-grid">
              {items.map((s) => (
                <Link key={s.id} to={`/user/seats/${s.id}`} className="time-btn">
                  <b>{formatTime(s.start_time)}</b><small>{s.room.name} · {s.room.room_type}</small>
                </Link>
              ))}
            </div>
          </article>
        ))
      ) : showtimes && <div className="state-box">Không có suất chiếu trong ngày này. Hãy chọn ngày hoặc khu vực khác.</div>}
    </section>
  );
}
