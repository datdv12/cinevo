import { useEffect, useState } from "react";
import MovieCard from "../../components/MovieCard";
import Loading from "../../components/Loading";
import { useBooking } from "../../context/BookingContext";
import { movieService } from "../../services/movieService";

export default function MovieListPage() {
  const { city } = useBooking();
  const [tab, setTab] = useState("now_showing");
  const [q, setQ] = useState("");
  const [movies, setMovies] = useState(null);

  useEffect(() => {
    setMovies(null);
    const t = setTimeout(() => movieService.movies({ status: tab, q, city }).then(setMovies).catch(() => setMovies([])), 200);
    return () => clearTimeout(t);
  }, [tab, q, city]);

  return (
    <section>
      <h1 className="page-title">Phim</h1>
      <div className="toolbar">
        <div className="chips">
          <button className={`chip ${tab === "now_showing" ? "active" : ""}`} onClick={() => setTab("now_showing")}>Đang chiếu</button>
          <button className={`chip ${tab === "coming_soon" ? "active" : ""}`} onClick={() => setTab("coming_soon")}>Sắp chiếu</button>
        </div>
        <input className="search" placeholder="Tìm tên phim..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {!movies ? <Loading /> : movies.length ? (
        <div className="grid">{movies.map((m) => <MovieCard key={m.id} movie={m} />)}</div>
      ) : <div className="state-box">Không tìm thấy phim phù hợp.</div>}
    </section>
  );
}
